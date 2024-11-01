import boto3
import click
import io
import json
import os
import requests

from dotenv import load_dotenv
from jinja2 import Template
from pathlib import Path
from pydantic import BaseModel
from stablesoaps.image_prep import (
    cm_to_pixels,
    create_avery_22807_label,
    create_details_label_circle,
    create_circular_image,
)
from PIL import Image, ImageFont
from typing import List


class LabelContentText(BaseModel):
    prompt_text: str
    label_text: str
    magic_code: str


class ResizeDetail(BaseModel):
    suffix: str
    width: int
    height: int


@click.group()
def cli():
    load_dotenv()


def resize_and_upload_image(
    img: Image,
    magic_code: str,
    bucket_name: str,
    resize_details: List[ResizeDetail],
    quality: int = 85,
) -> List[dict]:
    # Initialize S3 client
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION"),
    )

    if img.mode == "RGBA":
        img = img.convert("RGB")

    buffer = io.BytesIO()
    img.save(
        buffer,
        format="PNG",
        optimize=True,
        quality=quality,
    )
    buffer.seek(0)

    s3_client.upload_fileobj(
        buffer,
        bucket_name,
        f"images/{magic_code}.png",
        ExtraArgs={"ContentType": "image/png"},
    )

    for resize_detail in resize_details:
        img_resize = img.copy()

        # Resize image maintaining aspect ratio
        img_resize.thumbnail(
            (resize_detail.width, resize_detail.height),
            Image.Resampling.LANCZOS,
        )

        # Save to bytes buffer
        buffer = io.BytesIO()
        img_resize.save(
            buffer,
            format="PNG",
            optimize=True,
            quality=quality,
        )
        buffer.seek(0)
        s3_client.upload_fileobj(
            buffer,
            bucket_name,
            f"images/{magic_code}_{resize_detail.suffix}.png",
            ExtraArgs={"ContentType": "image/png"},
        )


class LabelContent(BaseModel):
    magicCode: str
    prompt: str


@cli.command()
@click.option(
    "--label_contents",
    required=True,
    type=Path,
)
@click.option(
    "--url",
    required=True,
    type=str,
)
@click.option(
    "--bucket",
    "-b",
    required=True,
    help="S3 bucket to upload to",
)
@click.option(
    "--num_steps",
    default=20,
    help="Number of inference steps to use",
)
def create_images(
    label_contents: Path,
    url: str,
    bucket: str,
    num_steps: int,
):
    label_contents_list = []
    with open(label_contents) as f:
        json_data = json.load(f)
        for d in json_data:
            label_contents_list.append(LabelContent(**d))

    for label in label_contents_list:
        response = requests.post(
            f"{url}/txt2img",
            json={
                "prompt": label.prompt,
                "num_inference_steps": num_steps,
            },
            stream=True,
        )
        image_path = f"/tmp/{label.magicCode}.png"
        with open(image_path, "wb") as file:
            file.write(response.content)
        image = Image.open(image_path)
        resize_and_upload_image(
            image,
            label.magicCode,
            bucket,
            [
                ResizeDetail(
                    suffix="small",
                    width="256",
                    height="256",
                ),
                ResizeDetail(
                    suffix="medium",
                    width="512",
                    height="512",
                ),
            ],
        )


@cli.command()
@click.argument(
    "label_contents",
    type=Path,
)
@click.option(
    "--bucket",
    "-b",
    required=True,
    help="S3 bucket to update",
)
def cp(
    label_contents: Path,
    bucket: str,
):
    label_content_list = []
    with open(label_contents) as f:
        json_data = json.load(f)
        for d in json_data:
            label_content_list.append(LabelContentText(**d))
    for label_content in label_content_list:
        image_path = f"notebooks/data/result-{label_content.magic_code}.png"
        image = Image.open(image_path)
        resize_and_upload_image(
            image,
            label_content.magic_code,
            bucket,
            [
                ResizeDetail(
                    suffix="small",
                    width="256",
                    height="256",
                ),
                ResizeDetail(
                    suffix="medium",
                    width="512",
                    height="512",
                ),
            ],
        )


class BatchSoapLabel(BaseModel):
    magicCode: str
    prompt: str
    story: str
    name: str
    ingredients: List[str]


@cli.command()
@click.argument(
    "input_path",
    type=Path,
)
@click.argument(
    "output_prefix",
    type=str,
)
def create_label_sheets(
    input_path: Path,
    output_prefix: str,
):
    batch_soap_labels = []
    with open(input_path) as f:
        json_data = json.load(f)
        for d in json_data:
            batch_soap_labels.append(BatchSoapLabel(**d))

    external_label_template = Template(
        """{{ name }}

Ingredients: {{ ingredients }}

Story:
{{story_text}}"""
    )
    internal_label_template = Template(
        """{{ name }} 

magic code: {{ magic_code }}

Ingredients: {{ ingredients }}

Story:
{{story_text}}"""
    )

    label_size_px = cm_to_pixels(5)
    font_size = 24
    font = ImageFont.truetype("NotoSansSC-Regular.ttf", font_size)

    stickers = []
    for batch_soap_label in batch_soap_labels:
        stickers.append(
            create_circular_image(
                Image.open(
                    f"notebooks/data/result-{batch_soap_label.magicCode}.png"
                ),
                label_size_px,
            )
        )
        stickers.append(
            create_details_label_circle(
                external_label_template.render(
                    name=batch_soap_label.name,
                    ingredients=".".join(batch_soap_label.ingredients),
                    story_text=batch_soap_label.story,
                ),
                label_size_px,
                font,
                font_size,
                "lightgray",
                wrap_factor=2.5,
            )
        )
        stickers.append(
            create_details_label_circle(
                internal_label_template.render(
                    name=batch_soap_label.name,
                    ingredients=".".join(batch_soap_label.ingredients),
                    story_text=batch_soap_label.story,
                    magic_code=batch_soap_label.magicCode,
                ),
                label_size_px,
                font,
                font_size,
                "lightblue",
                wrap_factor=2.5,
            )
        )

    sheets = create_avery_22807_label(
        stickers,
    )
    for idx, sheet in enumerate(sheets):
        sheet.save(
            f"{output_prefix}_{idx}.pdf",
            "PDF",
            resolution=300,
            save_all=True,
        )


if __name__ == "__main__":
    cli()
