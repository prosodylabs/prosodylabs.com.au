"use client"

import { useEffect, useState } from "react"

interface DocPageProps {
  slug: string
  title: string
}

export function DocPage({ slug, title }: DocPageProps) {
  const [html, setHtml] = useState("")

  useEffect(() => {
    fetch(`/docs/${slug}.md`)
      .then((r) => r.text())
      .then((md) => {
        // Simple markdown to HTML — handles headers, code blocks, lists, links, tables
        const lines = md.split("\n")
        const out: string[] = []
        let inCode = false
        let inList = false

        for (const line of lines) {
          if (line.startsWith("```")) {
            if (inCode) {
              out.push("</code></pre>")
              inCode = false
            } else {
              const lang = line.slice(3).trim()
              out.push(
                `<pre class="overflow-x-auto rounded-xl bg-background p-4 text-sm my-4"><code class="text-foreground-secondary">`
              )
              inCode = true
            }
            continue
          }
          if (inCode) {
            out.push(
              line
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
            )
            out.push("\n")
            continue
          }

          // Close list if needed
          if (inList && !line.startsWith("- ") && !line.startsWith("| ") && line.trim() !== "") {
            inList = false
          }

          // Headers
          if (line.startsWith("### ")) {
            out.push(`<h3 class="text-base font-semibold text-foreground mt-8 mb-3">${line.slice(4)}</h3>`)
          } else if (line.startsWith("## ")) {
            out.push(`<h2 class="text-lg font-semibold text-foreground mt-10 mb-4">${line.slice(3)}</h2>`)
          } else if (line.startsWith("# ")) {
            // Skip — we render the title separately
          } else if (line.startsWith("- ")) {
            if (!inList) {
              inList = true
            }
            const content = line.slice(2).replace(/`([^`]+)`/g, '<code class="rounded bg-background px-1.5 py-0.5 text-xs text-foreground">$1</code>')
            out.push(`<li class="ml-4 list-disc text-sm text-foreground-secondary mb-1">${content}</li>`)
          } else if (line.startsWith("| ") && line.includes("|")) {
            // Table rows
            if (line.includes("---")) continue // separator
            const cells = line.split("|").filter(c => c.trim()).map(c => c.trim())
            const isHeader = out[out.length - 1]?.includes("<table") === false && !out.some(l => l.includes("<td"))
            const tag = isHeader ? "th" : "td"
            const cellClass = isHeader
              ? "px-4 py-2 text-left text-xs font-medium text-foreground"
              : "px-4 py-2 text-xs text-foreground-secondary"
            const row = cells.map(c => `<${tag} class="${cellClass}">${c}</${tag}>`).join("")
            if (!out.some(l => l.includes("<table"))) {
              out.push('<table class="w-full my-4 border border-border-subtle rounded-xl overflow-hidden text-sm">')
            }
            out.push(`<tr class="border-b border-border-subtle">${row}</tr>`)
          } else if (line.startsWith("**") && line.endsWith("**")) {
            out.push(`<p class="text-sm font-medium text-foreground mt-4">${line.slice(2, -2)}</p>`)
          } else if (line.startsWith("---")) {
            out.push('<hr class="my-8 border-border-subtle" />')
          } else if (line.trim() === "") {
            // Close table if open
            if (out[out.length - 1]?.includes("</tr>")) {
              out.push("</table>")
            }
            out.push("")
          } else {
            // Paragraph — handle inline code and links
            let p = line
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/`([^`]+)`/g, '<code class="rounded bg-background px-1.5 py-0.5 text-xs text-foreground">$1</code>')
              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary-hover">$1</a>')
            out.push(`<p class="text-sm text-foreground-secondary mb-3">${p}</p>`)
          }
        }
        setHtml(out.join("\n"))
      })
  }, [slug])

  return (
    <div className="pt-14">
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="flex items-baseline justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <a
              href={`/docs/${slug}.md`}
              className="font-mono text-xs text-foreground-muted transition-colors hover:text-foreground"
            >
              raw .md
            </a>
          </div>
          <div
            className="mt-8"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </section>
    </div>
  )
}
