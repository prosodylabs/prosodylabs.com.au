import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for GPU compute. BYO GPU for free, or pay as you go from $1.50/hr.",
}

const TIERS = [
  {
    name: "BYO GPU",
    price: "Free",
    period: "",
    description:
      "Bring your own hardware. Share compute across users, teams, and institutions — we handle the platform.",
    features: [
      "Connect your GPUs to the Yarn network",
      "Share compute between teams and researchers",
      "Institutional SSO — researchers sign in with their university",
      "Manage compute distribution across an entire institution",
      "Full inference and training API access",
      "Overflow to managed pool when you need more",
    ],
    cta: "Get started",
    href: "https://account.yarn.prosodylabs.com.au",
    highlight: false,
  },
  {
    name: "Managed compute",
    price: "From $1.50/hr",
    period: "AUD",
    description:
      "Set clear budgets and plan your spending. Per-second billing, full cost visibility, no surprises.",
    features: [
      "RTX 4090 and H100 GPU access",
      "Per-second billing — no idle charges",
      "Budget limits and alerts at user, team, and institution level",
      "Training jobs, sessions, and notebooks",
      "Chat and API inference",
      "Auto-reload and spend controls",
    ],
    cta: "Add balance",
    href: "https://account.yarn.prosodylabs.com.au/dashboard/credits",
    highlight: true,
  },
]

const GPU_RATES = [
  { name: "RTX 4090", vram: "24 GB", sovereign: "$1.50/hr", overseas: "$1.20/hr" },
  { name: "A100 40GB", vram: "40 GB", sovereign: "$3.50/hr", overseas: "$2.80/hr" },
  { name: "A100 80GB", vram: "80 GB", sovereign: "$5.00/hr", overseas: "$4.00/hr" },
  { name: "H100 SXM", vram: "80 GB", sovereign: "$8.00/hr", overseas: "$6.50/hr" },
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
            BYO GPU is free — we manage the platform, you bring the hardware.
            Need more compute? Pay as you go, billed per-second in AUD. No
            reserved instances, no lock-in.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
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
                    Sovereign
                  </th>
                  <th className="px-6 py-4 text-right font-medium text-foreground">
                    Overseas
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
                      {gpu.sovereign}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground-muted">
                      {gpu.overseas}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-foreground-muted">
            Rates are in AUD. Sovereign compute runs on bare-metal
            infrastructure in Perth, Western Australia. Overseas rates are
            indicative — actual pricing depends on provider availability.
          </p>
        </div>
      </section>

      {/* Providers */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            One platform, multiple GPU providers
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground-secondary">
            Yarn manages your compute across sovereign Australian hardware and
            global GPU cloud providers. Same API, same SDK, same budget
            controls — regardless of where the GPU lives.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-foreground-muted">
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg font-semibold text-foreground">Prosody Labs</span>
              <span className="text-xs">Perth, WA — Sovereign</span>
            </div>
            <div className="h-8 w-px bg-border-subtle" />
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg font-semibold text-foreground">Lambda Labs</span>
              <span className="text-xs">US — H100, A100, B200</span>
            </div>
          </div>
          <p className="mt-8 text-sm text-foreground-secondary">
            Sovereign jobs stay in Australia. When you need more capacity,
            Yarn provisions cloud GPUs automatically and routes your workload —
            you never manage a cloud account.
          </p>
        </div>
      </section>
    </div>
  )
}
