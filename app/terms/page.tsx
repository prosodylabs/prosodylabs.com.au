import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms of service for using the Yarn platform by Prosody Labs.",
}

export default function TermsPage() {
  return (
    <div className="pt-14">
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Terms of service
          </h1>
          <p className="mt-4 text-foreground-muted">
            Last updated: March 2026
          </p>

          <div className="mt-12 space-y-8 text-sm leading-relaxed text-foreground-secondary">
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                1. Agreement
              </h2>
              <p className="mt-3">
                By accessing or using the Yarn platform operated by Prosody
                Labs Pty Ltd (ABN 48 686 529 102), you agree to these terms of
                service. If you do not agree, do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                2. The service
              </h2>
              <p className="mt-3">
                Yarn provides GPU compute infrastructure for AI inference,
                model training, and interactive sessions. The service includes
                API access, a web chat interface, a research portal, and an
                account management portal.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                3. Accounts
              </h2>
              <p className="mt-3">
                You must provide accurate information when creating an account.
                You are responsible for maintaining the security of your
                account credentials and API keys. Notify us immediately if you
                suspect unauthorised access.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                4. Acceptable use
              </h2>
              <p className="mt-3">You agree not to:</p>
              <ul className="mt-3 list-inside list-disc space-y-2">
                <li>
                  Use the service to generate content that is illegal under
                  Australian law
                </li>
                <li>
                  Attempt to circumvent usage limits, authentication, or access
                  controls
                </li>
                <li>
                  Reverse-engineer the platform infrastructure or attempt to
                  access other users&apos; data
                </li>
                <li>
                  Use the service in any way that could damage, disable, or
                  impair the infrastructure
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                5. Billing and credits
              </h2>
              <p className="mt-3">
                GPU compute is billed per-second of usage. Credits are
                non-refundable and do not expire. Pricing is in Australian
                dollars. We reserve the right to change pricing with 30
                days&apos; notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                6. Data ownership
              </h2>
              <p className="mt-3">
                You retain all rights to your data, including training
                datasets, model weights, prompts, and outputs. We do not claim
                any ownership of your content. We do not use your data to train
                our own models.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                7. Service availability
              </h2>
              <p className="mt-3">
                We strive to maintain high availability but do not guarantee
                uninterrupted service. GPU capacity is subject to availability.
                We will provide reasonable notice before planned maintenance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                8. Limitation of liability
              </h2>
              <p className="mt-3">
                To the extent permitted by Australian law, Prosody Labs&apos;
                liability is limited to the amount you have paid for the
                service in the preceding 12 months. We are not liable for
                indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                9. Governing law
              </h2>
              <p className="mt-3">
                These terms are governed by the laws of Western Australia. Any
                disputes will be resolved in the courts of Western Australia.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                10. Contact
              </h2>
              <p className="mt-3">
                Prosody Labs Pty Ltd
                <br />
                Perth, Western Australia
                <br />
                <a
                  href="mailto:jordan@prosodylabs.com.au"
                  className="text-primary hover:text-primary-hover"
                >
                  jordan@prosodylabs.com.au
                </a>
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
