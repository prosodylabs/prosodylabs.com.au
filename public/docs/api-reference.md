# Yarn API Reference

**Base URL:** `https://api.au.yarn.prosodylabs.com.au/v1`

All endpoints require authentication via Bearer token or API key header.

```
Authorization: Bearer <your-api-key>
```

## Chat Completions

OpenAI-compatible endpoint.

```
POST /v1/chat/completions
```

### Request

```json
{
  "model": "my-org/llama-3-70b",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello"}
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

### Response

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "my-org/llama-3-70b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 9,
    "total_tokens": 21
  }
}
```

## Models

### List models

```
GET /v1/models
```

### Register a model

```
POST /v1/models/register
```

```json
{
  "name": "my-org/llama-3-70b",
  "source": "huggingface",
  "compute": "auto"
}
```

`compute` options:
- `"auto"` — Yarn selects cheapest available GPU
- `"rtx4090"` — specific GPU type
- `"sovereign"` — Australian hardware only

## Research Jobs

### Submit a job

```
POST /v1/research/jobs
```

```json
{
  "name": "kairos-training-run",
  "code": "base64-encoded-script",
  "files": {
    "train.py": "base64...",
    "config.yaml": "base64..."
  },
  "gpu_type": "rtx4090",
  "gpu_count": 1
}
```

### Get job status

```
GET /v1/research/jobs/{job_id}
```

### Stream job logs

```
GET /v1/research/jobs/{job_id}/logs?stream=true
```

## Research Sessions

### Start a session

```
POST /v1/research/sessions
```

```json
{
  "gpu_type": "rtx4090",
  "duration_hours": 4
}
```

### Response

```json
{
  "session_id": "s-abc123",
  "status": "running",
  "jupyter_url": "https://s-abc123.research.prosodylabs.com.au",
  "ssh_command": "ssh researcher@s-abc123.yarn",
  "ray_address": "ray://s-abc123.yarn:10001",
  "expires_at": "2026-03-17T10:00:00Z"
}
```

## Billing

### Get balance

```
GET /v1/billing/credits/balance
```

### Get usage

```
GET /v1/billing/credits/usage?period=30d
```

### Set budget limits

```
PUT /v1/billing/limits
```

```json
{
  "monthly_limit": 100.00,
  "currency": "AUD",
  "alert_thresholds": [50, 75, 100],
  "hard_stop": true
}
```

## GPU Rates

| GPU | VRAM | Sovereign (AU) | Overseas |
|-----|------|---------------|----------|
| RTX 4090 | 24 GB | $0.50/hr | $0.40/hr |
| H100 SXM | 80 GB | $3.00/hr | $2.40/hr |
| T4 | 16 GB | $0.30/hr | $0.24/hr |

All rates in AUD. Per-second billing — no minimum, no idle charges.

---

**SDK:** `pip install yarn-au` | [GitHub](https://github.com/prosodylabs/yarn)

**Support:** jordan@prosodylabs.com.au
