"""Singleton wrapper around sentence-transformers.

The model is loaded once on first call and reused for all subsequent requests.
Loading takes ~3 s on first run (downloads ~90 MB); cached locally afterwards.
"""
from __future__ import annotations

from sentence_transformers import SentenceTransformer
from app.config import settings

_model: SentenceTransformer | None = None


def get_embedder() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.EMBED_MODEL)
    return _model


def embed(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts. Returns list of float vectors."""
    model = get_embedder()
    embeddings = model.encode(
        texts,
        batch_size=64,
        show_progress_bar=False,
        convert_to_numpy=True,
    )
    return embeddings.tolist()  # type: ignore[union-attr]


def embed_query(text: str) -> list[float]:
    """Embed a single query string."""
    model = get_embedder()
    return model.encode([text], convert_to_numpy=True)[0].tolist()  # type: ignore[index]
