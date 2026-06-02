/* Margexa v2 — In-app Documentation
   4 sections: Quick Start · Attribution · Policies · CFO Report
   Registered globally as DocsPage for app-entry router.
*/

const { useState } = React;

// ─── Inline code block (syntax-highlighted via CSS only)
function Code({ children, lang = 'js' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(children).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ position: 'relative', marginTop: 12 }}>
      <pre style={{
        background: 'var(--ink)', color: '#e2e8f0', borderRadius: 10,
        padding: '14px 16px', overflowX: 'auto', fontSize: 12.5,
        lineHeight: 1.7, margin: 0, fontFamily: 'var(--font-mono)',
      }}><code>{children}</code></pre>
      <button onClick={copy} style={{
        position: 'absolute', top: 8, right: 8,
        background: copied ? 'var(--success)' : 'rgba(255,255,255,.1)',
        color: '#fff', border: 'none', borderRadius: 5,
        padding: '3px 9px', fontSize: 10.5, cursor: 'pointer',
        fontFamily: 'var(--font-mono)', transition: 'background .15s',
      }}>{copied ? '✓ copied' : 'copy'}</button>
    </div>
  );
}

// ─── Section anchor heading
function H2({ id, children }) {
  return (
    <h2 id={id} style={{
      fontSize: 18, fontWeight: 600, color: 'var(--ink)',
      marginBottom: 8, marginTop: 0, scrollMarginTop: 72,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>{children}</h2>
  );
}

// ─── Badge pill
function Pill({ children, tone = 'accent' }) {
  const colors = {
    accent:  { bg: 'var(--accent-tint)',   color: 'var(--accent)'  },
    success: { bg: 'var(--success-tint)',  color: 'var(--success)' },
    warning: { bg: 'var(--warning-tint)',  color: 'var(--warning)' },
    neutral: { bg: 'var(--surface-2)',     color: 'var(--ink-3)'   },
  };
  const c = colors[tone] || colors.neutral;
  return (
    <span className="mono" style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 99, background: c.bg, color: c.color,
    }}>{children}</span>
  );
}

// ─── Attribute row for the Attribution table
function AttrRow({ header, required, desc, example }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '220px 60px 1fr',
      gap: '0 16px', padding: '12px 0',
      borderBottom: '1px solid var(--line)',
      alignItems: 'start',
    }}>
      <code style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)',
        background: 'var(--accent-tint)', padding: '2px 6px', borderRadius: 4,
        alignSelf: 'center',
      }}>{header}</code>
      <div style={{ paddingTop: 3 }}>
        {required
          ? <Pill tone="accent">req</Pill>
          : <Pill tone="neutral">opt</Pill>}
      </div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{desc}</div>
        {example && (
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 3 }}>
            e.g. <span style={{ color: 'var(--ink-2)' }}>{example}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Policy type card
function PolicyCard({ type, tone, title, desc, example }) {
  const tones = {
    accent:  { border: 'var(--accent-soft)',          bg: 'var(--accent-tint)'  },
    success: { border: 'rgba(14,159,110,.25)',         bg: 'var(--success-tint)' },
    warning: { border: 'rgba(184,119,11,.25)',         bg: 'var(--warning-tint)' },
    neutral: { border: 'var(--line-2)',               bg: 'var(--surface-2)'    },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div style={{
      border: `1px solid ${t.border}`, borderRadius: 10, padding: '14px 16px',
      background: t.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Pill tone={tone}>{type}</Pill>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{title}</span>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{desc}</p>
      {example && (
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          threshold: <span style={{ color: 'var(--ink)' }}>{example}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Docs Page
function DocsPage() {
  const sections = [
    { id: 'quickstart',  label: 'Quick Start'  },
    { id: 'attribution', label: 'Attribution'  },
    { id: 'policies',    label: 'Policies'     },
    { id: 'cfo-report',  label: 'CFO Report'   },
  ];

  const [activeSec, setActiveSec] = useState('quickstart');

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSec(id);
  };

  return (
    <div style={{ display: 'flex', gap: 32, maxWidth: 1100 }}>

      {/* ── Sticky sidebar TOC ── */}
      <aside style={{ width: 180, flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: 72 }}>
          <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8, padding: '0 8px' }}>
            On this page
          </div>
          {sections.map((s) => (
            <button key={s.id} onClick={() => scrollTo(s.id)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: activeSec === s.id ? 500 : 400,
              background: activeSec === s.id ? 'var(--surface-2)' : 'transparent',
              color: activeSec === s.id ? 'var(--ink)' : 'var(--ink-3)',
              transition: 'all .1s',
            }}>{s.label}</button>
          ))}
        </div>
      </aside>

      {/* ── Content ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 48 }}>

        {/* ── 1. Quick Start ── */}
        <section id="quickstart" style={{ scrollMarginTop: 72 }}>
          <H2 id="quickstart">
            <span style={{ color: 'var(--accent)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>01</span>
            Quick Start
          </H2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.75 }}>
            Two ways to integrate — pick the one that fits your stack. The <span className="mono" style={{ color: 'var(--accent)' }}>@margexa/node</span> SDK gives you one-line business context; the raw proxy works with any OpenAI-compatible client.
          </p>

          {/* ── Option A — @margexa/node SDK (recommended) ── */}
          <div style={{
            background: 'var(--surface)', border: '2px solid var(--accent-soft)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 12,
            boxShadow: '0 0 0 4px var(--accent-tint)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Pill tone="accent">Recommended</Pill>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>@margexa/node SDK — 3 lines of code</span>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              Install once, then attach business metadata (customer, workflow, agent) with <code className="mono" style={{ color: 'var(--accent)' }}>withContext()</code>.
              Every call is automatically routed through Margexa.
            </p>
            <Code lang="bash">{`npm install @margexa/node openai`}</Code>
            <Code lang="js">{`const { MargeXa } = require('@margexa/node');

const mx = new MargeXa({ apiKey: 'mrg_live_...' });

const completion = await mx
  .withContext({ customerId: '42', workflow: 'invoice_extraction' })
  .chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Extract the invoice total.' }],
  });`}</Code>
          </div>

          {/* ── Option B — Raw proxy (any client) ── */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Pill tone="neutral">Alternative</Pill>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Raw proxy — change one line</span>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              Already using the OpenAI client? Just change the <code className="mono">baseURL</code> and add your Margexa key. Business metadata goes in headers.
            </p>
            <TabSnippets />
          </div>

          {/* Step 1 */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10,
            padding: '14px 16px', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent), #8B5CF6)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 10, fontWeight: 700,
              }}>1</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                Get your API key from Settings → API Keys
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              Your key starts with <code className="mono" style={{ color: 'var(--accent)' }}>mrg_live_</code>.
              Keep it secret — it identifies your workspace and links every request to your org.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10,
            padding: '14px 16px', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent), #8B5CF6)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 10, fontWeight: 700,
              }}>2</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                Install the SDK or point your client at the proxy endpoint (above)
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              With the SDK: <code className="mono" style={{ color: 'var(--accent)' }}>npm install @margexa/node openai</code>.
              Without it: set <code className="mono">baseURL</code> to <code className="mono">https://api.margexa.io/v1</code> in your existing OpenAI client.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10,
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent), #8B5CF6)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 10, fontWeight: 700,
              }}>3</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                Watch requests appear on the Dashboard
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              Every proxied call is logged with model, tokens, cost, latency, and any business metadata you attached. The Dashboard refreshes every 5 seconds. Circuit breakers protect against agent runaway loops automatically.
            </p>
          </div>
        </section>

        {/* ── 2. Attribution ── */}
        <section id="attribution" style={{ scrollMarginTop: 72 }}>
          <H2 id="attribution">
            <span style={{ color: 'var(--success)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>02</span>
            Attribution Headers
          </H2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.75 }}>
            Attribution is what makes Margexa's margin analysis possible. Add these HTTP headers to every request and Margexa can answer: <em>which customer is burning margin, which feature is too expensive, which plan is underwater?</em>
          </p>

          <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '220px 60px 1fr',
              gap: '0 16px', padding: '8px 16px',
              background: 'var(--surface-2)', borderBottom: '1px solid var(--line)',
            }}>
              <span className="eyebrow" style={{ fontSize: 10 }}>Header</span>
              <span className="eyebrow" style={{ fontSize: 10 }}>Required</span>
              <span className="eyebrow" style={{ fontSize: 10 }}>Description</span>
            </div>
            <div style={{ padding: '0 16px' }}>
              <AttrRow
                header="X-Customer-Id"
                required={false}
                desc="Your internal customer ID. Ties LLM spend to a specific customer row. Powers the margin-destroyer view and per-customer cost drill-down."
                example="cus_8f3a2b or 42"
              />
              <AttrRow
                header="X-Customer-External-Id"
                required={false}
                desc="Your Stripe customer ID (if using Stripe Sync). Lets Margexa join LLM cost with billing revenue to compute real gross margin per customer."
                example="cus_QxK92kNv"
              />
              <AttrRow
                header="X-Plan-Id"
                required={false}
                desc="The subscription plan this request belongs to. Enables per-plan unit economics: how much AI cost vs how much monthly revenue does each plan generate?"
                example="pro or plan_starter"
              />
              <AttrRow
                header="X-Feature"
                required={false}
                desc="The product feature triggering this call. Identifies which features are AI-cost-heavy so you can re-price, restrict, or optimize them selectively."
                example="support-chat or autocomplete"
              />
              <AttrRow
                header="X-Workflow"
                required={false}
                desc="The workflow or agent name. Useful when a single feature chains multiple LLM calls — workflow attribution groups them for aggregate cost analysis."
                example="ticket-resolution or summarize"
              />
            </div>
          </div>

          <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--ink-4)', lineHeight: 1.6 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Attribution quality score</span> — visible on the Dashboard — shows what % of your requests carry at least one business header. Aim for 80 %+.
          </p>
        </section>

        {/* ── 3. Policies ── */}
        <section id="policies" style={{ scrollMarginTop: 72 }}>
          <H2 id="policies">
            <span style={{ color: 'var(--warning)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>03</span>
            Policies
          </H2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.75 }}>
            Policies are the enforcement layer. They fire on every proxied request, in real time, before the call reaches the upstream LLM. Four policy types cover the most common margin-protection patterns.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <PolicyCard
              type="budget_cap"
              tone="warning"
              title="Budget Cap"
              desc="Hard spending ceiling per scope (org / plan / customer / feature). Blocks the call with a 429 when the monthly budget is exceeded."
              example="$200 / month"
            />
            <PolicyCard
              type="fallback_model"
              tone="success"
              title="Fallback Model"
              desc="Automatically routes requests to a cheaper model when a cost threshold is crossed. Zero latency impact — the swap is transparent to the caller."
              example="gpt-4o → gpt-4o-mini"
            />
            <PolicyCard
              type="premium_model_restriction"
              tone="accent"
              title="Premium Restriction"
              desc="Limits premium model access to specific plans. Free-tier requests asking for gpt-4o are silently downgraded to the economy model defined in the policy."
              example="scope: plan = free"
            />
            <PolicyCard
              type="alert_threshold"
              tone="neutral"
              title="Alert Threshold"
              desc="Fires a notification (dashboard + email) when spend crosses a soft limit. Does not block — purely observational. Useful for budget-warning escalation."
              example="80% of budget cap"
            />
          </div>

          <div style={{
            border: '1px solid var(--line)', borderRadius: 10, padding: '12px 16px',
            background: 'var(--surface)',
          }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>
              Enforcement modes
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12.5, color: 'var(--ink-2)' }}>
              <div>
                <Pill tone="accent">enforce</Pill>
                <span style={{ marginLeft: 8 }}>Policy is active — violations are blocked or rerouted.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12.5, color: 'var(--ink-2)', marginTop: 6 }}>
              <div>
                <Pill tone="neutral">observe</Pill>
                <span style={{ marginLeft: 8 }}>Policy logs violations but does not block. Safe way to test a rule before enforcing it.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. CFO Report ── */}
        <section id="cfo-report" style={{ scrollMarginTop: 72 }}>
          <H2 id="cfo-report">
            <span style={{ color: 'var(--ink-3)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>04</span>
            CFO Report
          </H2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.75 }}>
            The CFO Report turns your raw LLM spend data into board-ready margin analysis. It's designed for Finance and Leadership — no engineering context required to understand it.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                icon: '📊',
                title: 'Gross AI Margin per Plan',
                desc: 'For each subscription plan: monthly revenue (synced from Stripe), total AI cost incurred, and the resulting gross margin. A plan with −12 % margin is losing money.',
              },
              {
                icon: '🛡️',
                title: 'Margin Protection Summary',
                desc: 'Total spend saved by active policies this month: blocked waste (429 responses), rerouted spend (fallback switches), and alert-triggered manual interventions.',
              },
              {
                icon: '🔥',
                title: 'Top Margin Destroyers',
                desc: 'The 5 customers or features with the highest negative margin impact. Sorted by (AI cost − attributed revenue). First candidates for policy enforcement.',
              },
              {
                icon: '📈',
                title: 'Weekly Cost Trend',
                desc: 'Day-by-day AI spend for the past 7 days. Used to catch sudden spikes — a runaway agent or an unexpected feature launch — before they hit the monthly cap.',
              },
            ].map((item) => (
              <div key={item.title} style={{
                display: 'flex', gap: 14, background: 'var(--surface)',
                border: '1px solid var(--line)', borderRadius: 10, padding: '14px 16px',
              }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.65 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16, border: '1px solid var(--line)', borderRadius: 10, padding: '12px 16px',
            background: 'var(--surface)',
          }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>
              Export formats
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{
                flex: 1, border: '1px solid var(--line-2)', borderRadius: 8,
                padding: '10px 12px', background: 'var(--bg)',
              }}>
                <Pill tone="success">CSV</Pill>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>
                  Machine-readable export. Paste into Excel or import into your BI tool.
                  Endpoint: <code className="mono" style={{ color: 'var(--accent)', fontSize: 11 }}>GET /api/cfo/weekly/csv</code>
                </div>
              </div>
              <div style={{
                flex: 1, border: '1px solid var(--line-2)', borderRadius: 8,
                padding: '10px 12px', background: 'var(--bg)',
              }}>
                <Pill tone="neutral">PDF</Pill>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>
                  Printable HTML report. Send directly to Finance or a board meeting.
                  Endpoint: <code className="mono" style={{ color: 'var(--accent)', fontSize: 11 }}>GET /api/cfo/weekly/pdf</code>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// ─── Tab-switcher code snippets (Node / Python / cURL)
function TabSnippets() {
  const [tab, setTab] = useState('node');
  const proxy = window.MARGEXA?.organization?.proxy_url ?? 'https://your-domain.com/ai';
  const snippets = {
    node: `import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'mrg_YOUR_KEY_HERE',
  baseURL: '${proxy}/v1',   // ← only change
});

const res = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello' }],
}, {
  headers: {
    'X-Customer-Id': '42',
    'X-Feature':     'support-chat',
    'X-Plan-Id':     'pro',
  },
});`,
    python: `from openai import OpenAI

client = OpenAI(
    api_key="mrg_YOUR_KEY_HERE",
    base_url="${proxy}/v1",   # ← only change
    default_headers={
        "X-Customer-Id": "42",
        "X-Feature":     "support-chat",
        "X-Plan-Id":     "pro",
    },
)

res = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello"}],
)`,
    curl: `curl -X POST ${proxy}/v1/chat/completions \\
  -H "Authorization: Bearer mrg_YOUR_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -H "X-Customer-Id: 42" \\
  -H "X-Feature: support-chat" \\
  -H "X-Plan-Id: pro" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"Hello"}]
  }'`,
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: 2, marginBottom: 0 }}>
        {[['node', 'Node.js'], ['python', 'Python'], ['curl', 'cURL']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '5px 12px', border: 'none', cursor: 'pointer', fontSize: 11.5,
            fontFamily: 'var(--font-mono)', fontWeight: 500,
            background: tab === k ? 'var(--ink)' : 'var(--surface-2)',
            color: tab === k ? '#fff' : 'var(--ink-3)',
            borderRadius: k === 'node' ? '6px 0 0 6px' : k === 'curl' ? '0 6px 6px 0' : 0,
            transition: 'all .1s',
          }}>{l}</button>
        ))}
      </div>
      <Code lang={tab}>{snippets[tab]}</Code>
    </div>
  );
}

Object.assign(window, { DocsPage });
