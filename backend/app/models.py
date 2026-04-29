from __future__ import annotations
from pydantic import BaseModel
from typing import Any


class IngestRequest(BaseModel):
    url: str


class IngestResponse(BaseModel):
    status: str
    chunks: int
    message: str = ""


class TreeNode(BaseModel):
    name: str
    path: str
    type: str  # "file" | "folder"
    children: list[TreeNode] | None = None
    language: str | None = None


class FileResponse(BaseModel):
    content: str
    language: str


class ChatPayload(BaseModel):
    query: str
    file: str | None = None
    context_line: dict[str, Any] | None = None
