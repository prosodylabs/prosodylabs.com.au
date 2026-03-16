import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description:
    "Prosody Labs builds sovereign AI infrastructure for Australian research and enterprise.",
}

export default function AboutPage() {
  return (
    <div className="pt-14">
      {/* Hero */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About Prosody Labs
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground-secondary">
            Prosody Labs builds sovereign AI infrastructure for Australian
            research and enterprise. We believe that where your data lives
            matters — and that Australian researchers and organisations deserve
            GPU compute that doesn&apos;t require sending data offshore.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-border-subtle bg-background-elevated py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-foreground">What we build</h2>
          <div className="mt-8 space-y-6 text-foreground-secondary">
            <p>
              <strong className="text-foreground">Yarn</strong> is our
              GPU-aware AI platform. It provides inference, training jobs, and
              interactive GPU sessions through a single API — with every byte
              of data staying on Australian soil.
            </p>
            <p>
              The platform runs on bare-metal infrastructure in Perth, Western
              Australia. Hub-and-spoke architecture means we can scale to cloud
              GPU capacity when needed, while keeping the control plane and
              data sovereign.
            </p>
            <p>
              We&apos;re built for researchers first. No Kubernetes expertise
              required. No DevOps overhead. Submit your training code, specify
              your GPU, and get results. The infrastructure is our problem, not
              yours.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-foreground">Team</h2>
          <div className="mt-8">
            <div className="rounded-2xl border border-border-subtle bg-background-elevated p-8">
              <h3 className="text-lg font-semibold text-foreground">
                Jordan Hill
              </h3>
              <p className="text-sm text-foreground-muted">Founder</p>
              <p className="mt-4 text-sm leading-relaxed text-foreground-secondary">
                PhD candidate in Philosophy at the University of Western
                Australia. Lecturer in AI and Data Science at North Metropolitan
                TAFE. Background spanning medieval literature, Ancient Greek,
                political economy, and deep learning. Researching the
                architecture of alignment — how the structure of neural
                networks constrains the kinds of understanding they can
                achieve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-border-subtle bg-background-elevated py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-foreground">Get in touch</h2>
          <p className="mt-4 text-foreground-secondary">
            For research collaborations, enterprise inquiries, or general
            questions:
          </p>
          <a
            href="mailto:jordan@prosodylabs.com.au"
            className="mt-4 inline-block text-primary transition-colors hover:text-primary-hover"
          >
            jordan@prosodylabs.com.au
          </a>
        </div>
      </section>
    </div>
  )
}
