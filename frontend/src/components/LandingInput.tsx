"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Zap, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Props {
  onAnalyze: (url: string) => void
  loading: boolean
  error: string
}

const EXAMPLES = [
  "https://github.com/fastapi/fastapi",
  "https://github.com/vercel/next.js",
  "https://github.com/shadcn-ui/ui",
]

export default function LandingInput({ onAnalyze, loading, error }: Props) {
  const [url, setUrl] = useState("")
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!url.trim() || loading) return
    onAnalyze(url.trim())
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Sign out */}
      <button
        type="button"
        onClick={handleSignOut}
        className="absolute top-4 right-4 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
        style={{ color: "#334155" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#f87171"
          e.currentTarget.style.background = "#0a1628"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#334155"
          e.currentTarget.style.background = "transparent"
        }}
      >
        <LogOut className="w-3 h-3" />
        Sign out
      </button>

      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2"
            style={{
              background: "rgba(79,142,247,0.1)",
              border: "1px solid rgba(79,142,247,0.25)",
            }}
          >
            <Zap className="w-7 h-7" style={{ color: "#4f8ef7" }} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#e2e8f0" }}>
            CodeLens RAG
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#64748b" }}>
            Paste a GitHub or GitLab repository URL.
            <br />
            I&apos;ll analyze it — then answer anything you ask.
          </p>
        </div>

        {/* Input card */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "#0a1628", border: "1px solid #1a2f52" }}
        >
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              disabled={loading}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all disabled:opacity-50"
              style={{
                background: "#0d1b35",
                border: "1px solid #1a2f52",
                color: "#e2e8f0",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(79,142,247,0.5)"
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,142,247,0.08)"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#1a2f52"
                e.currentTarget.style.boxShadow = "none"
              }}
            />
            <button
              type="submit"
              disabled={!url.trim() || loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap disabled:cursor-not-allowed"
              style={
                !url.trim() || loading
                  ? { background: "#0f2040", color: "#334155" }
                  : {
                      background: "linear-gradient(135deg, #3b6cb7 0%, #4f8ef7 100%)",
                      color: "#fff",
                      boxShadow: "0 0 20px rgba(79,142,247,0.3)",
                    }
              }
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="text-sm px-1" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}

          {loading && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "#4f8ef7", animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-sm" style={{ color: "#475569" }}>
                Cloning and indexing repository — this may take a minute…
              </p>
            </div>
          )}
        </div>

        {/* Examples */}
        {!loading && (
          <div className="space-y-2">
            <p className="text-xs text-center font-medium" style={{ color: "#334155" }}>
              TRY AN EXAMPLE
            </p>
            <div className="flex flex-col gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  type="button"
                  key={ex}
                  onClick={() => setUrl(ex)}
                  className="text-left text-xs px-4 py-2.5 rounded-lg font-mono truncate transition-all"
                  style={{ color: "#475569", background: "transparent", border: "1px solid transparent" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#0a1628"
                    e.currentTarget.style.color = "#94a3b8"
                    e.currentTarget.style.border = "1px solid #1a2f52"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.color = "#475569"
                    e.currentTarget.style.border = "1px solid transparent"
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
