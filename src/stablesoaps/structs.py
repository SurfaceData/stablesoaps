from pydantic import BaseModel
from pathlib import Path
from typing import List


class ModelAdapter(BaseModel):
    name: str
    url: str
    keywords: List[str] = []
    type: str


class ModelCheckpoint(BaseModel):
    repo: str
    model: str


class ModelPack(BaseModel):
    name: str
    checkpoints: List[ModelCheckpoint]
    adapters: List[ModelAdapter]
    rejected_adapters: List[ModelAdapter]
