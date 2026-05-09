"""CodeLens RAG — FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

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

# Mount static files
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(ingest.router)
app.include_router(files.router)
app.include_router(chat.router)


@app.get("/", tags=["frontend"])
async def read_index():
    return FileResponse(os.path.join(static_dir, "index.html"))


@app.get("/dashboard", tags=["frontend"])
async def read_dashboard():
    return FileResponse(os.path.join(static_dir, "dashboard.html"))


@app.get("/ingest-page", tags=["frontend"])
async def read_ingest_page():
    return FileResponse(os.path.join(static_dir, "ingest.html"))


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
