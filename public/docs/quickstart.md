# Yarn SDK Quickstart

## Install

```bash
# One command — registers your machine, detects GPUs, joins the network
curl -fsSL https://yarn.prosodylabs.com.au/install | sh

# Authenticate
yarn login
```

## Python SDK

```bash
pip install yarn-au
```

## Training Jobs

Submit a training job — Yarn handles GPU scheduling, containerisation, and result retrieval.

```python
import yarn

job = yarn.submit_job(
    directory="./my-experiment",   # bundles .py, .yaml, .json files
    gpu="rtx4090",                 # or "auto" for cheapest available
    entrypoint="train.py"          # auto-detected if main.py/train.py/run.py
)

job.wait()
print(job.status)    # "completed"
print(job.result)    # stdout/stderr
print(job.metrics)   # loss, GPU hours, cost
```

### Multi-file projects

```python
# Automatically bundles all .py/.yaml/.json files in the directory
job = yarn.submit_job(directory="./kairos-experiment")

# Or specify individual files
job = yarn.submit_job(
    code="import torch; print(torch.cuda.is_available())",
    gpu="auto"
)
```

## Interactive Sessions

Launch an interactive GPU session with Jupyter, SSH, or Ray.

```python
session = yarn.session(
    gpu="rtx4090",
    hours=4                        # auto-checkpoints on expiry
)

print(session.jupyter_url)         # https://s-abc123.research.prosodylabs.com.au
print(session.ssh)                 # ssh researcher@s-abc123.yarn
print(session.ray_address)         # ray://s-abc123.yarn:10001
```

## Inference

### Register a model

```python
# Register your own model from HuggingFace
yarn.models.register(
    name="my-org/llama-3-70b",
    source="huggingface",
    compute="auto"                 # Yarn picks the cheapest GPU
)

# Or specify exact compute
yarn.models.register(
    name="my-org/llama-3-70b",
    source="huggingface",
    compute="rtx4090"
)
```

### Use an existing model

```python
# OpenAI-compatible — drop-in replacement
response = yarn.chat(
    model="my-org/llama-3-70b",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)
```

### OpenAI SDK compatibility

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.au.yarn.prosodylabs.com.au/v1",
    api_key="your-yarn-api-key"
)

response = client.chat.completions.create(
    model="my-org/llama-3-70b",
    messages=[{"role": "user", "content": "Hello"}]
)
```

## BYO GPU

Connect your own hardware to the Yarn network — free forever.

```bash
# On any machine with a GPU
curl -fsSL https://yarn.prosodylabs.com.au/install | sh

# Join an organisation
yarn join my-university --token <invite-token>
```

Your GPU is now part of the network. Yarn handles scheduling, isolation, and (optional) billing. Share compute between teams, labs, or an entire institution.

## Budget Controls

```python
# Set spending limits
yarn.budget.set(
    monthly_limit=100.00,          # AUD
    alert_thresholds=[50, 75, 100] # percentage alerts
)

# Check balance
print(yarn.balance())              # {"available": 87.50, "currency": "AUD"}
```

## Authentication

```python
import yarn

# API key authentication (recommended for scripts)
yarn.api_key = "your-api-key"

# Or environment variable
# export YARN_API_KEY=your-api-key

# Or interactive login
yarn.login()
```

## Data Residency

All compute runs on Australian infrastructure. Your data never leaves Australian soil. Sovereign models are hosted on bare-metal hardware in Perth, Western Australia.

When you need more capacity, Yarn can provision cloud GPUs — you control whether your workload stays sovereign (AU only) or can overflow to international providers.

---

**API base URL:** `https://api.au.yarn.prosodylabs.com.au/v1`

**SDK:** `pip install yarn-au` | [GitHub](https://github.com/prosodylabs/yarn)

**Support:** jordan@prosodylabs.com.au
