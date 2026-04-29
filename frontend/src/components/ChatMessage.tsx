import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Zap } from "lucide-react"
import type { Message } from "@/app/page"

interface Props {
  message: Message
}

export default function ChatMessage({ message }: Props) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed"
          style={{ background: "#0f2040", color: "#cbd5e1" }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
        style={{
          background: "rgba(79,142,247,0.1)",
          border: "1px solid rgba(79,142,247,0.2)",
        }}
      >
        <Zap className="w-3.5 h-3.5" style={{ color: "#4f8ef7" }} />
      </div>

      {/* Content */}
      <div className="flex-1 text-sm leading-relaxed min-w-0" style={{ color: "#cbd5e1" }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,

            pre: ({ children }) => <>{children}</>,

            code: ({ className, children }) => {
              if (className) {
                const lang = className.replace("language-", "")
                return (
                  <div
                    className="my-3 rounded-xl overflow-hidden text-xs"
                    style={{ border: "1px solid #1a2f52" }}
                  >
                    {lang && (
                      <div
                        className="px-4 py-1.5 font-mono"
                        style={{
                          background: "#0a1628",
                          borderBottom: "1px solid #1a2f52",
                          color: "#3b6cb7",
                        }}
                      >
                        {lang}
                      </div>
                    )}
                    <pre
                      className="p-4 overflow-x-auto"
                      style={{ background: "#060f1e" }}
                    >
                      <code className="font-mono" style={{ color: "#93c5fd" }}>
                        {children}
                      </code>
                    </pre>
                  </div>
                )
              }
              return (
                <code
                  className="px-1.5 py-0.5 rounded text-xs font-mono"
                  style={{ background: "#0a1628", color: "#93c5fd" }}
                >
                  {children}
                </code>
              )
            },

            ul: ({ children }) => (
              <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),

            h1: ({ children }) => (
              <h1
                className="text-lg font-semibold mb-3"
                style={{ color: "#e2e8f0" }}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                className="text-base font-semibold mb-2"
                style={{ color: "#e2e8f0" }}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: "#cbd5e1" }}
              >
                {children}
              </h3>
            ),

            blockquote: ({ children }) => (
              <blockquote
                className="pl-4 my-3"
                style={{
                  borderLeft: "2px solid #1e3a6e",
                  color: "#475569",
                }}
              >
                {children}
              </blockquote>
            ),

            a: ({ href, children }) => (
              <a
                href={href}
                className="underline underline-offset-2 transition-colors"
                style={{ color: "#4f8ef7" }}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#93c5fd")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#4f8ef7")
                }
              >
                {children}
              </a>
            ),

            strong: ({ children }) => (
              <strong style={{ color: "#e2e8f0", fontWeight: 600 }}>
                {children}
              </strong>
            ),

            hr: () => (
              <hr className="my-4" style={{ borderColor: "#1a2f52" }} />
            ),

            table: ({ children }) => (
              <div className="overflow-x-auto mb-3">
                <table
                  className="w-full text-xs border-collapse"
                  style={{ borderColor: "#1a2f52" }}
                >
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th
                className="text-left px-3 py-2 font-medium"
                style={{
                  border: "1px solid #1a2f52",
                  background: "#0a1628",
                  color: "#94a3b8",
                }}
              >
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td
                className="px-3 py-2"
                style={{
                  border: "1px solid #1a2f52",
                  color: "#64748b",
                }}
              >
                {children}
              </td>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>

        {message.streaming && (
          <span
            className="inline-block w-2 h-4 rounded-sm animate-pulse ml-0.5 align-text-bottom"
            style={{ background: "#4f8ef7" }}
          />
        )}
      </div>
    </div>
  )
}
