/* Margexa v2 — Prompt Observability page
   Explorer · selected prompt detail · replay · A/B diff
*/

const { useEffect, useState } = React;

// ─── Inline mini-bar for inline cost share
function MicroBar({ pct, color = 'var(--accent)' }) {
  return (
    <div style={{ width: 60, height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color }} />
    </div>
  );
}

// ─── Prompt row in left list
function PromptRow({ p, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      padding: '14px 16px',
      background: selected ? 'var(--accent-tint)' : 'transparent',
      border: '1px solid', borderColor: selected ? 'var(--accent-soft)' : 'transparent',
      borderRadius: 8, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 14,
      transition: 'all .12s',
    }}
    onMouseEnter={(e) => !selected && (e.currentTarget.style.background = 'var(--surface-2)')}
    onMouseLeave={(e) => !selected && (e.currentTarget.style.background = 'transparent')}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {p.warn && <span style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--warning)' }} />}
          <span className="mono" style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mono tnum" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>{p.calls.toLocaleString()} · {p.team}</span>
          <MicroBar pct={p.pct} color={p.warn ? 'var(--warning)' : 'var(--accent)'} />
        </div>
      </div>
      <span className="mono tnum" style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>${p.cost}</span>
    </button>
  );
}

// ─── Prompt body card (with version pills)
function PromptBody() {
  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Prompt</div>
            <div className="mono" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>extract_invoice_fields · v8</div>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8 }}>
            {[
              { v: 'v8', active: true, date: 'now' },
              { v: 'v7', date: '3d' },
              { v: 'v6', date: '1w' },
              { v: 'v5', date: '2w' },
            ].map((v) => (
              <button key={v.v} style={{
                padding: '4px 10px', borderRadius: 5, fontSize: 11, fontFamily: 'var(--font-mono)',
                background: v.active ? 'var(--surface)' : 'transparent',
                border: '1px solid', borderColor: v.active ? 'var(--line-2)' : 'transparent',
                color: v.active ? 'var(--ink)' : 'var(--ink-3)', cursor: 'pointer', fontWeight: v.active ? 500 : 400,
              }}>{v.v} <span style={{ color: 'var(--ink-4)', marginLeft: 4 }}>{v.date}</span></button>
            ))}
          </div>
        </div>
        <pre className="mono" style={{
          margin: 0, padding: 18, background: 'var(--ink)', color: '#E6E6EC',
          borderRadius: 'var(--r-md)', fontSize: 12, lineHeight: 1.65, overflowX: 'auto',
        }}>
{`You are an expert at extracting structured data from
invoice PDFs. Given a raw OCR transcript, return JSON:

{
  "vendor": string,
  "invoice_number": string,
  "issue_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD" | null,
  "line_items": [{ "description": string, "amount": number }],
  "total": number,
  "currency": "EUR" | "USD" | "GBP"
}

Be strict. If a field is missing, set to null.
`}<span style={{ background: 'rgba(91,91,214,.18)', borderLeft: '2px solid var(--accent)', display: 'inline-block', padding: '0 6px', margin: '0 -6px' }}>{`Never invent values.`}</span>
        </pre>
        <div style={{ marginTop: 14, display: 'flex', gap: 14, fontSize: 12, color: 'var(--ink-3)', flexWrap: 'wrap' }}>
          <span><span className="mono" style={{ color: 'var(--ink-4)' }}>system</span> 124 tokens</span>
          <span><span className="mono" style={{ color: 'var(--ink-4)' }}>user</span> avg 1,840 tokens</span>
          <span><span className="mono" style={{ color: 'var(--ink-4)' }}>assistant</span> avg 412 tokens</span>
          <span style={{ marginLeft: 'auto' }} className="mono"><a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Open replay →</a></span>
        </div>
      </div>
    </Spotlight>
  );
}

// ─── A/B comparison
function ABDiff() {
  return (
    <Spotlight>
      <div style={{ padding: 22 }}>
        <SectionHead
          title="Output comparison"
          sub="Same input · two models · choose your trade-off"
          action={
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
              Run #2847 · 14:32:08
            </div>
          } />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { model: 'gpt-4o', cost: 0.026, lat: 1840, color: 'var(--accent)', winner: false,
              out: `{
  "vendor": "Acme Co.",
  "invoice_number": "INV-2847",
  "issue_date": "2025-04-12",
  "due_date": "2025-05-12",
  "total": 12842.50,
  "currency": "EUR"
}` },
            { model: 'claude-haiku', cost: 0.0014, lat: 740, color: 'var(--success)', winner: true,
              out: `{
  "vendor": "Acme Co.",
  "invoice_number": "INV-2847",
  "issue_date": "2025-04-12",
  "due_date": "2025-05-12",
  "total": 12842.50,
  "currency": "EUR"
}` },
          ].map((c, i) => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid', borderColor: c.winner ? c.color : 'var(--line)',
              borderRadius: 'var(--r-lg)', overflow: 'hidden', position: 'relative',
              boxShadow: c.winner ? '0 0 0 3px rgba(14,159,110,.12)' : 'none',
            }}>
              {c.winner && (
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <Badge tone="success" dot>Recommended</Badge>
                </div>
              )}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{c.model}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 14, flexShrink: 0 }}>
                  <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-3)' }}>${c.cost.toFixed(4)}</span>
                  <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{c.lat}ms</span>
                </span>
              </div>
              <pre className="mono" style={{ margin: 0, padding: 16, fontSize: 11.5, lineHeight: 1.6, color: 'var(--ink-2)', overflowX: 'auto', background: 'var(--bg)' }}>{c.out}</pre>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Quality score</span>
                <div style={{ flex: 1, height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: c.winner ? '94%' : '96%', height: '100%', background: c.winner ? c.color : 'var(--accent)' }} />
                </div>
                <span className="mono tnum" style={{ fontSize: 11.5, color: 'var(--ink)', fontWeight: 500 }}>{c.winner ? '94' : '96'}/100</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 16, padding: 16, background: 'var(--success-tint)', borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}><path d="M5 9l2 2 5-5" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="9" r="8" stroke="var(--success)" strokeWidth="1.4"/></svg>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>claude-haiku produces identical output 18× cheaper and 2.5× faster.</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Estimated savings if you switch: $184 / month.</div>
          </div>
          <Button variant="primary" size="sm">Add routing rule</Button>
        </div>
      </div>
    </Spotlight>
  );
}

// ─── Prompts page — wired to /api/analytics/workflows
function PromptsPage() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    fetch('/api/analytics/workflows', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (Array.isArray(json) && json.length > 0) {
          const topCost = json[0].total_cost;
          const mapped = json.map((r, i) => ({
            id:   i + 1,
            name: r.workflow ?? '—',
            team: r.workflow?.split('/')[0] ?? '—',  // prefix before "/" = team
            calls: r.calls ?? 0,
            cost:  parseFloat(r.total_cost ?? 0).toFixed(2),
            pct:   topCost > 0 ? Math.round((r.total_cost / topCost) * 100) : 0,
            warn:  topCost > 0 && r.total_cost / topCost > 0.5,
          }));
          setWorkflows(mapped);
          setSelectedId(mapped[0]?.id ?? null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = search
    ? workflows.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
    : workflows;

  const totalCalls = workflows.reduce((s, w) => s + w.calls, 0);
  const totalCost  = workflows.reduce((s, w) => s + parseFloat(w.cost), 0);

  return (
    <Stagger gap={50}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Prompt intelligence</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.04em', lineHeight: 1, margin: 0, color: 'var(--ink)' }}>Workflow observability</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {loading ? '…' : workflows.length} workflows · indexed every request
            </span>
            <Badge tone="success" dot>Streaming</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm">Export</Button>
          <Button variant="primary" size="sm">Open replay</Button>
        </div>
      </div>

      {/* Live stats strip derived from workflows data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { k: 'Workflows · 30d', v: workflows.length,  sp: [4,6,7,8,10,11,10,12,11,13,14,workflows.length], color: 'var(--ink)' },
          { k: 'Total cost',      v: totalCost, prefix: '$', dec: 2, sp: [4,5,6,8,9,10,12,14,16,18,20,totalCost], color: 'var(--accent)' },
          { k: 'Total calls',     v: totalCalls, sp: [100,120,130,140,150,160,170,180,190,200,210,totalCalls], color: 'var(--ink-3)' },
          { k: 'Top workflow',    v: workflows[0]?.cost ?? 0, prefix: '$', dec: 2, sp: [1,2,3,4,5,5,6,6,7,7,8,parseFloat(workflows[0]?.cost ?? 0)], color: 'var(--warning)' },
        ].map((c, i) => (
          <Spotlight key={i}>
            <div style={{ padding: 16, opacity: loading ? 0.5 : 1, transition: 'opacity .3s' }}>
              <div className="eyebrow">{c.k}</div>
              <div className="tnum" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
                {c.prefix || ''}<CountUp to={parseFloat(c.v) || 0} decimals={c.dec || 0} />{c.suf || ''}
              </div>
              <div style={{ marginTop: 6, marginLeft: -2 }}>
                <Spark data={c.sp} width={180} height={28} color={c.color} fill />
              </div>
            </div>
          </Spotlight>
        ))}
      </div>

      <div style={{ height: 12 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)', gap: 12, alignItems: 'start' }}>
        <Spotlight>
          <div style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: 'var(--surface-2)', marginBottom: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="var(--ink-4)" strokeWidth="1.5"/><path d="M20 20l-3.5-3.5" stroke="var(--ink-4)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input
                placeholder="Search workflows…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--ink)' }} />
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{filtered.length}</span>
            </div>
            <div className="eyebrow" style={{ padding: '8px 10px 4px', fontSize: 10 }}>By cost · last 30d</div>
            {loading ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading…</div>
            ) : (
              <div style={{ maxHeight: 740, overflowY: 'auto' }}>
                {filtered.map((p) => (
                  <PromptRow key={p.id} p={p} selected={p.id === selectedId} onClick={() => setSelectedId(p.id)} />
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: '24px 10px', textAlign: 'center', fontSize: 12, color: 'var(--ink-4)' }}>
                    No workflows match.
                  </div>
                )}
              </div>
            )}
          </div>
        </Spotlight>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PromptBody />
          <ABDiff />
        </div>
      </div>
    </Stagger>
  );
}

Object.assign(window, { PromptsPage });
