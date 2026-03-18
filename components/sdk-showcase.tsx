"use client"

import { useState, useEffect, useRef } from "react"
import hljs from "highlight.js/lib/core"
import python from "highlight.js/lib/languages/python"
import bash from "highlight.js/lib/languages/bash"
import "highlight.js/styles/github-dark.min.css"

hljs.registerLanguage("python", python)
hljs.registerLanguage("bash", bash)

const TABS: { label: string; lang: string; code: string }[] = [
  {
    label: "Session",
    lang: "python",
    code: `import yarn
import torch

# Your code. Wrap it in a session and it runs on a GPU.
with yarn.session(gpu="rtx4090") as device:
    model = MyModel().to(device)
    optimizer = torch.optim.Adam(model.parameters())

    for epoch in range(100):
        loss = train_step(model, data, device)
        device.log({"epoch": epoch, "loss": loss.item()})

    device.save("model.pt", model.state_dict())
# GPU released. Logs and checkpoints in your dashboard.`,
  },
  {
    label: "Training",
    lang: "python",
    code: `import yarn

# Submit and walk away. Yarn bundles your code,
# picks a GPU, streams logs, saves checkpoints.
job = yarn.submit(
    directory="./my-experiment",
    gpu="rtx4090",              # or "auto"
)

for line in job.stream_logs():
    print(line)

print(job.result)               # metrics, cost, runtime`,
  },
  {
    label: "Inference",
    lang: "python",
    code: `import yarn

# OpenAI-compatible. Drop-in replacement.
response = yarn.chat(
    model="mistralai/Mistral-7B-Instruct-v0.2",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)

# Or bring your own model
yarn.models.register(
    name="my-org/fine-tuned-llama",
    source="huggingface",
    compute="auto"              # cheapest available GPU
)`,
  },
  {
    label: "BYO GPU",
    lang: "bash",
    code: `# On any machine with a GPU:
$ pip install yarn-au
$ yarn join my-university --token <invite-token>

# That's it. Your GPU is now part of the network.
# Share it with your team, your lab, your institution.
# Yarn handles scheduling, isolation, and billing.

$ yarn status
  RTX 4090 (24GB) — online, 2 jobs queued
  Cost: BYO (free)`,
  },
  {
    label: "Install",
    lang: "bash",
    code: `$ pip install yarn-au

# Authenticate
$ yarn login
Authenticated as jordan@prosodylabs.com.au

# Check your GPUs
$ yarn gpus
  rtx4090 (24GB) — BYO, online
  h100    (80GB) — managed, $2.50/hr`,
  },
]

export function SdkShowcase() {
  const [activeTab, setActiveTab] = useState(0)
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute("data-highlighted")
      hljs.highlightElement(codeRef.current)
    }
  }, [activeTab])

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
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed !bg-transparent">
        <code
          ref={codeRef}
          className={`language-${TABS[activeTab].lang} !bg-transparent`}
        >
          {TABS[activeTab].code}
        </code>
      </pre>
    </div>
  )
}
