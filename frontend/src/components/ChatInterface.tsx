"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { ArrowUp, RotateCcw, ExternalLink, Zap } from "lucide-react"
import ChatMessage from "@/components/ChatMessage"
import type { Message } from "@/app/page"

interface Props {
  messages: Message[]
  onSend: (query: string) => void
  repoUrl: string
  onReset: () => void
}

const SUGGESTIONS = [
  "Give me an overview of this repository",
  "What are the main entry points?",
  "Explain the folder structure",
  "What does this project do?",
]

export default function ChatInterface({ messages, onSend, repoUrl, onReset }: Props) {
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isStreaming = messages.some((m) => m.streaming)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const submit = () => {
    if (!input.trim() || isStreaming) return
    onSend(input.trim())
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const displayUrl = repoUrl.replace(/^https?:\/\//, "")

  return (
    <div className="flex flex-col h-full" style={{ background: "#020817" }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{
          background: "#0a1628",
          borderBottom: "1px solid #1a2f52",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
            style={{
              background: "rgba(79,142,247,0.12)",
              border: "1px solid rgba(79,142,247,0.2)",
            }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: "#4f8ef7" }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
            CodeLens RAG
          </span>
          <span style={{ color: "#1e3a6e" }}>·</span>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm truncate transition-colors"
            style={{ color: "#475569" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#4f8ef7")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
          >
            <span className="truncate">{displayUrl}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all shrink-0 ml-4"
          style={{ color: "#475569" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#94a3b8"
            e.currentTarget.style.background = "#0f2040"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#475569"
            e.currentTarget.style.background = "transparent"
          }}
        >
          <RotateCcw className="w-3 h-3" />
          New repo
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-4 py-8">
            <p className="text-sm" style={{ color: "#334155" }}>
              Repository indexed. Ask anything about it.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => onSend(s)}
                  className="text-left text-xs px-4 py-3 rounded-xl transition-all leading-relaxed"
                  style={{
                    color: "#475569",
                    border: "1px solid #1a2f52",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#2a4d8f"
                    e.currentTarget.style.color = "#94a3b8"
                    e.currentTarget.style.background = "#0a1628"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#1a2f52"
                    e.currentTarget.style.color = "#475569"
                    e.currentTarget.style.background = "transparent"
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 pb-5 pt-3"
        style={{
          borderTop: "1px solid #0f2040",
          background: "#020817",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all"
            style={{ background: "#0a1628", border: "1px solid #1a2f52" }}
            onFocusCapture={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderColor = "rgba(79,142,247,0.4)"
              el.style.boxShadow = "0 0 0 3px rgba(79,142,247,0.06)"
            }}
            onBlurCapture={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderColor = "#1a2f52"
              el.style.boxShadow = "none"
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask anything about this repository…"
              rows={1}
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm resize-none focus:outline-none disabled:opacity-50 leading-relaxed"
              style={{ maxHeight: "160px", overflowY: "auto", color: "#e2e8f0" }}
              onInput={(e) => {
                const t = e.currentTarget
                t.style.height = "auto"
                t.style.height = Math.min(t.scrollHeight, 160) + "px"
              }}
            />
            <button
              onClick={submit}
              disabled={!input.trim() || isStreaming}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all"
              style={
                !input.trim() || isStreaming
                  ? { background: "#0f2040", color: "#334155" }
                  : {
                      background:
                        "linear-gradient(135deg, #3b6cb7 0%, #4f8ef7 100%)",
                      color: "#fff",
                      boxShadow: "0 0 12px rgba(79,142,247,0.4)",
                    }
              }
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
          <p
            className="text-xs text-center mt-2"
            style={{ color: "#1e3a6e" }}
          >
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
