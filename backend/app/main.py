"""CodeLens RAG — FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import ingest, files, chat
from app.services.embedder import get_embedder


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load the embedding model so the first /ingest isn't slow
    print("⏳ Loading embedding model…")
    get_embedder()
    print("✅ Embedding model ready.")
    yield
    # Nothing to clean up


app = FastAPI(
    title="CodeLens RAG API",
    description="AI-powered codebase exploration backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)
app.include_router(files.router)
app.include_router(chat.router)


@app.get("/health", tags=["meta"])
async def health() -> dict:
    return {"status": "ok"}


@app.get("/status", tags=["meta"])
async def status() -> dict:
    from app.state import current_repo
    return {
        "indexed": current_repo.is_indexed,
        "url": current_repo.url,
        "chunks": current_repo.chunk_count,
    }
