import boto3
import click
import json
import io
import os

from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel
from PIL import Image
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

    # Open and resize image
    image_path = f"notebooks/data/result-{magic_code}.png"
    with Image.open(image_path) as img:
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
        resize_and_upload_image(
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


if __name__ == "__main__":
    cli()
