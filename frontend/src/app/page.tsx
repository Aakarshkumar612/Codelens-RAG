"use client"

import Link from "next/link"
import {
  Zap, GitFork, ArrowRight, Brain, MessageSquare, Shield,
  GitBranch, History, Layers, ChevronRight, Star,
  Code2, Database, Server, Cpu, Lock, Globe,
} from "lucide-react"
import TerminalDemo from "@/components/landing/TerminalDemo"

/* ── Navbar ──────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
      style={{
        background: "rgba(2,8,23,0.8)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(26,47,82,0.5)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.25)" }}
        >
          <Zap className="w-4 h-4" style={{ color: "#4f8ef7" }} />
        </div>
        <span className="font-bold text-sm" style={{ color: "#e2e8f0" }}>CodeLens RAG</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {["Features", "How it Works", "Architecture", "Tech Stack"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/ /g, "-")}`}
            className="text-sm transition-colors"
            style={{ color: "#475569" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
          >
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="text-sm px-4 py-2 rounded-lg transition-colors"
          style={{ color: "#475569" }}
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="shimmer-btn text-sm px-4 py-2 rounded-lg font-medium transition-all"
          style={{
            background: "linear-gradient(135deg, #3b6cb7 0%, #4f8ef7 100%)",
            color: "#fff",
            boxShadow: "0 0 16px rgba(79,142,247,0.3)",
          }}
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}

/* ── Hero ────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden dot-grid">
      {/* Glow orbs */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full animate-glow-pulse"
        style={{ background: "radial-gradient(ellipse, rgba(79,142,247,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(129,140,248,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(192,132,252,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center py-20">
        {/* Left */}
        <div className="space-y-8">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium animate-fade-in"
            style={{
              background: "rgba(79,142,247,0.08)",
              border: "1px solid rgba(79,142,247,0.2)",
              color: "#93c5fd",
            }}
          >
            <Star className="w-3 h-3" style={{ color: "#fbbf24" }} />
            Powered by LLaMA 3.3 70B + Groq
            <ChevronRight className="w-3 h-3" />
          </div>

          {/* Headline */}
          <div className="space-y-2 animate-fade-in-up delay-100">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight" style={{ color: "#e2e8f0" }}>
              Understand Any
            </h1>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight gradient-text animate-gradient-text">
              Codebase, Instantly.
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-lg leading-relaxed animate-fade-in-up delay-200" style={{ color: "#475569" }}>
            Paste a GitHub or GitLab URL. CodeLens RAG clones, chunks, and
            semantically indexes your entire repository — then answers any
            question you have about it in real-time.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
            <Link
              href="/auth/signup"
              className="shimmer-btn flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #3b6cb7 0%, #4f8ef7 100%)",
                color: "#fff",
                boxShadow: "0 0 30px rgba(79,142,247,0.35)",
              }}
            >
              Start Analyzing Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "rgba(10,22,40,0.8)",
                border: "1px solid #1a2f52",
                color: "#94a3b8",
              }}
            >
              <GitFork className="w-4 h-4" />
              See how it works
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-6 animate-fade-in-up delay-400">
            {[
              { label: "Repos indexed", value: "1M+ lines" },
              { label: "Avg index time", value: "< 30s" },
              { label: "Supported languages", value: "40+" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-sm font-bold" style={{ color: "#e2e8f0" }}>{value}</p>
                <p className="text-xs" style={{ color: "#334155" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Terminal */}
        <div className="animate-slide-right delay-300 animate-float">
          <TerminalDemo />
        </div>
      </div>
    </section>
  )
}

/* ── Features ────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Brain,
    title: "Semantic Code Understanding",
    desc: "Not just keyword search. Our RAG pipeline generates vector embeddings so you get context-aware answers, not just string matches.",
    color: "#818cf8",
  },
  {
    icon: MessageSquare,
    title: "Real-time Streaming Chat",
    desc: "Responses stream token-by-token with full conversation memory. Ask follow-ups naturally — the AI remembers everything you discussed.",
    color: "#4f8ef7",
  },
  {
    icon: Shield,
    title: "MFA-Protected Access",
    desc: "Enterprise-grade security with Supabase Auth and TOTP multi-factor authentication. Your queries and history are private.",
    color: "#34d399",
  },
  {
    icon: GitBranch,
    title: "Any GitHub / GitLab Repo",
    desc: "Just paste a URL. We shallow-clone with --depth=1, walk every indexable file, chunk with overlap, and index automatically.",
    color: "#f472b6",
  },
  {
    icon: History,
    title: "Persistent Chat History",
    desc: "Every session is stored in Supabase. Come back later, pick up where you left off, switch repos without losing context.",
    color: "#fbbf24",
  },
  {
    icon: Layers,
    title: "Architecture-Aware",
    desc: "Understands file structure, import graphs, design patterns, and entry points. Get answers that reference specific file:line locations.",
    color: "#c084fc",
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-16 animate-fade-in-up">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#4f8ef7" }}>
          Features
        </p>
        <h2 className="text-4xl font-bold" style={{ color: "#e2e8f0" }}>
          Everything you need to{" "}
          <span className="gradient-text">understand code</span>
        </h2>
        <p className="text-base max-w-xl mx-auto" style={{ color: "#475569" }}>
          Built for developers who need fast, accurate answers about unfamiliar codebases.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
          <div
            key={title}
            className={`animate-fade-in-up delay-${(i + 1) * 100} glass-card rounded-2xl p-6 space-y-4 group transition-all duration-300 cursor-default`}
            style={{ animationFillMode: "both" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderColor = `${color}30`
              el.style.boxShadow = `0 0 30px ${color}10`
              el.style.transform = "translateY(-3px)"
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderColor = "rgba(26,47,82,0.8)"
              el.style.boxShadow = "none"
              el.style.transform = "translateY(0)"
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${color}12`, border: `1px solid ${color}25` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <h3 className="font-semibold text-base" style={{ color: "#e2e8f0" }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── How it Works ────────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    icon: Globe,
    title: "Paste your repo URL",
    desc: "Support for any public GitHub or GitLab repository. Just copy the URL from your browser and paste it — no tokens or credentials required.",
    detail: "github.com/owner/repository",
  },
  {
    num: "02",
    icon: Cpu,
    title: "Automatic indexing",
    desc: "We shallow-clone the repo, walk every indexable file, split into overlapping 50-line chunks, and generate semantic embeddings stored in ChromaDB.",
    detail: "~18s for a 50k line repo",
  },
  {
    num: "03",
    icon: MessageSquare,
    title: "Ask in natural language",
    desc: "Your query is embedded, matched against the vector index, and the top-k chunks are passed to LLaMA 3.3 70B on Groq for a streaming answer.",
    detail: "file:line citations included",
  },
]

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-28 px-6 md:px-12 relative overflow-hidden"
      style={{ background: "#060f1e" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(79,142,247,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20 animate-fade-in-up">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#4f8ef7" }}>
            How it Works
          </p>
          <h2 className="text-4xl font-bold" style={{ color: "#e2e8f0" }}>
            From URL to{" "}
            <span className="gradient-text">answer in seconds</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div
            className="hidden md:block absolute top-12 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px"
            style={{ background: "linear-gradient(90deg, transparent, #1a2f52 20%, #1a2f52 80%, transparent)" }}
          />

          {STEPS.map(({ num, icon: Icon, title, desc, detail }, i) => (
            <div
              key={num}
              className={`animate-fade-in-up delay-${(i + 1) * 200} relative space-y-5 p-6 rounded-2xl transition-all`}
              style={{
                background: "#0a1628",
                border: "1px solid #1a2f52",
                animationFillMode: "both",
              }}
            >
              {/* Step number */}
              <div className="flex items-center justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)" }}
                >
                  <Icon className="w-6 h-6" style={{ color: "#4f8ef7" }} />
                </div>
                <span
                  className="text-4xl font-black"
                  style={{ color: "rgba(79,142,247,0.08)", fontVariantNumeric: "tabular-nums" }}
                >
                  {num}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-base" style={{ color: "#e2e8f0" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{desc}</p>
              </div>

              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
                style={{ background: "#060f1e", color: "#4f8ef7", border: "1px solid #1a2f52" }}
              >
                <span style={{ color: "#334155" }}>▸</span>
                {detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Architecture ────────────────────────────────────────── */
const ARCH_NODES = [
  { label: "GitHub / GitLab", sub: "Source repo", color: "#f472b6", icon: GitFork },
  { label: "FastAPI Backend", sub: "Python + Uvicorn", color: "#4f8ef7", icon: Server },
  { label: "Chunker", sub: "50-line windows", color: "#818cf8", icon: Code2 },
  { label: "sentence-transformers", sub: "all-MiniLM-L6-v2", color: "#c084fc", icon: Cpu },
  { label: "ChromaDB", sub: "Vector index", color: "#34d399", icon: Database },
  { label: "Groq LLM", sub: "LLaMA 3.3 70B", color: "#fbbf24", icon: Brain },
  { label: "Next.js Frontend", sub: "WebSocket stream", color: "#4f8ef7", icon: Globe },
]

function ArchitectureSection() {
  return (
    <section id="architecture" className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-16 animate-fade-in-up">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#4f8ef7" }}>
          Architecture
        </p>
        <h2 className="text-4xl font-bold" style={{ color: "#e2e8f0" }}>
          How the{" "}
          <span className="gradient-text">pipeline works</span>
        </h2>
        <p className="text-base max-w-xl mx-auto" style={{ color: "#475569" }}>
          A fully local-first RAG pipeline. Your code never leaves your infrastructure except for the LLM call.
        </p>
      </div>

      {/* Pipeline flow */}
      <div className="flex flex-wrap justify-center items-center gap-2 animate-fade-in-up delay-200">
        {ARCH_NODES.map(({ label, sub, color, icon: Icon }, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 transition-all"
              style={{ minWidth: "140px" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = `${color}40`
                el.style.boxShadow = `0 0 20px ${color}12`
                el.style.transform = "scale(1.04)"
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = "rgba(26,47,82,0.8)"
                el.style.boxShadow = "none"
                el.style.transform = "scale(1)"
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}12`, border: `1px solid ${color}25` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-medium leading-tight" style={{ color: "#cbd5e1" }}>{label}</p>
                <p className="text-xs leading-tight" style={{ color: "#334155" }}>{sub}</p>
              </div>
            </div>
            {i < ARCH_NODES.length - 1 && (
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#1e3a6e" }} />
            )}
          </div>
        ))}
      </div>

      {/* Labels row */}
      <div
        className="mt-8 p-5 rounded-2xl animate-fade-in-up delay-400"
        style={{ background: "#0a1628", border: "1px solid #1a2f52" }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {[
            { step: "Ingest", detail: "git clone --depth=1 → walk files → filter by extension + size" },
            { step: "Chunk", detail: "50-line windows, 10-line overlap → prepend file:line header" },
            { step: "Embed", detail: "sentence-transformers all-MiniLM-L6-v2 → float32 vectors" },
            { step: "Query", detail: "cosine similarity k=8 → build context → stream Groq response" },
          ].map(({ step, detail }) => (
            <div key={step} className="space-y-1">
              <p className="font-semibold" style={{ color: "#4f8ef7" }}>{step}</p>
              <p style={{ color: "#334155" }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Tech Stack ──────────────────────────────────────────── */
const STACK = [
  {
    category: "Frontend",
    color: "#4f8ef7",
    items: ["Next.js 16", "React 19", "TypeScript 5", "Tailwind CSS v4", "Lucide Icons"],
  },
  {
    category: "Backend",
    color: "#34d399",
    items: ["Python 3.13", "FastAPI", "WebSocket", "Uvicorn", "Pydantic v2"],
  },
  {
    category: "AI / ML",
    color: "#c084fc",
    items: ["Groq API", "LLaMA 3.3 70B", "sentence-transformers", "ChromaDB", "all-MiniLM-L6-v2"],
  },
  {
    category: "Auth & Database",
    color: "#fbbf24",
    items: ["Supabase", "PostgreSQL", "TOTP MFA", "Row-Level Security", "JWT"],
  },
]

function TechStackSection() {
  return (
    <section
      id="tech-stack"
      className="py-28 px-6 md:px-12 relative overflow-hidden"
      style={{ background: "#060f1e" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#4f8ef7" }}>
            Tech Stack
          </p>
          <h2 className="text-4xl font-bold" style={{ color: "#e2e8f0" }}>
            Built with{" "}
            <span className="gradient-text">battle-tested tools</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in-up delay-200">
          {STACK.map(({ category, color, items }) => (
            <div
              key={category}
              className="rounded-2xl p-5 space-y-4"
              style={{ background: "#0a1628", border: "1px solid #1a2f52" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
                />
                <h3 className="text-sm font-semibold" style={{ color: "#cbd5e1" }}>{category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono"
                    style={{
                      background: `${color}08`,
                      border: `1px solid ${color}20`,
                      color: "#64748b",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ─────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="py-28 px-6 md:px-12 max-w-4xl mx-auto text-center">
      <div className="animate-fade-in-up space-y-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "rgba(79,142,247,0.08)",
            border: "1px solid rgba(79,142,247,0.2)",
            color: "#93c5fd",
          }}
        >
          <Lock className="w-3 h-3" />
          Free to use · MFA-protected · No data stored
        </div>

        <h2 className="text-5xl font-bold leading-tight" style={{ color: "#e2e8f0" }}>
          Ready to understand<br />
          <span className="gradient-text animate-gradient-text">any codebase?</span>
        </h2>

        <p className="text-lg" style={{ color: "#475569" }}>
          Create your account in 30 seconds. Paste a repo URL. Start asking questions.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="shimmer-btn flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #3b6cb7 0%, #4f8ef7 100%)",
              color: "#fff",
              boxShadow: "0 0 40px rgba(79,142,247,0.4)",
            }}
          >
            Get started for free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-medium transition-colors"
            style={{ color: "#475569" }}
          >
            Already have an account? Sign in →
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ──────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4"
      style={{ borderTop: "1px solid #0f2040" }}
    >
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4" style={{ color: "#4f8ef7" }} />
        <span className="text-sm font-medium" style={{ color: "#334155" }}>
          CodeLens RAG
        </span>
      </div>
      <p className="text-xs" style={{ color: "#1e3a6e" }}>
        Built with Next.js · FastAPI · Groq · ChromaDB · Supabase
      </p>
      <div className="flex items-center gap-6">
        {["Features", "Sign in", "Sign up"].map((item) => (
          <Link
            key={item}
            href={item === "Features" ? "#features" : `/auth/${item.toLowerCase().replace(" ", "")}`}
            className="text-xs transition-colors"
            style={{ color: "#1e3a6e" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#334155")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#1e3a6e")}
          >
            {item}
          </Link>
        ))}
      </div>
    </footer>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ background: "#020817", color: "#e2e8f0", minHeight: "100vh" }}>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ArchitectureSection />
        <TechStackSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
