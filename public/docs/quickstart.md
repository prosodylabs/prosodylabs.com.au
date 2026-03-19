# Quickstart

Get from zero to running code on a GPU in under five minutes.

## 1. Create an account

Sign up at [account.yarn.prosodylabs.com.au](https://account.yarn.prosodylabs.com.au/signup). You'll need an invitation — request one on the signup page.

Once approved, sign in and generate an API key from **Settings > API Keys**.

## 2. Install the SDK

```bash
pip install yarn-sdk
```

Set your API key:

```bash
export YARN_API_KEY=yarn_your_api_key_here
```

## 3. Submit a training job

Create a file called `train.py`:

```python
import torch

print(f"CUDA available: {torch.cuda.is_available()}")
print(f"Device: {torch.cuda.get_device_name(0)}")

# Your training code here
x = torch.randn(1000, 1000, device="cuda")
result = x @ x.T
print(f"Matrix multiply on GPU: {result.shape}")
```

Submit it:

```python
import yarn

client = yarn.Client()

job = client.jobs.submit(
    name="my-first-job",
    script="train.py",
    gpu="rtx-4090",
)

print(f"Job submitted: {job['id']}")

# Wait for completion
result = client.jobs.wait(job["id"])
print(f"Status: {result['status']}")

# Stream logs
for line in client.jobs.stream_logs(job["id"]):
    print(line)
```

### Multi-file projects

Point the SDK at a directory and it bundles everything automatically:

```python
job = client.jobs.submit(
    name="kairos-experiment",
    directory="./my-experiment",   # bundles .py, .yaml, .json, .sh files
    gpu="rtx-4090",
    entrypoint="python /home/ray/code/train.py",
)
```

The SDK auto-detects `main.py`, `train.py`, or `run.py` as the entrypoint if you don't specify one.

### Cost estimates

Check what a job will cost before submitting:

```python
estimate = client.jobs.estimate(
    gpu="rtx-4090",
    max_runtime_hours=4,
)
print(estimate)  # {"estimated_cost": 2.00, "currency": "AUD", ...}
```

## 4. Interactive GPU sessions

Launch a session and use it like a PyTorch device:

```python
import yarn

with yarn.session(gpu="rtx-4090") as device:
    import torch
    model = torch.nn.Linear(100, 10).to(device)

    # Log metrics back to Yarn
    device.log({"epoch": 1, "loss": 0.42})

    # Save checkpoints to Yarn storage
    device.save("model.pt", local_path="./model.pt")
```

Sessions provide a Ray endpoint, dashboard URL, and auto-checkpoint on idle timeout.

## 5. Chat inference

Yarn's inference API is OpenAI-compatible. Use the Yarn SDK or the OpenAI SDK — just change the base URL.

### With the Yarn SDK

```python
import yarn

client = yarn.Client()
response = client.chat.completions(
    model="Qwen/Qwen3.5-0.8B",
    messages=[{"role": "user", "content": "Hello from Yarn"}],
)
print(response["choices"][0]["message"]["content"])
```

### With the OpenAI SDK

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.au.yarn.prosodylabs.com.au/v1",
    api_key="your-yarn-api-key",
)

response = client.chat.completions.create(
    model="Qwen/Qwen3.5-0.8B",
    messages=[{"role": "user", "content": "Hello from Yarn"}],
)
print(response.choices[0].message.content)
```

### Streaming

```python
for chunk in client.chat.completions.create(
    model="Qwen/Qwen3.5-0.8B",
    messages=[{"role": "user", "content": "Explain RLHF briefly"}],
    stream=True,
):
    print(chunk.choices[0].delta.content or "", end="")
```

## What's next

- [API Reference](/docs/api-reference) — full endpoint docs
- [Connect your GPU](/docs/connect-gpu) — bring your own hardware
- [Billing](/docs/billing) — how pricing and credits work

---

**API base URL:** `https://api.au.yarn.prosodylabs.com.au/v1`

**SDK:** `pip install yarn-sdk` | [GitHub](https://github.com/prosodylabs/yarn)

**Support:** jordan@prosodylabs.com.au
