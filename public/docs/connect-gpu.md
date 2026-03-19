# Connect Your GPU

Bring your own GPU to the Yarn network. Your hardware, your data residency, no compute charges. Yarn handles scheduling, isolation, and (optionally) sharing compute across your team.

## How it works

1. You register your machine with a join token from your Yarn account
2. The Yarn agent runs on your machine and advertises your GPU(s) to the platform
3. When you or your team submit jobs, Yarn schedules work to your hardware first
4. All data stays on your machine unless you explicitly share it

## Requirements

- A Linux machine with an NVIDIA GPU (CUDA 12.0+)
- NVIDIA drivers installed (`nvidia-smi` should work)
- Docker or containerd (for job isolation)
- Outbound internet access (HTTPS to `api.au.yarn.prosodylabs.com.au`)

Supported GPUs: RTX 4090, RTX 3090, A100, H100, T4, and others. If `nvidia-smi` sees it, Yarn can use it.

## Step 1: Generate a join token

In the Account Portal, go to **My GPUs** and click **Add GPU**. This generates a one-time join token.

If you're an org admin and want the GPU to be shared across your team, go to **Org GPUs** instead. GPUs registered with an org token are available to all org members.

## Step 2: Install the Yarn agent

```bash
curl -fsSL https://yarn.prosodylabs.com.au/install | sh
```

The installer:
- Detects your GPU(s) and CUDA version
- Installs the Yarn agent as a systemd service
- Registers the machine with the Yarn platform

## Step 3: Join the network

```bash
yarn join --token <your-join-token>
```

For org-level registration:

```bash
yarn join --token <org-join-token> --org my-university
```

## Step 4: Verify

Check your GPU status in the Account Portal under **My GPUs**. You should see:
- GPU model and VRAM
- Status: **Online**
- Utilization, temperature, and memory usage (updated in real time)

Or from the CLI:

```bash
yarn status
```

## What happens next

Your GPU is now part of the Yarn network. When you submit training jobs or start sessions, Yarn will schedule work to your GPU automatically. If your GPU is busy and you need more capacity, Yarn can overflow to the shared pool (managed compute, billed per-second).

## Sharing with your team

If you registered the GPU under an org, all org members can use it. The org admin controls:
- Who has access (member roles)
- Per-member budget limits
- Whether to allow overflow to paid compute

## Removing a GPU

From the Account Portal, go to **My GPUs** (or **Org GPUs**) and click **Remove**. Or from the CLI:

```bash
yarn leave
```

This unregisters the machine and stops the agent. Your data and any running jobs are preserved.

## Troubleshooting

### Agent won't start

```bash
# Check the agent service
systemctl status yarn-agent

# Check logs
journalctl -u yarn-agent -n 50
```

Common issues:
- NVIDIA drivers not installed: run `nvidia-smi` to verify
- Docker not running: `systemctl start docker`
- Firewall blocking outbound HTTPS: allow port 443 to `api.au.yarn.prosodylabs.com.au`

### GPU shows "Offline" in the portal

The agent sends a heartbeat every 30 seconds. If the portal shows offline:
- Check the agent is running: `systemctl status yarn-agent`
- Check network: `curl -s https://api.au.yarn.prosodylabs.com.au/v1/healthz`
- Restart the agent: `systemctl restart yarn-agent`

### Token expired

Join tokens expire after 24 hours. Generate a new one from the Account Portal.

---

**Need help?** jordan@prosodylabs.com.au
