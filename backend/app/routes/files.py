from fastapi import APIRouter, HTTPException, Query
from app.models import FileResponse
from app.state import current_repo
from app.utils import build_file_tree, detect_language

router = APIRouter()


@router.get("/tree")
async def get_tree() -> dict:
    """Return the file tree of the currently indexed repository."""
    if not current_repo.is_indexed or current_repo.path is None:
        raise HTTPException(status_code=404, detail="No repository indexed yet.")
    tree = build_file_tree(current_repo.path)
    return {"tree": tree}


@router.get("/file", response_model=FileResponse)
async def get_file(path: str = Query(..., description="Relative file path within the repo")) -> FileResponse:
    """Return the content and language of a single file."""
    if current_repo.path is None:
        raise HTTPException(status_code=404, detail="No repository indexed yet.")

    file_path = (current_repo.path / path).resolve()

    # Security: prevent path traversal
    try:
        file_path.relative_to(current_repo.path.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied.")

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail=f"File not found: {path}")

    try:
        content = file_path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read file: {e}")

    return FileResponse(content=content, language=detect_language(path))
