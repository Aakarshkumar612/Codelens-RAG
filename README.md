# CodeLens RAG - Backend

This is the AI-powered codebase exploration backend for CodeLens RAG.

## Architecture
The project is currently in a "Headless" state. The frontend layer has been removed and is being redesigned.

### Components
- **API:** FastAPI
- **LLM:** Groq (Llama 3.3)
- **Vector DB:** ChromaDB
- **Embeddings:** Sentence-Transformers (Local)
- **Auth/Data:** Supabase

## Setup

1. **Environment:**
   Create a `.env` file in `backend/` based on `.env.example`.
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the API:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

## API Layers
1. **Ingest:** `/ingest` - Process GitHub/GitLab repositories.
2. **Files:** `/files` - Browse processed files.
3. **Chat:** `/chat` - RAG-based chat over the codebase.
