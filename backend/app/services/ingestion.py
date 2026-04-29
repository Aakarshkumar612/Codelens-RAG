"""Repository ingestion pipeline.

Flow:
  1. Normalize & validate the URL
  2. Shallow-clone the repo (git clone --depth=1)
  3. Walk all indexable files
  4. Chunk each file into overlapping line windows
  5. Batch-embed all chunks with sentence-transformers
  6. Upsert into ChromaDB
  7. Update global RepoState
"""
from __future__ import annotations

import asyncio
import os
import re
import shutil
import stat
import subprocess
from pathlib import Path

from app.config import settings
from app.state import current_repo
from app.utils import SKIP_DIRS, SKIP_EXTENSIONS, SKIP_FILES


# ── URL normalisation ────────────────────────────────────────────────────────

_GITHUB_RE = re.compile(
    r"(https://(?:github|gitlab)\.com/[^/]+/[^/?#]+?)(?:\.git|/.*)?$"
)


def normalize_clone_url(url: str) -> str:
    """Return a bare .git clone URL from any GitHub / GitLab URL variant."""
    m = _GITHUB_RE.match(url.strip())
    if m:
        return m.group(1) + ".git"
    # Passthrough for already-bare URLs or other hosts
    return url.strip()


def repo_name_from_url(url: str) -> str:
    """Extract a filesystem-safe repo name from the URL."""
    base = url.rstrip("/").removesuffix(".git").rsplit("/", 1)[-1]
    return re.sub(r"[^a-zA-Z0-9_.-]", "_", base) or "repo"


# ── Cloning ──────────────────────────────────────────────────────────────────

def _force_remove(dest: Path) -> None:
    """Remove a directory tree, forcing read-only files writable first (needed for .git on Windows)."""
    def _on_error(func, path, _exc):
        try:
            os.chmod(path, stat.S_IWRITE)
            func(path)
        except Exception:
            pass
    if dest.exists():
        shutil.rmtree(dest, onerror=_on_error)


def _git_clone_sync(clone_url: str, dest: Path) -> None:
    """Synchronous git clone — called inside a thread executor."""
    git = shutil.which("git")
    if not git:
        raise RuntimeError(
            "git is not installed or not in PATH. "
            "Install Git for Windows from https://git-scm.com/download/win"
        )
    _force_remove(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)

    result = subprocess.run(
        [git, "clone", "--depth=1", "--single-branch", clone_url, str(dest)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"git clone failed: {result.stderr.strip()}")


async def clone(clone_url: str, dest: Path) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _git_clone_sync, clone_url, dest)


# ── File walking ─────────────────────────────────────────────────────────────

def walk_indexable_files(repo_path: Path) -> list[Path]:
    files: list[Path] = []
    max_bytes = settings.MAX_FILE_KB * 1024

    for root, dirs, filenames in os.walk(repo_path):
        # Prune skip-dirs in-place so os.walk won't descend into them
        dirs[:] = [
            d for d in dirs
            if d not in SKIP_DIRS and not d.startswith(".")
        ]
        for fname in filenames:
            if fname in SKIP_FILES:
                continue
            fp = Path(root) / fname
            ext = fp.suffix.lower()
            if ext in SKIP_EXTENSIONS:
                continue
            try:
                if fp.stat().st_size > max_bytes:
                    continue
            except OSError:
                continue
            files.append(fp)

    return files


# ── Chunking ─────────────────────────────────────────────────────────────────

def chunk_file(rel_path: str, content: str) -> list[dict]:
    """Split a file into overlapping line windows."""
    lines = content.splitlines()
    if not lines:
        return []

    step = max(1, settings.LINES_PER_CHUNK - settings.CHUNK_OVERLAP)
    chunks: list[dict] = []

    for i in range(0, len(lines), step):
        end = min(i + settings.LINES_PER_CHUNK, len(lines))
        window = "\n".join(lines[i:end])
        if not window.strip():
            continue

        chunk_id = f"{rel_path}|{i}|{end}"
        full_text = f"# File: {rel_path}\n# Lines {i + 1}–{end}\n\n{window}"

        chunks.append({
            "id": chunk_id,
            "text": full_text,
            "metadata": {
                "file_path": rel_path,
                "start_line": i + 1,
                "end_line": end,
            },
        })

    return chunks


# ── Main pipeline ─────────────────────────────────────────────────────────────

async def ingest(url: str) -> int:
    """Full ingestion pipeline. Returns number of chunks indexed."""
    from app.services.embedder import embed
    from app.services.retrieval import reset_collection, upsert_chunks

    clone_url = normalize_clone_url(url)
    repo_dir = Path(settings.REPOS_DIR) / repo_name_from_url(clone_url)

    # 1. Clone
    await clone(clone_url, repo_dir)

    # 2. Walk
    files = walk_indexable_files(repo_dir)
    if not files:
        raise RuntimeError("No indexable text files found in the repository.")

    # 3. Chunk
    all_chunks: list[dict] = []
    for fp in files:
        try:
            content = fp.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        rel = str(fp.relative_to(repo_dir)).replace("\\", "/")
        all_chunks.extend(chunk_file(rel, content))

    if not all_chunks:
        raise RuntimeError("No content produced after chunking.")

    # 4. Embed (CPU-bound → run in executor to avoid blocking the event loop)
    loop = asyncio.get_event_loop()
    texts = [c["text"] for c in all_chunks]
    embeddings: list[list[float]] = await loop.run_in_executor(None, embed, texts)

    # 5. Store
    reset_collection()
    upsert_chunks(
        ids=[c["id"] for c in all_chunks],
        embeddings=embeddings,
        documents=texts,
        metadatas=[c["metadata"] for c in all_chunks],
    )

    # 6. Update global state
    current_repo.url = url
    current_repo.path = repo_dir
    current_repo.is_indexed = True
    current_repo.chunk_count = len(all_chunks)

    return len(all_chunks)
