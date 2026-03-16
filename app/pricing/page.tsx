import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for sovereign AI compute. Start free with BYO GPU or pay-as-you-go with credit packs.",
}

const TIERS = [
  {
    name: "BYO GPU",
    price: "Free",
    period: "",
    description:
      "Bring your own hardware. We provide the platform, orchestration, and API.",
    features: [
      "Connect your GPU to the Yarn cluster",
      "Full inference and training API access",
      "Australian data residency guaranteed",
      "OpenAI-compatible endpoints",
      "Community support via GitHub",
    ],
    cta: "Get started",
    href: "https://account.yarn.prosodylabs.com.au",
    highlight: false,
  },
  {
    name: "Credit packs",
    price: "From $10",
    period: "",
    description:
      "Pay-as-you-go GPU compute. Buy credits, use them when you need them.",
    features: [
      "RTX 4090 and H100 GPU access",
      "Per-second billing — no idle charges",
      "Bulk discounts up to 20% ($500 pack)",
      "Training jobs, inference, and sessions",
      "Priority support",
      "Budget limits and auto-reload",
    ],
    cta: "Buy credits",
    href: "https://account.yarn.prosodylabs.com.au/dashboard/credits",
    highlight: true,
  },
  {
    name: "Research",
    price: "Custom",
    period: "",
    description:
      "Dedicated GPU capacity for research labs and institutions. Billed monthly or by grant.",
    features: [
      "Reserved GPU allocation",
      "Multi-user accounts with per-user quotas",
      "Institutional invoicing (PO/grant codes)",
      "Custom model deployment",
      "Direct engineering support",
      "SLA guarantees",
    ],
    cta: "Contact us",
    href: "mailto:jordan@prosodylabs.com.au",
    highlight: false,
  },
]

const GPU_RATES = [
  { name: "RTX 4090", vram: "24 GB", rate: "$0.50/hr" },
  { name: "H100 SXM", vram: "80 GB", rate: "$2.50/hr" },
  { name: "T4", vram: "16 GB", rate: "$0.20/hr" },
]

export default function PricingPage() {
  return (
    <div className="pt-14">
      {/* Hero */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary">
            Start free with your own GPU. Pay only for what you use with credit
            packs. Or talk to us about dedicated capacity for your research
            team.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-2xl border p-8 ${
                  tier.highlight
                    ? "border-primary bg-background-elevated"
                    : "border-border-subtle bg-background-elevated"
                }`}
              >
                {tier.highlight && (
                  <span className="mb-4 inline-flex w-fit items-center rounded-full bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
                    Most popular
                  </span>
                )}
                <h2 className="text-xl font-semibold text-foreground">
                  {tier.name}
                </h2>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {tier.price}
                </p>
                <p className="mt-3 text-sm text-foreground-secondary">
                  {tier.description}
                </p>
                <ul className="mt-8 flex-1 space-y-3">
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

      {/* GPU rates */}
      <section className="border-t border-border-subtle bg-background-elevated py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-2xl font-bold text-foreground">
            GPU compute rates
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-foreground-secondary">
            Credits are consumed per-second of GPU time. No minimum usage, no
            idle charges.
          </p>
          <div className="mt-12 overflow-hidden rounded-2xl border border-border-subtle">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-background-surface">
                  <th className="px-6 py-4 text-left font-medium text-foreground">
                    GPU
                  </th>
                  <th className="px-6 py-4 text-left font-medium text-foreground">
                    VRAM
                  </th>
                  <th className="px-6 py-4 text-right font-medium text-foreground">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {GPU_RATES.map((gpu) => (
                  <tr
                    key={gpu.name}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {gpu.name}
                    </td>
                    <td className="px-6 py-4 text-foreground-secondary">
                      {gpu.vram}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">
                      {gpu.rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-foreground-muted">
            Rates are in AUD. All compute runs on Australian infrastructure.
          </p>
        </div>
      </section>
    </div>
  )
}
