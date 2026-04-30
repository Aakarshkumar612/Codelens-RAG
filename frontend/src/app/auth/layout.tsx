import Link from "next/link"
import { Zap } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col dot-grid"
      style={{ background: "#020817" }}
    >
      {/* Background glow orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute animate-glow-pulse"
          style={{
            top: "-15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(59,108,183,0.18) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          className="absolute animate-glow-pulse delay-500"
          style={{
            bottom: "-10%",
            right: "-5%",
            width: "500px",
            height: "300px",
            background: "radial-gradient(ellipse, rgba(79,142,247,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          className="absolute animate-glow-pulse delay-300"
          style={{
            top: "40%",
            left: "-8%",
            width: "350px",
            height: "350px",
            background: "radial-gradient(ellipse, rgba(129,140,248,0.07) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 animate-fade-in">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(79,142,247,0.15)", border: "1px solid rgba(79,142,247,0.3)" }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: "#4f8ef7" }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: "#94a3b8" }}>
            CodeLens RAG
          </span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
          style={{ color: "#475569" }}
        >
          ← Back to home
        </Link>
      </nav>

      {/* Page content centered */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </div>

      {/* Subtle footer */}
      <div className="pb-6 text-center animate-fade-in">
        <p className="text-xs" style={{ color: "#1e3a6e" }}>
          © {new Date().getFullYear()} CodeLens RAG — Built with FastAPI &amp; Next.js
        </p>
      </div>
    </div>
  )
}
