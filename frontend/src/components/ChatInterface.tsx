"use client"

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent } from "react"
import { ArrowUp, RotateCcw, ExternalLink, Zap, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import ChatMessage from "@/components/ChatMessage"
import { createClient } from "@/lib/supabase/client"
import type { Message } from "@/app/chat/page"

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
  const messagesRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isStreaming = messages.some((m) => m.streaming)
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  // Focus textarea on mount and after every sent message
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isStreaming) {
      textareaRef.current?.focus()
    }
  }, [isStreaming])

  // Scroll messages to bottom on new message
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  const submit = () => {
    const text = input.trim()
    if (!text || isStreaming) return
    onSend(text)
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.focus()
    }
  }

  // Enter = send, Shift+Enter = newline
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  // Also handle form submit (fallback)
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const displayUrl = repoUrl.replace(/^https?:\/\//, "")

  return (
    <div className="flex flex-col h-full" style={{ background: "#020817" }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: "#0a1628", borderBottom: "1px solid #1a2f52" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
            style={{ background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.2)" }}
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
        <div className="flex items-center gap-1 shrink-0 ml-4">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
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
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ color: "#475569" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f87171"
              e.currentTarget.style.background = "#0f2040"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#475569"
              e.currentTarget.style.background = "transparent"
            }}
          >
            <LogOut className="w-3 h-3" />
            Sign out
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-4 py-8">
            <p className="text-sm" style={{ color: "#334155" }}>
              Repository indexed. Ask anything about it.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => { onSend(s); textareaRef.current?.focus() }}
                  className="text-left text-xs px-4 py-3 rounded-xl transition-all leading-relaxed"
                  style={{ color: "#475569", border: "1px solid #1a2f52", background: "transparent" }}
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
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 pb-5 pt-3"
        style={{ borderTop: "1px solid #0f2040", background: "#020817" }}
      >
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleFormSubmit}
            className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all cursor-text"
            style={{ background: "#0a1628", border: "1px solid #1a2f52" }}
            onClick={() => textareaRef.current?.focus()}
            onFocus={() => {
              const el = document.querySelector<HTMLDivElement>(".chat-input-form")
              if (el) {
                el.style.borderColor = "rgba(79,142,247,0.4)"
                el.style.boxShadow = "0 0 0 3px rgba(79,142,247,0.06)"
              }
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = "auto"
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"
              }}
              onKeyDown={handleKeyDown}
              onFocus={(e) => {
                const form = e.currentTarget.closest("form") as HTMLFormElement | null
                if (form) {
                  form.style.borderColor = "rgba(79,142,247,0.4)"
                  form.style.boxShadow = "0 0 0 3px rgba(79,142,247,0.06)"
                }
              }}
              onBlur={(e) => {
                const form = e.currentTarget.closest("form") as HTMLFormElement | null
                if (form) {
                  form.style.borderColor = "#1a2f52"
                  form.style.boxShadow = "none"
                }
              }}
              placeholder="Ask anything about this repository…"
              rows={1}
              disabled={isStreaming}
              autoComplete="off"
              className="flex-1 bg-transparent text-sm resize-none focus:outline-none disabled:opacity-50 leading-relaxed"
              style={{ maxHeight: "160px", overflowY: "auto", color: "#e2e8f0" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all"
              style={
                !input.trim() || isStreaming
                  ? { background: "#0f2040", color: "#334155" }
                  : {
                      background: "linear-gradient(135deg, #3b6cb7 0%, #4f8ef7 100%)",
                      color: "#fff",
                      boxShadow: "0 0 12px rgba(79,142,247,0.4)",
                    }
              }
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs text-center mt-2" style={{ color: "#1e3a6e" }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
