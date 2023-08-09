import argparse
import yaml

from pathlib import Path

from stablesoaps.structs import ModelPack
from stablesoaps.utils import download


parser = argparse.ArgumentParser(
    description="Download stable diffusion checkpoints and adapters"
)

parser.add_argument(
    "config_file", type=argparse.FileType("r"), help="Path to a yaml configuration"
)
parser.add_argument(
    "--output_path", default="./", type=Path, help="Base output path to write results"
)

args = parser.parse_args()

with args.config_file as f:
    config = yaml.safe_load(f)
    models = [ModelPack.parse_obj(mp_dict) for mp_dict in config["models"]]


checkpoint_base = args.output_path / "models/checkpoints"
checkpoint_base.mkdir(parents=True, exist_ok=True)
lora_base = args.output_path / "models/loras"
lora_base.mkdir(parents=True, exist_ok=True)

for model_pack in models:
    for checkpoint in model_pack.checkpoints:
        source = (
            f"https://huggingface.co/{checkpoint.repo}/resolve/main/{checkpoint.model}"
        )
        destination = checkpoint_base / checkpoint.model
        download(source, destination)
    for adapter in model_pack.adapters:
        source = adapter.url
        destination = (
            lora_base / f"{model_pack.name}_{adapter.type}-{adapter.name}.safetensors"
        )
        download(source, destination)
