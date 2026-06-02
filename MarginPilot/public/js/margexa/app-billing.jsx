/* Margexa v2 — Billing page
   Current plan · usage · invoices · payment method
   Data: GET /api/billing/plan · GET /api/billing/invoices
*/

const { useEffect, useRef, useState } = React;

// ─── Plan card (hero) with usage bar — wired to /api/billing/plan
function PlanCard() {
  const [plan, setPlan]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch('/api/billing/plan', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setPlan(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cancelPlan = () => {
    if (!window.confirm('Cancel your subscription at end of period?')) return;
    setCancelling(true);
    fetch('/api/billing/cancel', {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '', 'Content-Type': 'application/json' },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.redirect) { window.location.href = res.redirect; return; }
        if (res.success) window.alert('Subscription will cancel at end of period.');
        else window.alert(res.error ?? 'Failed to cancel. Please contact support.');
      })
      .finally(() => setCancelling(false));
  };

  const upgradePlan = () => {
    fetch('/api/billing/upgrade', {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '', 'Content-Type': 'application/json' },
    })
      .then((r) => r.json())
      .then((res) => { if (res.redirect) window.location.href = res.redirect; });
  };

  const label       = loading ? '…' : (plan?.label ?? 'Starter');
  const priceUsd    = loading ? '…' : (plan?.price_usd ?? 0);
  const renewsAt    = loading ? '…' : (plan?.renews_at ?? '—');
  const spendUsed   = loading ? 0   : (plan?.spend_used ?? 0);
  const spendLimit  = loading ? 1   : (plan?.spend_limit ?? 10000);
  const spendPct    = loading ? 0   : (plan?.spend_pct ?? 0);
  const over80      = plan?.over_80pct ?? false;

  return (
    <Spotlight>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Badge tone="accent" dot>{label}</Badge>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>Renews {renewsAt}</span>
            </div>
            <h2 className="h-display" style={{ fontSize: 'clamp(28px, 3vw, 36px)', color: 'var(--ink)', margin: 0, lineHeight: 1.05 }}>
              {loading ? '…' : `$${priceUsd.toLocaleString()}`}
              <span style={{ fontSize: 16, color: 'var(--ink-4)', fontWeight: 400, fontFamily: 'var(--font-sans)', fontStyle: 'normal' }}> / month</span>
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6, marginBottom: 0 }}>
              Up to <span className="mono">${(spendLimit / 1000).toLocaleString()}k</span> AI spend / month · unlimited workspaces.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Button variant="secondary" size="md" onClick={cancelPlan} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel plan'}
            </Button>
            <Button variant="primary" size="md" onClick={upgradePlan}>Upgrade →</Button>
          </div>
        </div>

        {/* Usage bar */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>AI spend this period</span>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              <span className="mono tnum" style={{ color: 'var(--ink)', fontWeight: 500 }}>${spendUsed.toLocaleString()}</span>
              {' of '}
              <span className="mono tnum">${(spendLimit / 1000).toLocaleString()}k</span>
            </span>
          </div>
          <div style={{ position: 'relative', height: 10, background: 'var(--surface-2)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(spendPct, 100)}%`, height: '100%',
              background: `linear-gradient(90deg, ${over80 ? 'var(--warning)' : 'var(--accent)'}, ${over80 ? 'var(--danger)' : 'var(--accent-soft)'})`,
              transition: 'width .8s var(--ease)',
            }} />
            {[50, 80].map((m) => (
              <span key={m} style={{ position: 'absolute', top: -2, left: `${m}%`, width: 1, height: 14, background: 'var(--ink-5)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }} className="mono">
            <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>$0</span>
            <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>${(spendLimit / 2000).toFixed(0)}k</span>
            <span style={{ fontSize: 10.5, color: 'var(--warning)' }}>80% · ${(spendLimit * 0.8 / 1000).toFixed(0)}k</span>
            <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>${(spendLimit / 1000).toLocaleString()}k cap</span>
          </div>
          {over80 && (
            <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--warning-tint)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--ink-2)' }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}><circle cx="9" cy="9" r="7" stroke="var(--warning)" strokeWidth="1.4"/><path d="M9 5v4M9 11v.5" stroke="var(--warning)" strokeWidth="1.4" strokeLinecap="round"/></svg>
              <span style={{ flex: 1 }}>You are above 80% of your AI spend limit. Consider upgrading to avoid overage charges.</span>
              <Button variant="secondary" size="sm" onClick={upgradePlan}>Upgrade</Button>
            </div>
          )}
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Metering breakdown
function Metering() {
  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead title="Metering" sub="What we charge for · current period" />
        {[
          { l: 'AI spend volume', v: '$190,420', desc: 'pass-through cost from providers', extra: '0.0% markup' },
          { l: 'Routed requests', v: '658,293', desc: 'every call through the gateway', extra: 'no per-request fee' },
          { l: 'Workspaces', v: '4 / unlimited', desc: 'production, staging, dev, testing', extra: 'included' },
          { l: 'Members', v: '14 / unlimited', desc: 'invited and active', extra: 'included' },
          { l: 'Prompt retention', v: '1 year', desc: 'full payload + completions', extra: 'included' },
          { l: 'SSO + SAML + SCIM', v: 'Enabled', desc: 'okta · 14 users provisioned', extra: 'included' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{r.l}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{r.desc}</div>
            </div>
            <div className="tnum mono" style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>{r.v}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', minWidth: 120, textAlign: 'right' }}>{r.extra}</div>
          </div>
        ))}
      </div>
    </Spotlight>
  );
}

// ─── Invoices table — wired to /api/billing/invoices
function Invoices() {
  const [inv, setInv]         = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/billing/invoices', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setInv(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Spotlight>
      <div style={{ padding: '22px 22px 0' }}>
        <SectionHead
          title="Invoices"
          sub="All invoices in PDF · synced from Stripe"
          action={<a href="#" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Open Stripe portal →</a>} />
      </div>
      {loading && (
        <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>Loading…</div>
      )}
      {!loading && inv.length === 0 && (
        <div style={{ padding: '32px 22px', fontSize: 13, color: 'var(--ink-4)' }}>
          No invoices yet. Invoices appear after your first billing cycle and require Stripe to be configured.
        </div>
      )}
      {!loading && inv.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
                {['Invoice', 'Date', 'Description', 'Amount', 'Status', ''].map((h, i) => (
                  <th key={h} className="mono" style={{
                    textAlign: i >= 3 && i < 5 ? 'right' : i === 5 ? 'right' : 'left',
                    padding: '10px 16px', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inv.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: i === inv.length - 1 ? 'none' : '1px solid var(--line)' }}>
                  <td className="mono" style={{ padding: '12px 16px', color: 'var(--ink)', fontWeight: 500 }}>{row.id}</td>
                  <td className="mono" style={{ padding: '12px 16px', color: 'var(--ink-3)' }}>{row.date}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{row.period}</td>
                  <td className="mono tnum" style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--ink)', fontWeight: 500 }}>
                    ${parseFloat(row.amount ?? 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                    <Badge tone={row.status === 'paid' ? 'success' : row.status === 'open' ? 'warning' : 'outline'} dot>
                      {row.status}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                    {row.pdf_url
                      ? <a href={row.pdf_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Download PDF ↓</a>
                      : <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Spotlight>
  );
}

// ─── Payment method
function PaymentMethod() {
  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead title="Payment method" sub="Used for monthly subscription + any overage" action={<Button variant="secondary" size="sm">Update</Button>} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' }}>
          <span style={{
            width: 44, height: 32, borderRadius: 5,
            background: 'linear-gradient(135deg, #0E0E10, #2A2A2E)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 13, fontStyle: 'italic',
            position: 'relative', flexShrink: 0,
          }}>
            <span style={{ position: 'absolute', top: 4, left: 4, width: 8, height: 6, background: 'var(--accent)', borderRadius: 1 }} />
            VISA
          </span>
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 13, color: 'var(--ink)' }}>•••• •••• •••• 4242</div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 2 }}>Expires 09 / 2027 · billing@acme.com</div>
          </div>
          <Badge tone="success" dot>Default</Badge>
        </div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Need invoice billing? <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Contact sales →</a></span>
          <Button variant="secondary" size="sm" icon={<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}>Add backup card</Button>
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Spend forecast chart
function SpendForecast() {
  // 18 data points: 12 historical + 6 forecast
  const data = [];
  for (let i = 0; i < 18; i++) {
    if (i < 12) data.push(60 + i * 12 + Math.sin(i / 2) * 14);
    else data.push(data[i - 1] + 8 + Math.random() * 4);
  }
  const W = 720, H = 180, P = 24;
  const max = Math.max(...data);
  const xs = (i) => P + (i / (data.length - 1)) * (W - 2 * P);
  const ys = (v) => H - P - (v / max) * (H - 2 * P);
  const histPath = data.slice(0, 12).map((v, i) => (i === 0 ? `M${xs(i)},${ys(v)}` : `L${xs(i)},${ys(v)}`)).join(' ');
  const forecastPath = data.slice(11).map((v, i) => (i === 0 ? `M${xs(i + 11)},${ys(v)}` : `L${xs(i + 11)},${ys(v)}`)).join(' ');
  const area = `${histPath} L${xs(11)},${H - P} L${xs(0)},${H - P} Z`;
  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Spend forecast"
          sub="Projection based on the last 12 months"
          action={<Badge tone="warning" dot>$246k projected · over plan</Badge>} />
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
          <defs>
            <linearGradient id="forecastGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#5B5BD6" stopOpacity=".18"/>
              <stop offset="1" stopColor="#5B5BD6" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((p, i) => (
            <line key={i} x1={P} x2={W - P} y1={P + p * (H - 2 * P)} y2={P + p * (H - 2 * P)} stroke="var(--line)" strokeDasharray="2 4" />
          ))}
          {/* plan cap line */}
          <line x1={P} x2={W - P} y1={ys(220)} y2={ys(220)} stroke="var(--warning)" strokeWidth="1" strokeDasharray="4 4" />
          <text x={W - P - 6} y={ys(220) - 4} textAnchor="end" fontSize="10" fill="var(--warning)" fontFamily="var(--font-mono)">$250k cap</text>
          <path d={area} fill="url(#forecastGrad)" />
          <path d={histPath} fill="none" stroke="var(--accent)" strokeWidth="1.8" />
          <path d={forecastPath} fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeDasharray="5 3" />
          <circle cx={xs(11)} cy={ys(data[11])} r="4" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>12 months ago</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink)' }}>now</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>+6 months</span>
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Billing page
function BillingPage() {
  return (
    <Stagger gap={50}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.04em', lineHeight: 1, margin: 0, color: 'var(--ink)' }}>Billing</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Subscription, invoices, and usage projection</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm">Tax info</Button>
          <Button variant="secondary" size="sm">Download all (CSV)</Button>
        </div>
      </div>

      <PlanCard />
      <div style={{ height: 12 }} />
      <SpendForecast />
      <div style={{ height: 12 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 12 }}>
        <Metering />
        <PaymentMethod />
      </div>
      <div style={{ height: 12 }} />
      <Invoices />
    </Stagger>
  );
}

Object.assign(window, { BillingPage });
