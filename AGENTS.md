# CodeLens RAG Agent Guidelines

This project focuses on a RAG (Retrieval-Augmented Generation) backend using FastAPI, ChromaDB, and Groq.

## Backend Guidelines
- Use Type Hints for all function signatures.
- Follow Pydantic models for request/response validation.
- Ensure all API routes are documented in `app/routes/`.
- Use the `app.config.settings` for configuration.
- Log significant events (Ingestion, Retrieval, Errors).
