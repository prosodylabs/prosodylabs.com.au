# API Reference

**Base URL:** `https://api.au.yarn.prosodylabs.com.au/v1`

All endpoints require authentication via Bearer token (API key or JWT).

```
Authorization: Bearer <your-api-key>
```

Generate an API key from **Account Portal > Settings > API Keys**.

## Chat Completions

OpenAI-compatible endpoint. Supports streaming and non-streaming responses.

```
POST /v1/chat/completions
```

### Request

```json
{
  "model": "Qwen/Qwen3.5-0.8B",
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
  "model": "Qwen/Qwen3.5-0.8B",
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

### Streaming

Set `"stream": true` to receive Server-Sent Events. Each chunk contains a delta:

```json
{"choices": [{"delta": {"content": "Hello"}, "index": 0}]}
```

The final chunk has `"finish_reason": "stop"`.

## Embeddings

```
POST /v1/embeddings
```

```json
{
  "model": "text-embedding-3-large",
  "input": "Yarn is a sovereign AI platform."
}
```

## Models

### List models

```
GET /v1/models
```

Returns all models available to your account, including sovereign models and external providers.

## Research Jobs

### Submit a job

```
POST /v1/research/jobs
```

```json
{
  "name": "kairos-training-run",
  "entrypoint": "python /home/ray/code/train.py",
  "files": {
    "train.py": "base64-encoded-content",
    "config.yaml": "base64-encoded-content"
  },
  "gpu_type": "rtx-4090",
  "gpu_count": 1,
  "cpu": "2",
  "memory": "4Gi"
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

### Cancel a job

```
DELETE /v1/research/jobs/{job_id}
```

### Estimate cost

```
POST /v1/research/jobs/estimate
```

```json
{
  "gpu_type": "rtx-4090",
  "gpu_count": 1,
  "max_runtime_hours": 4
}
```

### List jobs

```
GET /v1/research/jobs
```

## Research Sessions

### Start a session

```
POST /v1/research/sessions
```

```json
{
  "name": "experiment-1",
  "gpu_type": "rtx-4090",
  "gpu_count": 1,
  "cpu": "4",
  "memory": "8Gi",
  "idle_timeout_minutes": 60
}
```

### Response

```json
{
  "id": "s-abc123",
  "status": "running",
  "ray_endpoint": "ray://s-abc123.research.prosodylabs.com.au:10001",
  "dashboard_url": "https://s-abc123.research.prosodylabs.com.au",
  "gpu_type": "rtx-4090",
  "created_at": "2026-03-19T10:00:00Z"
}
```

### Get session details

```
GET /v1/research/sessions/{session_id}
```

### List sessions

```
GET /v1/research/sessions
```

### Terminate session

```
DELETE /v1/research/sessions/{session_id}
```

## Notebooks

### Create notebook

```
POST /v1/research/notebooks
```

```json
{
  "name": "analysis-notebook",
  "gpu_type": "rtx-4090",
  "idle_timeout_minutes": 120
}
```

### List notebooks

```
GET /v1/research/notebooks
```

### Get notebook details

```
GET /v1/research/notebooks/{notebook_id}
```

### Delete notebook

```
DELETE /v1/research/notebooks/{notebook_id}
```

## Data Storage

### Upload object

```
POST /v1/data/objects
Content-Type: multipart/form-data
```

### Download object

```
GET /v1/data/objects/{key}
```

### List objects

```
GET /v1/data/objects?prefix=datasets/
```

### Delete object

```
DELETE /v1/data/objects/{key}
```

### Storage usage and quota

```
GET /v1/data/usage
GET /v1/data/quota
```

## Billing

### Get balance

```
GET /v1/billing/credits/balance
```

```json
{
  "available": 87.50,
  "held": 2.00,
  "currency": "AUD"
}
```

### Get usage

```
GET /v1/billing/credits/usage?period=30d
```

### Credit packs

```
GET /v1/billing/credits/packs
```

### Purchase credits

```
POST /v1/billing/credits/purchase
```

```json
{
  "pack_id": "researcher",
  "payment_method": "stripe"
}
```

### Budget limits

```
GET /v1/billing/limits
PUT /v1/billing/limits
DELETE /v1/billing/limits/{scope}
```

```json
{
  "monthly_limit": 100.00,
  "currency": "AUD",
  "alert_thresholds": [50, 75, 100],
  "hard_stop": true
}
```

### Auto-reload settings

```
GET /v1/billing/credits/reload-settings
PUT /v1/billing/credits/reload-settings
```

```json
{
  "enabled": true,
  "threshold": 10.00,
  "reload_amount": 50.00,
  "monthly_cap": 200.00
}
```

## User

### Get profile

```
GET /v1/users/me
```

### API keys

```
GET /v1/users/me/api-keys
POST /v1/users/me/api-keys
DELETE /v1/users/me/api-keys/{key_id}
```

### My GPUs

```
GET /v1/users/me/gpus
```

Returns all GPUs accessible to you — both platform GPUs and BYO hardware across all orgs.

## GPU Rates

| GPU | VRAM | Rate (AUD) |
|-----|------|-----------|
| RTX 4090 | 24 GB | $0.50/hr |
| H100 SXM | 80 GB | $3.00/hr |
| T4 | 16 GB | $0.30/hr |

All rates in AUD. Per-second billing — no minimum, no idle charges.

---

**SDK:** `pip install yarn-sdk` | [GitHub](https://github.com/prosodylabs/yarn)

**Support:** jordan@prosodylabs.com.au
