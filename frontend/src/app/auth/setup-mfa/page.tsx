"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Loader2, Copy, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SetupMfaPage() {
  const router = useRouter()
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [factorId, setFactorId] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const enroll = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "CodeLens RAG",
      })
      if (error || !data) {
        setError("Failed to start MFA setup. Try refreshing.")
        setEnrolling(false)
        return
      }
      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setEnrolling(false)
    }
    enroll()
  }, [])

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
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
      setError("Invalid code. Make sure your authenticator clock is synced.")
      setCode("")
      setLoading(false)
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
          Set up authenticator
        </h1>
        <p className="text-sm" style={{ color: "#475569" }}>
          Scan the QR code with Google Authenticator, Authy, or any TOTP app
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-5">
        {["Scan QR code", "Enter code", "Done"].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={
                  i === 0 || (i === 1 && qrCode)
                    ? { background: "rgba(79,142,247,0.2)", color: "#4f8ef7", border: "1px solid rgba(79,142,247,0.4)" }
                    : { background: "#0a1628", color: "#334155", border: "1px solid #1a2f52" }
                }
              >
                {i + 1}
              </div>
              <span className="text-xs" style={{ color: i === 0 ? "#94a3b8" : "#334155" }}>{label}</span>
            </div>
            {i < 2 && <div className="flex-1 h-px" style={{ background: "#1a2f52" }} />}
          </div>
        ))}
      </div>

      {/* Main card */}
      <div
        className="rounded-2xl p-5 space-y-5 animate-border-glow"
        style={{ background: "#0a1628", border: "1px solid #1a2f52" }}
      >
        {enrolling ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#4f8ef7" }} />
            <p className="text-xs" style={{ color: "#334155" }}>Generating QR code…</p>
          </div>
        ) : (
          <>
            {qrCode && (
              <div className="flex flex-col items-center gap-4">
                {/* QR code on white background */}
                <div
                  className="p-3 rounded-xl shadow-lg"
                  style={{
                    background: "#fff",
                    boxShadow: "0 0 24px rgba(79,142,247,0.12)",
                  }}
                  dangerouslySetInnerHTML={{ __html: qrCode }}
                />

                {/* Manual entry fallback */}
                <div className="w-full space-y-1.5">
                  <p className="text-xs text-center" style={{ color: "#475569" }}>
                    Can&apos;t scan? Enter this secret manually
                  </p>
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{ background: "#0d1b35", border: "1px solid #1a2f52" }}
                  >
                    <code
                      className="flex-1 text-xs font-mono truncate"
                      style={{ color: "#93c5fd", letterSpacing: "0.1em" }}
                    >
                      {secret}
                    </code>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="shrink-0 transition-all p-1 rounded-lg"
                      style={{
                        color: copied ? "#4ade80" : "#475569",
                        background: copied ? "rgba(74,222,128,0.08)" : "transparent",
                      }}
                      title="Copy secret"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Verification form */}
            <form onSubmit={handleVerify} className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#64748b" }}>
                  Enter the 6-digit code to confirm
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  autoFocus={!enrolling}
                  className="w-full rounded-xl px-4 py-3 text-base text-center font-mono font-semibold focus:outline-none transition-all"
                  style={{
                    background: "#0d1b35",
                    border: "1px solid #1a2f52",
                    color: "#e2e8f0",
                    letterSpacing: "0.5em",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(79,142,247,0.5)"
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,142,247,0.06)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#1a2f52"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                />
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                  style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}
                >
                  <span className="text-xs mt-0.5" style={{ color: "#f87171" }}>⚠</span>
                  <p className="text-xs leading-relaxed" style={{ color: "#f87171" }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="shimmer-btn w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed"
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
                    Activating…
                  </>
                ) : (
                  "Activate MFA"
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Skip */}
      <button
        onClick={() => router.push("/chat")}
        className="mt-4 w-full text-sm py-2 transition-colors"
        style={{ color: "#334155" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#475569")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
      >
        Skip for now — set up later
      </button>
    </div>
  )
}
