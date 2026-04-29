"""Groq LLM service with streaming.

Uses the Groq Python SDK's async streaming API (OpenAI-compatible).
Falls back to a descriptive error if no API key is configured.
"""
from __future__ import annotations

from typing import AsyncIterator

from groq import AsyncGroq

from app.config import settings

_client: AsyncGroq | None = None

SYSTEM_PROMPT = """\
You are CodeLens, an expert AI assistant that helps developers deeply understand codebases.

You are given relevant code snippets retrieved from the indexed repository. Use them to answer precisely.

Rules:
- Reference specific files and line numbers whenever relevant (e.g. "`src/auth/login.py` line 42")
- Be concise and technically accurate
- Use fenced markdown code blocks for code examples
- When explaining code, explain the WHY, not just the WHAT
- If the retrieved context does not contain enough information to answer, say so explicitly — do not hallucinate
- Format lists and steps clearly with markdown
"""


def _get_client() -> AsyncGroq:
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    return _client


def _build_context(chunks: list[dict]) -> str:
    parts: list[str] = []
    for i, chunk in enumerate(chunks, 1):
        fp = chunk["file_path"]
        sl = chunk["start_line"]
        el = chunk["end_line"]
        parts.append(f"[{i}] {fp} (lines {sl}–{el})\n```\n{chunk['text']}\n```")
    return "\n\n".join(parts)


async def stream_response(
    query: str,
    chunks: list[dict],
    history: list[dict] | None = None,
) -> AsyncIterator[str]:
    if not settings.GROQ_API_KEY:
        msg = (
            "⚠️ **No Groq API key configured.**\n\n"
            "Add `GROQ_API_KEY=gsk_...` to `backend/.env` and restart the server.\n\n"
            f"_(Retrieved {len(chunks)} relevant code chunks for your query.)_"
        )
        for char in msg:
            yield char
        return

    context = _build_context(chunks)
    user_content = (
        f"Relevant code from the repository:\n\n{context}\n\n---\n\nQuestion: {query}"
        if chunks
        else f"Question: {query}"
    )

    # Build message list: system + last 10 history turns + current user message
    prior: list[dict] = (history or [])[-10:]
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *prior,
        {"role": "user", "content": user_content},
    ]

    client = _get_client()

    stream = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        max_tokens=2048,
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:
            yield delta.content
