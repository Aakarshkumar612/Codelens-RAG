"""WebSocket chat endpoint.

Message protocol (JSON):
  Client → Server: { "query": str }
  Server → Client: { "token": str }          — streaming token
                   { "done": true }           — stream complete
                   { "error": str, "done": true } — on failure
"""
from __future__ import annotations

import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.config import settings
from app.services.embedder import embed_query
from app.services.retrieval import query_similar
from app.services.llm import stream_response

router = APIRouter()

MAX_HISTORY = 20  # max messages kept per session (10 exchanges)


@router.websocket("/chat")
async def chat_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    loop = asyncio.get_event_loop()

    # Per-connection conversation history: list of {"role", "content"}
    history: list[dict] = []

    try:
        while True:
            data = await websocket.receive_json()
            raw_query: str = (data.get("query") or "").strip()

            if not raw_query:
                continue

            # Embed query in thread-pool
            query_emb: list[float] = await loop.run_in_executor(
                None, embed_query, raw_query
            )

            # Retrieve relevant code chunks
            chunks = query_similar(query_emb, k=settings.RETRIEVAL_K)

            # Stream LLM response, accumulating full reply for history
            full_reply = ""
            async for token in stream_response(raw_query, chunks, history):
                await websocket.send_json({"token": token})
                full_reply += token

            # Send source reference if available
            if chunks:
                top = chunks[0]
                await websocket.send_json({
                    "highlight_line": top["start_line"],
                    "highlight_file": top["file_path"],
                })

            await websocket.send_json({"done": True})

            # Append this exchange to history (trim to MAX_HISTORY)
            history.append({"role": "user", "content": raw_query})
            history.append({"role": "assistant", "content": full_reply})
            if len(history) > MAX_HISTORY:
                history = history[-MAX_HISTORY:]

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        try:
            await websocket.send_json({"error": str(exc), "done": True})
        except Exception:
            pass
