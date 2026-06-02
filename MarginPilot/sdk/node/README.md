# @margexa/node

Official Node.js SDK for the [Margexa](https://margexa.io) LLM gateway.

Every call through Margexa gets **cost tracking, policy enforcement, and business attribution** with zero refactoring.

## Install

```bash
npm install @margexa/node openai
```

## Quick Start

```js
const { MargeXa } = require('@margexa/node');

const mx = new MargeXa({ apiKey: 'mrg_live_...' });

const completion = await mx
  .withContext({ customerId: '42', workflow: 'invoice_extraction' })
  .chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Extract the invoice total.' }],
  });

console.log(completion.choices[0].message.content);
```

That's it. Every request now appears in your Margexa dashboard with full cost attribution.

## `withContext(ctx)` — Business metadata

| Field                | Header sent            | Purpose                              |
|----------------------|------------------------|--------------------------------------|
| `customerId`         | `X-Customer-Id`        | Link cost to a customer record       |
| `customerExternalId` | `X-Customer-External-Id` | Your own ID (Stripe, CRM, etc.)    |
| `planId`             | `X-Plan-Id`            | Apply plan-specific policies         |
| `plan`               | `X-Plan`               | Plan name (starter, pro, enterprise) |
| `featureId`          | `X-Feature-Id`         | Track cost per product feature       |
| `feature`            | `X-Feature`            | Feature name                         |
| `workflow`           | `X-Workflow`           | Named workflow (invoice_extraction)  |
| `agentId`            | `X-Agent-Id`           | Agent ID for circuit-breaker scope   |

`withContext()` is **immutable** — it returns a new instance, so you can safely share a base client and branch per request.

## Supported Models

All models in the [Margexa catalog](https://margexa.io/docs/models) are supported:

- `gpt-4o`, `gpt-4o-mini` (OpenAI)
- `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022` (Anthropic)

## Environment Variables

```bash
MARGEXA_API_KEY=mrg_live_...
MARGEXA_BASE_URL=https://api.margexa.io  # optional
```

```js
const mx = new MargeXa({ apiKey: process.env.MARGEXA_API_KEY });
```

## License

MIT © Margexa
