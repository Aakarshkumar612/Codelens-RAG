import traceback
import logging

from fastapi import APIRouter, HTTPException
from app.models import IngestRequest, IngestResponse
from app.services.ingestion import ingest

logger = logging.getLogger("codelens.ingest")
router = APIRouter()


@router.post("/ingest", response_model=IngestResponse)
async def ingest_repo(req: IngestRequest) -> IngestResponse:
    """Clone, chunk, embed, and index a GitHub / GitLab repository."""
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=422, detail="URL must not be empty.")

    # Normalise: add https:// if the user omitted the scheme
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    _lower = url.lower()
    if not ("github.com" in _lower or "gitlab.com" in _lower):
        raise HTTPException(
            status_code=422,
            detail="Only GitHub and GitLab repository URLs are supported.",
        )
    try:
        chunk_count = await ingest(url)
        return IngestResponse(
            status="ok",
            chunks=chunk_count,
            message=f"Indexed {chunk_count} chunks.",
        )
    except RuntimeError as e:
        logger.error("Ingestion RuntimeError: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        tb = traceback.format_exc()
        logger.error("Ingestion unhandled exception:\n%s", tb)
        print(f"\n❌ INGEST ERROR:\n{tb}", flush=True)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {e}")
