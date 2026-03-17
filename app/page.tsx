import { Hero } from "@/components/hero"

const FEATURES = [
  {
    title: "Sovereign by default",
    description:
      "Every request, every token, every byte of training data stays on Australian soil. No data leaves. No exceptions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "GPU compute on demand",
    description:
      "RTX 4090 on bare metal today. H100 cloud spokes when you need them. One API, any scale.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <rect x="4" y="4" width="16" height="16" rx="2" strokeLinecap="round" />
        <path d="M9 9h6v6H9z" strokeLinecap="round" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Research-first platform",
    description:
      "Submit training jobs, launch interactive GPU sessions, fine-tune models. Built for researchers, not DevOps engineers.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "OpenAI-compatible API",
    description:
      "Drop-in replacement. Switch one base URL and your existing code works. Streaming, function calling, embeddings.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const PRICING_TIERS = [
  {
    name: "BYO GPU",
    price: "Free",
    description: "Bring your own hardware. Share compute across your team or institution.",
    features: [
      "Connect your GPUs to the Yarn network",
      "Share compute between teams and researchers",
      "Manage distribution across an entire institution",
      "Australian data residency",
      "Overflow to shared pool when you need more",
    ],
    cta: "Get started",
    href: "https://account.yarn.prosodylabs.com.au",
    highlight: false,
  },
  {
    name: "Managed compute",
    price: "From $0.20/hr",
    description: "Set clear budgets and plan your spending. Per-second billing, full cost visibility, no surprises.",
    features: [
      "Training jobs and interactive GPU sessions",
      "Chat and API inference",
      "Budget limits, alerts, and auto-reload",
      "Per-team and per-user spend controls",
      "No subscriptions, no lock-in",
    ],
    cta: "Add balance",
    href: "https://account.yarn.prosodylabs.com.au/dashboard/credits",
    highlight: true,
  },
]

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <Hero />

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for sovereign compute
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground-secondary">
              Yarn is a GPU-aware AI platform designed from the ground up for
              Australian data residency, research workflows, and elastic
              scaling.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border-subtle bg-background-elevated p-8 transition-colors hover:border-border"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted text-primary">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SDK quickstart ───────────────────────────────── */}
      <section className="border-y border-border-subtle bg-background-elevated py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Three lines to GPU
              </h2>
              <p className="mt-4 text-foreground-secondary">
                The Yarn SDK handles authentication, job submission, and result
                retrieval. Install it, point it at your code, and let the
                platform handle the rest.
              </p>
              <p className="mt-6 text-foreground-secondary">
                OpenAI-compatible inference is even simpler — change the base
                URL and you&apos;re done.
              </p>
              <a
                href="https://account.yarn.prosodylabs.com.au/docs"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Read the docs
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-background">
              {/* Tab bar */}
              <div className="flex items-center gap-4 border-b border-border-subtle px-5 py-3">
                <span className="text-xs font-medium text-foreground">
                  Training job
                </span>
                <span className="text-xs text-foreground-faint">|</span>
                <span className="text-xs text-foreground-muted">
                  Inference
                </span>
              </div>
              <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
                <code>
                  <span className="text-foreground-muted">
                    $ pip install yarn-au
                  </span>
                  {"\n\n"}
                  <span className="text-primary">import</span>
                  <span className="text-foreground"> yarn</span>
                  {"\n\n"}
                  <span className="text-foreground">job </span>
                  <span className="text-foreground-muted">= </span>
                  <span className="text-foreground">yarn.</span>
                  <span className="text-accent-cool">submit_job</span>
                  <span className="text-foreground">(</span>
                  {"\n"}
                  <span className="text-foreground">{"    "}directory</span>
                  <span className="text-foreground-muted">=</span>
                  <span className="text-accent-warm">
                    &quot;./my-experiment&quot;
                  </span>
                  <span className="text-foreground">,</span>
                  {"\n"}
                  <span className="text-foreground">{"    "}gpu</span>
                  <span className="text-foreground-muted">=</span>
                  <span className="text-accent-warm">
                    &quot;rtx4090&quot;
                  </span>
                  {"\n"}
                  <span className="text-foreground">)</span>
                  {"\n\n"}
                  <span className="text-foreground">job.</span>
                  <span className="text-accent-cool">wait</span>
                  <span className="text-foreground">()</span>
                  {"\n"}
                  <span className="text-primary">print</span>
                  <span className="text-foreground">(job.result)</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground-secondary">
              Start free with your own GPU. Pay only for what you use with
              credit packs. Or talk to us about dedicated capacity for your
              team.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-2xl border p-8 ${
                  tier.highlight
                    ? "border-primary bg-background-elevated"
                    : "border-border-subtle bg-background-elevated"
                }`}
              >
                <h3 className="text-lg font-semibold text-foreground">
                  {tier.name}
                </h3>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {tier.price}
                </p>
                <p className="mt-2 text-sm text-foreground-secondary">
                  {tier.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-foreground-secondary"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.href}
                  className={`mt-8 block rounded-xl px-6 py-3 text-center text-sm font-medium transition-colors ${
                    tier.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "border border-border bg-background-surface text-foreground hover:bg-background-hover"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="border-t border-border-subtle bg-background-elevated py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Start building on sovereign infrastructure
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground-secondary">
            Create a free account, connect your GPU or buy credits, and deploy
            your first model in minutes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://account.yarn.prosodylabs.com.au"
              className="w-full rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto"
            >
              Create free account
            </a>
            <a
              href="https://github.com/prosodylabs/yarn"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-xl border border-border bg-background-surface/50 px-8 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-background-hover sm:w-auto"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
