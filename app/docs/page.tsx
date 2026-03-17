import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Yarn SDK documentation — quickstart, API reference, and guides.",
}

const DOCS = [
  {
    title: "Quickstart",
    description: "Install, authenticate, submit your first job in under a minute.",
    href: "/docs/quickstart",
  },
  {
    title: "API reference",
    description: "Full endpoint reference — chat completions, models, jobs, sessions, billing.",
    href: "/docs/api-reference",
  },
]

export default function DocsIndex() {
  return (
    <div className="pt-14">
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Documentation
          </h1>
          <p className="mt-4 text-foreground-secondary">
            Everything you need to use Yarn — from first install to production inference.
          </p>
          <p className="mt-2 text-sm text-foreground-muted">
            All docs are available as raw markdown for agent consumption — append{" "}
            <code className="rounded bg-background-surface px-1.5 py-0.5 text-xs">.md</code>{" "}
            to any docs URL.
          </p>

          <div className="mt-12 space-y-4">
            {DOCS.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="block rounded-2xl border border-border-subtle bg-background-elevated p-6 transition-colors hover:border-border"
              >
                <h2 className="text-lg font-semibold text-foreground">
                  {doc.title}
                </h2>
                <p className="mt-1 text-sm text-foreground-secondary">
                  {doc.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
