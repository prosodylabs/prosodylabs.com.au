# Billing

Yarn uses a credit-based system. No subscriptions, no lock-in. You load credits, spend them on GPU time, and see exactly where every dollar goes.

## Credits

1 credit = $1 AUD. Credits are prepaid — you buy a pack, and they're available immediately.

### Credit packs

| Pack | Credits | Price | Discount |
|------|---------|-------|----------|
| Starter | 10 | $10 AUD | — |
| Researcher | 50 | $45 AUD | 10% off |
| Lab | 200 | $160 AUD | 20% off |

Buy credit packs from **Account Portal > Billing > Credits**.

### BYO GPU — free

If you [connect your own GPU](/docs/connect-gpu), compute on that hardware costs nothing. Credits are only consumed when Yarn provisions managed compute (overflow or on-demand GPUs).

## GPU rates

All rates are per-second billing. No minimum runtime, no idle charges. If a job runs for 47 seconds, you pay for 47 seconds.

| GPU | VRAM | Rate (AUD) |
|-----|------|-----------|
| RTX 4090 | 24 GB | $0.50/hr |
| H100 SXM | 80 GB | $3.00/hr |
| T4 | 16 GB | $0.30/hr |

Rates are for sovereign (Australian) compute. International overflow may be cheaper — see the Account Portal for current rates.

## What costs money

- **Training jobs** — billed for GPU time from job start to completion
- **Interactive sessions** — billed for GPU time while the session is active
- **Inference** — billed per token (included in credit balance)

## What's free

- **BYO GPU compute** — your hardware, no charge
- **Storage** — included with your account (quota-based)
- **API access** — no per-request fees beyond compute costs
- **The platform** — no subscription or platform fee

## Budget controls

Set spending limits from **Account Portal > Billing > Budget**.

### Monthly limits

```python
import yarn

client = yarn.Client()
client.billing.usage(period="30d")  # See current month's spend
```

Set a monthly cap from the Account Portal. When you hit the limit, Yarn can either:
- **Soft stop** — warn you and let you continue
- **Hard stop** — pause all jobs until next month or until you top up

### Alert thresholds

Configure alerts at 50%, 75%, and 100% of your budget. Alerts are delivered by email.

### Auto-reload

Set a threshold and Yarn tops up your balance automatically:
- When balance drops below $10, add $50
- Monthly cap to prevent runaway spending
- Requires a card on file (Stripe)

Configure from **Account Portal > Billing > Auto-reload**.

## Checking your balance

### Account Portal

**Billing > Spending** shows:
- Available balance and held credits
- Daily spend chart with breakdown (inference, training, sessions)
- Burn rate and projected depletion date

### SDK

```python
import yarn

client = yarn.Client()
balance = client.billing.balance()
print(f"Available: ${balance['available']} AUD")
```

### API

```
GET /v1/billing/credits/balance
Authorization: Bearer <api-key>
```

```json
{
  "available": 87.50,
  "held": 2.00,
  "currency": "AUD"
}
```

## Organisations

Org admins can:
- Maintain a shared credit pool for the team
- Set per-member spending limits
- View per-member usage breakdowns
- Top up the org balance from **Org Billing**

Individual members can also hold their own credits, separate from the org pool.

## Invoices and receipts

Credit pack purchases generate a Stripe receipt. For institutional billing or purchase orders, contact jordan@prosodylabs.com.au.

---

**Manage billing:** [Account Portal > Billing](https://account.yarn.prosodylabs.com.au/dashboard/spending)

**Support:** jordan@prosodylabs.com.au
