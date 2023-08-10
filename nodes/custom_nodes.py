import datetime
import json
import numpy as np
import os
import sys
import yaml

sys.path.append("../../")

import folder_paths

from pydantic import BaseModel
from typing import Dict
from PIL import Image, ImageOps
from PIL.PngImagePlugin import PngInfo


IMAGE_SIZES = [
    ("tiny", (64, 64)),
    ("small", (256, 256)),
    ("medium", (512, 512)),
]


class StableSoapsMetadata(BaseModel):
    project: str
    adapter: str
    timestamp: str
    prompt: Dict


class StableSoapsSaveImage:
    def __init__(self):
        self.output_dir = folder_paths.get_output_directory()
        self.type = "output"

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "images": ("IMAGE",),
                "base_name": ("STRING", {"default": "stablesoaps"}),
                "adapter_name": ("STRING", {"default": ""}),
            },
            "hidden": {"prompt": "PROMPT", "extra_pnginfo": "EXTRA_PNGINFO"},
        }

    RETURN_TYPES = ()
    FUNCTION = "save_images"

    OUTPUT_NODE = True

    CATEGORY = "image"

    def save_images(
        self,
        images,
        base_name="stablesoaps",
        adapter_name="",
        prompt=None,
        extra_pnginfo=None,
    ):
        # First, add a timestamp onto the file prefix.
        current_date = datetime.datetime.now()
        timestamp_string = current_date.strftime("%y%m%d")
        filename_prefix = f"{base_name}_{adapter_name}_{timestamp_string}"
        # Get all the output metadata.  `filename` holds the result we want.
        (
            full_output_folder,
            filename,
            counter,
            subfolder,
            filename_prefix,
        ) = folder_paths.get_save_image_path(
            filename_prefix, self.output_dir, images[0].shape[1], images[0].shape[0]
        )
        results = list()
        for image in images:
            # Get the image.
            i = 255.0 * image.cpu().numpy()
            img = Image.fromarray(np.clip(i, 0, 255).astype(np.uint8))

            # The filename prefix to use for all variants.
            name = f"{filename}_{counter:05}"

            # Save an easier to read metadata file recording the prompt.
            custom_metadata = StableSoapsMetadata(
                project=base_name,
                adapter=adapter_name,
                timestamp=timestamp_string,
                prompt=prompt,
            )
            metadata_file = f"{name}.yaml"
            with open(os.path.join(full_output_folder, metadata_file), "w") as f:
                yaml.dump(custom_metadata.dict(), f)

            # Embed all the metadata.
            metadata = PngInfo()
            if prompt is not None:
                metadata.add_text("prompt", json.dumps(prompt))
            if extra_pnginfo is not None:
                for x in extra_pnginfo:
                    metadata.add_text(x, json.dumps(extra_pnginfo[x]))

            # Save the full file.
            full_file = f"{name}_full.png"
            img.save(
                os.path.join(full_output_folder, full_file),
                pnginfo=metadata,
                compress_level=4,
            )
            # Save the smaller versions.
            for suffix, new_size in IMAGE_SIZES:
                resized_img = img.resize(new_size)
                resized_file = f"{name}_{suffix}.png"
                resized_img.save(
                    os.path.join(full_output_folder, resized_file),
                    pnginfo=metadata,
                    compress_level=4,
                )

            # Append and return.
            results.append(
                {"filename": full_file, "subfolder": subfolder, "type": self.type}
            )
            # Increment this to make sure multiple images in a batch don't overwrite each other.
            counter += 1

        return {"ui": {"images": results}}


NODE_CLASS_MAPPINGS = {
    "StableSoapsSaveImage": StableSoapsSaveImage,
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "StableSoapsSaveImage": "Stable Save",
}
