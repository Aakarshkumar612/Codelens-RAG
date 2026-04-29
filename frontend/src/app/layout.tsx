import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CodeLens RAG",
  description: "AI-powered codebase analysis",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased h-screen overflow-hidden`}
        style={{ background: "#020817", color: "#e2e8f0" }}
      >
        {children}
      </body>
    </html>
  )
}
