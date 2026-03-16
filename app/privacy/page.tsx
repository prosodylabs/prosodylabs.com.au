import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Prosody Labs collects, uses, and protects your data.",
}

export default function PrivacyPage() {
  return (
    <div className="pt-14">
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Privacy policy
          </h1>
          <p className="mt-4 text-foreground-muted">
            Last updated: March 2026
          </p>

          <div className="mt-12 space-y-8 text-sm leading-relaxed text-foreground-secondary">
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Overview
              </h2>
              <p className="mt-3">
                Prosody Labs Pty Ltd (ABN 48 686 529 102) operates the Yarn
                platform. We are committed to protecting your privacy and
                handling your data in accordance with the Australian Privacy
                Act 1988 and the Australian Privacy Principles (APPs).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Data we collect
              </h2>
              <ul className="mt-3 list-inside list-disc space-y-2">
                <li>
                  <strong className="text-foreground">
                    Account information:
                  </strong>{" "}
                  Email address, name, and authentication credentials when you
                  create an account.
                </li>
                <li>
                  <strong className="text-foreground">Usage data:</strong> API
                  requests, compute usage, and billing information necessary to
                  operate the service.
                </li>
                <li>
                  <strong className="text-foreground">
                    Inference and training data:
                  </strong>{" "}
                  Content you send through the API (prompts, training datasets,
                  model outputs). This data is processed on Australian
                  infrastructure and is not stored beyond what is necessary to
                  complete your request.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Data residency
              </h2>
              <p className="mt-3">
                All data processed through Yarn is stored and processed on
                infrastructure located in Australia. We do not transfer your
                data to servers outside of Australia. This includes inference
                requests, training data, model weights, and account
                information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                How we use your data
              </h2>
              <ul className="mt-3 list-inside list-disc space-y-2">
                <li>To provide and operate the Yarn platform</li>
                <li>To authenticate you and manage your account</li>
                <li>
                  To process billing and enforce usage quotas
                </li>
                <li>
                  To improve the reliability and performance of our
                  infrastructure
                </li>
              </ul>
              <p className="mt-3">
                We do not use your inference or training data to train our own
                models. We do not sell or share your data with third parties
                except as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Data retention
              </h2>
              <p className="mt-3">
                Inference data (prompts and responses) is retained only for the
                duration of the request unless you explicitly save conversation
                history. Training data and model checkpoints are retained as
                long as you maintain an active account and can be deleted on
                request.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Your rights
              </h2>
              <p className="mt-3">
                Under the Australian Privacy Act, you have the right to access,
                correct, and delete your personal information. To exercise
                these rights, contact us at{" "}
                <a
                  href="mailto:jordan@prosodylabs.com.au"
                  className="text-primary hover:text-primary-hover"
                >
                  jordan@prosodylabs.com.au
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Contact
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
