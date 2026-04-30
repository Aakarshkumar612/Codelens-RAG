"use client"

import { useEffect, useState, useRef } from "react"
import { Zap } from "lucide-react"

const DEMO_LINES = [
  { type: "url",    text: "https://github.com/fastapi/fastapi" },
  { type: "status", text: "Cloning repository…" },
  { type: "status", text: "Indexing 2,847 chunks — done in 18s ✓" },
  { type: "user",   text: "Give me an overview of this project." },
  { type: "ai",     text: "FastAPI is a modern, high-performance web framework for building APIs with Python 3.8+. It's built on top of Starlette (for web parts) and Pydantic (for data validation). The core entry point is `fastapi/applications.py`, which defines the `FastAPI` class. Key design patterns: dependency injection via `Depends()`, automatic OpenAPI schema generation, and async-first routing. The `/fastapi/routing.py` file handles request dispatch and is worth reading first." },
  { type: "user",   text: "How does dependency injection work?" },
  { type: "ai",     text: "Dependencies are declared as function parameters using `Depends()`. When a route is called, FastAPI resolves the dependency graph in `fastapi/dependencies/utils.py` — line 412 is the main resolver. Dependencies can be nested, async, and cached per-request via `use_cache=True`." },
]

const TYPING_SPEED = 18
const PAUSE_AFTER = 600
const LOOP_PAUSE = 4000

export default function TerminalDemo() {
  const [lines, setLines] = useState<typeof DEMO_LINES[0][]>([])
  const [currentText, setCurrentText] = useState("")
  const [phase, setPhase] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [running, setRunning] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!running || phase >= DEMO_LINES.length) {
      if (phase >= DEMO_LINES.length) {
        const t = setTimeout(() => {
          setLines([])
          setCurrentText("")
          setPhase(0)
          setCharIndex(0)
          setRunning(true)
        }, LOOP_PAUSE)
        return () => clearTimeout(t)
      }
      return
    }

    const line = DEMO_LINES[phase]

    if (charIndex < line.text.length) {
      const t = setTimeout(() => {
        setCurrentText((p) => p + line.text[charIndex])
        setCharIndex((i) => i + 1)
      }, line.type === "status" ? TYPING_SPEED / 2 : TYPING_SPEED)
      return () => clearTimeout(t)
    }

    const t = setTimeout(() => {
      setLines((prev) => [...prev, { ...line, text: currentText }])
      setCurrentText("")
      setCharIndex(0)
      setPhase((p) => p + 1)
    }, PAUSE_AFTER)
    return () => clearTimeout(t)
  }, [running, phase, charIndex, currentText])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines, currentText])

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "#060f1e",
        border: "1px solid #1a2f52",
        boxShadow: "0 0 60px rgba(79,142,247,0.12), 0 32px 64px rgba(0,0,0,0.5)",
      }}
    >
      {/* Traffic lights */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: "#0a1628", borderBottom: "1px solid #1a2f52" }}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#28ca41" }} />
        <span className="ml-3 flex items-center gap-1.5 text-xs" style={{ color: "#334155" }}>
          <Zap className="w-3 h-3" style={{ color: "#4f8ef7" }} />
          CodeLens RAG
        </span>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="p-5 space-y-3 font-mono text-sm overflow-y-auto" style={{ maxHeight: "380px", minHeight: "320px" }}>
        {lines.map((line, i) => (
          <DemoLine key={i} line={line} />
        ))}

        {/* Current typing line */}
        {currentText && phase < DEMO_LINES.length && (
          <DemoLine
            line={{ type: DEMO_LINES[phase].type, text: currentText }}
            cursor
          />
        )}

      </div>
    </div>
  )
}

function DemoLine({ line, cursor = false }: { line: typeof DEMO_LINES[0]; cursor?: boolean }) {
  if (line.type === "url") {
    return (
      <div className="flex items-center gap-2">
        <span style={{ color: "#334155" }}>$</span>
        <span style={{ color: "#93c5fd" }}>{line.text}</span>
        {cursor && <span className="inline-block w-2 h-4 align-middle" style={{ background: "#4f8ef7", animation: "typeCursor 0.8s infinite" }} />}
      </div>
    )
  }
  if (line.type === "status") {
    return (
      <div className="flex items-center gap-2 text-xs" style={{ color: "#334155" }}>
        <span style={{ color: "#4f8ef7" }}>▸</span>
        {line.text}
        {cursor && <span className="inline-block w-1.5 h-3 align-middle" style={{ background: "#4f8ef7", animation: "typeCursor 0.8s infinite" }} />}
      </div>
    )
  }
  if (line.type === "user") {
    return (
      <div className="flex gap-2 pt-2">
        <span
          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
          style={{ background: "#1e3a6e", color: "#60a5fa" }}
        >
          U
        </span>
        <p style={{ color: "#cbd5e1" }}>
          {line.text}
          {cursor && <span className="inline-block w-2 h-4 align-middle ml-0.5" style={{ background: "#4f8ef7", animation: "typeCursor 0.8s infinite" }} />}
        </p>
      </div>
    )
  }
  // ai
  return (
    <div className="flex gap-2">
      <div
        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
        style={{ background: "rgba(79,142,247,0.15)", border: "1px solid rgba(79,142,247,0.3)" }}
      >
        <Zap className="w-3 h-3" style={{ color: "#4f8ef7" }} />
      </div>
      <p className="leading-relaxed" style={{ color: "#64748b" }}>
        {line.text}
        {cursor && <span className="inline-block w-2 h-4 align-middle ml-0.5" style={{ background: "#4f8ef7", animation: "typeCursor 0.8s infinite" }} />}
      </p>
    </div>
  )
}
