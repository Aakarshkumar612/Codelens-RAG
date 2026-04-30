"use client"

import { useState, useEffect, useRef, type KeyboardEvent, type ClipboardEvent } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function MfaPage() {
  const router = useRouter()
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [factorId, setFactorId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const code = digits.join("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = (data as { totp?: { id: string }[] } | null)?.totp?.[0]
      if (totp) setFactorId(totp.id)
    })
    inputRefs.current[0]?.focus()
  }, [])

  const focusAt = (i: number) => inputRefs.current[Math.max(0, Math.min(5, i))]?.focus()

  const handleChange = (i: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[i] = char
    setDigits(next)
    if (char && i < 5) focusAt(i + 1)
  }

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits]
        next[i] = ""
        setDigits(next)
      } else if (i > 0) {
        focusAt(i - 1)
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      focusAt(i - 1)
    } else if (e.key === "ArrowRight" && i < 5) {
      focusAt(i + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted) return
    const next = [...digits]
    for (let j = 0; j < 6; j++) next[j] = pasted[j] ?? ""
    setDigits(next)
    focusAt(Math.min(pasted.length, 5))
  }

  const handleSubmit = async () => {
    if (code.length !== 6) return
    setError("")
    setLoading(true)

    const supabase = createClient()

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId })

    if (challengeError) {
      setError(challengeError.message)
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    })

    if (verifyError) {
      setError("Invalid code. Try again.")
      setDigits(["", "", "", "", "", ""])
      setLoading(false)
      focusAt(0)
      return
    }

    router.push("/chat")
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      {/* Icon + heading */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center mb-4">
          <div
            className="absolute w-16 h-16 rounded-full animate-glow-pulse"
            style={{ background: "rgba(79,142,247,0.12)" }}
          />
          <div
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(79,142,247,0.12)",
              border: "1px solid rgba(79,142,247,0.3)",
              boxShadow: "0 0 20px rgba(79,142,247,0.15)",
            }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: "#4f8ef7" }} />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#e2e8f0" }}>
          Two-factor authentication
        </h1>
        <p className="text-sm" style={{ color: "#475569" }}>
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {/* OTP boxes */}
      <div
        className="rounded-2xl p-6 space-y-5 animate-border-glow"
        style={{ background: "#0a1628", border: "1px solid #1a2f52" }}
      >
        <div className="flex items-center justify-center gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="w-11 h-13 rounded-xl text-center text-lg font-mono font-semibold focus:outline-none transition-all"
              style={{
                height: "52px",
                background: d ? "rgba(79,142,247,0.08)" : "#0d1b35",
                border: d ? "1px solid rgba(79,142,247,0.4)" : "1px solid #1a2f52",
                color: "#e2e8f0",
                boxShadow: d ? "0 0 12px rgba(79,142,247,0.1)" : "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(79,142,247,0.6)"
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,142,247,0.1)"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = d ? "rgba(79,142,247,0.4)" : "#1a2f52"
                e.currentTarget.style.boxShadow = d ? "0 0 12px rgba(79,142,247,0.1)" : "none"
              }}
            />
          ))}
        </div>

        {error && (
          <div
            className="flex items-start gap-2 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}
          >
            <span className="text-xs mt-0.5" style={{ color: "#f87171" }}>⚠</span>
            <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>
          </div>
        )}

        <p className="text-xs text-center" style={{ color: "#334155" }}>
          You can paste a 6-digit code directly
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || code.length !== 6}
        className="shimmer-btn mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed"
        style={
          loading || code.length !== 6
            ? { background: "#0f2040", color: "#334155" }
            : {
                background: "linear-gradient(135deg, #1e3a6e 0%, #3b6cb7 50%, #4f8ef7 100%)",
                color: "#fff",
                boxShadow: "0 0 24px rgba(79,142,247,0.3), 0 4px 12px rgba(0,0,0,0.3)",
              }
        }
        onMouseEnter={(e) => {
          if (!loading && code.length === 6)
            e.currentTarget.style.boxShadow = "0 0 32px rgba(79,142,247,0.45), 0 4px 12px rgba(0,0,0,0.3)"
        }}
        onMouseLeave={(e) => {
          if (!loading && code.length === 6)
            e.currentTarget.style.boxShadow = "0 0 24px rgba(79,142,247,0.3), 0 4px 12px rgba(0,0,0,0.3)"
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying…
          </>
        ) : (
          "Verify & continue"
        )}
      </button>
    </div>
  )
}
