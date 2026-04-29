"""ChromaDB vector store wrapper.

One persistent collection is maintained per server run. Calling
`reset_collection()` before each ingestion ensures a clean index.
"""
from __future__ import annotations

import chromadb
from app.config import settings

_client: chromadb.ClientAPI | None = None
_collection: chromadb.Collection | None = None

COLLECTION_NAME = "codelens_chunks"


def _get_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=settings.CHROMA_DIR)
    return _client


def get_collection() -> chromadb.Collection:
    global _collection
    if _collection is None:
        client = _get_client()
        _collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def reset_collection() -> chromadb.Collection:
    """Delete and recreate the collection — call before each new ingest."""
    global _collection
    client = _get_client()
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
    _collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )
    return _collection


def upsert_chunks(
    ids: list[str],
    embeddings: list[list[float]],
    documents: list[str],
    metadatas: list[dict],
) -> None:
    """Batch-upsert chunks. ChromaDB has an internal limit so we page at 500."""
    col = get_collection()
    page = 500
    for i in range(0, len(ids), page):
        col.upsert(
            ids=ids[i : i + page],
            embeddings=embeddings[i : i + page],
            documents=documents[i : i + page],
            metadatas=metadatas[i : i + page],
        )


def query_similar(embedding: list[float], k: int = 8) -> list[dict]:
    """Return up to k most similar chunks as dicts."""
    col = get_collection()
    count = col.count()
    if count == 0:
        return []

    results = col.query(
        query_embeddings=[embedding],
        n_results=min(k, count),
        include=["documents", "metadatas", "distances"],
    )

    chunks: list[dict] = []
    docs = results.get("documents") or [[]]
    metas = results.get("metadatas") or [[]]
    dists = results.get("distances") or [[]]

    for doc, meta, dist in zip(docs[0], metas[0], dists[0]):
        chunks.append({
            "text": doc,
            "file_path": meta.get("file_path", ""),
            "start_line": int(meta.get("start_line", 1)),
            "end_line": int(meta.get("end_line", 1)),
            "score": round(1.0 - float(dist), 4),
        })

    return chunks
