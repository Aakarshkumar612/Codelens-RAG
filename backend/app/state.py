from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class RepoState:
    url: str = ""
    path: Path | None = None
    is_indexed: bool = False
    chunk_count: int = 0


# Module-level singleton — one repo at a time (dev tool)
current_repo = RepoState()
