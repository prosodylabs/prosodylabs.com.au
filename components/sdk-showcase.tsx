"use client"

import { useState } from "react"

const TABS = [
  {
    label: "Install",
    code: `$ curl -fsSL https://yarn.prosodylabs.com.au/install | sh

# Registers your machine, detects GPUs, joins the network
# One command. No Kubernetes. No Docker. No config files.

$ yarn login
Authenticated as jordan@prosodylabs.com.au
GPU detected: RTX 4090 (24GB) — registered as yarn-athena-01`,
  },
  {
    label: "Training",
    code: `import yarn

job = yarn.submit_job(
    directory="./my-experiment",
    gpu="rtx4090"           # or "auto" for pay-as-you-go
)

job.wait()
print(job.result)
print(job.metrics)          # loss, GPU hours, cost`,
  },
  {
    label: "Session",
    code: `import yarn

# Interactive GPU session — Jupyter, SSH, or Ray
session = yarn.session(
    gpu="rtx4090",
    hours=4                 # auto-checkpoints on expiry
)

print(session.jupyter_url)  # https://s-abc123.research.prosodylabs.com.au
print(session.ssh)          # ssh researcher@s-abc123.yarn`,
  },
  {
    label: "Inference",
    code: `import yarn

# Register your own model or use a shared one
yarn.models.register(
    name="my-org/llama-3-70b",
    source="huggingface",
    compute="auto"          # Yarn picks the cheapest GPU
)

# OpenAI-compatible — drop-in replacement
response = yarn.chat(
    model="my-org/llama-3-70b",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)`,
  },
  {
    label: "BYO GPU",
    code: `# On any machine with a GPU:
$ curl -fsSL https://yarn.prosodylabs.com.au/install | sh

# That's it. Your GPU is now part of the Yarn network.
# Share it with your team, your lab, your whole institution.
# Yarn handles scheduling, isolation, and billing.

# Or join an org:
$ yarn join my-university --token <invite-token>`,
  },
]

export function SdkShowcase() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-border-subtle px-3 py-2">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
              activeTab === i
                ? "bg-primary-muted text-primary"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
        <code className="text-foreground-secondary">
          {TABS[activeTab].code}
        </code>
      </pre>
    </div>
  )
}
