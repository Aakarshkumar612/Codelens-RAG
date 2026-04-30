"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import LandingInput from "@/components/LandingInput"
import ChatInterface from "@/components/ChatInterface"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  streaming?: boolean
}

type Phase = "landing" | "ingesting" | "ready"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000"

export default function Page() {
  const [phase, setPhase] = useState<Phase>("landing")
  const [repoUrl, setRepoUrl] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState("")
  const wsRef = useRef<WebSocket | null>(null)

  const connectWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(`${WS_BASE}/chat`)

    ws.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data as string)

      if (data.token) {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last?.role === "assistant" && last.streaming) {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + (data.token as string) },
            ]
          }
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: data.token as string,
              streaming: true,
            },
          ]
        })
      }

      if (data.done) {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last?.role === "assistant") {
            return [...prev.slice(0, -1), { ...last, streaming: false }]
          }
          return prev
        })
      }

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Something went wrong: ${data.error as string}`,
            streaming: false,
          },
        ])
      }
    }

    ws.onerror = () => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Connection error. Make sure the backend is running.",
          streaming: false,
        },
      ])
    }

    wsRef.current = ws
  }, [])

  const handleAnalyze = async (url: string) => {
    setError("")
    setPhase("ingesting")
    try {
      const res = await fetch(`${API}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { detail?: string }
        throw new Error(err.detail ?? "Ingestion failed")
      }
      setRepoUrl(url)
      connectWs()
      setPhase("ready")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setPhase("landing")
    }
  }

  const sendQuery = useCallback((query: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: query },
    ])
    wsRef.current.send(JSON.stringify({ query }))
  }, [])

  const handleSend = useCallback(
    (query: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendQuery(query)
      } else {
        connectWs()
        setTimeout(() => sendQuery(query), 400)
      }
    },
    [connectWs, sendQuery],
  )

  const handleReset = () => {
    wsRef.current?.close()
    wsRef.current = null
    setMessages([])
    setRepoUrl("")
    setError("")
    setPhase("landing")
  }

  useEffect(() => {
    return () => {
      wsRef.current?.close()
    }
  }, [])

  return (
    <main className="h-screen flex flex-col">
      {phase === "landing" || phase === "ingesting" ? (
        <LandingInput
          onAnalyze={handleAnalyze}
          loading={phase === "ingesting"}
          error={error}
        />
      ) : (
        <ChatInterface
          messages={messages}
          onSend={handleSend}
          repoUrl={repoUrl}
          onReset={handleReset}
        />
      )}
    </main>
  )
}
