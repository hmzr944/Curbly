/* Margexa v3 — Onboarding
   3 étapes : org · provider · integration
   Dark canvas · 480px centré · progress dots
*/

const { useEffect, useRef, useState } = React;

// ─── Progress dots
function Dots({ active, total = 3 }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 52 }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} style={{
          height: 6, borderRadius: 3,
          width: i === active ? 28 : 8,
          background: i < active ? 'rgba(255,255,255,.35)' : i === active ? 'var(--accent)' : 'rgba(255,255,255,.12)',
          transition: 'all .35s var(--ease)',
        }} />
      ))}
    </div>
  );
}

// ─── Dark input
function DarkInput({ value, onChange, placeholder, type = 'text', autoFocus, error, onKeyDown, onFocus, onBlur }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoFocus={autoFocus}
      autoComplete={type === 'password' ? 'new-password' : 'off'}
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      style={{
        width: '100%', boxSizing: 'border-box',
        padding: '12px 14px', fontSize: 14,
        background: 'rgba(255,255,255,.07)',
        border: `1px solid ${error ? 'var(--danger)' : focused ? 'var(--accent)' : 'rgba(255,255,255,.14)'}`,
        borderRadius: 8, color: '#fff', outline: 'none',
        fontFamily: 'var(--font-sans)',
        transition: 'border-color .15s',
      }}
    />
  );
}

// ─── Dark button primary
function DarkBtn({ children, onClick, disabled, loading, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width: '100%', padding: '12px 16px', fontSize: 14, fontWeight: 500,
      background: disabled || loading ? 'rgba(91,91,214,.4)' : 'var(--accent)',
      color: disabled || loading ? 'rgba(255,255,255,.4)' : '#fff',
      border: 'none', borderRadius: 8,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'background .15s, color .15s',
      ...style,
    }}>
      {loading ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, border: '1.5px solid rgba(255,255,255,.4)', borderTopColor: 'white', display: 'inline-block', animation: 'obSpin .6s linear infinite' }} />
          {children}
        </span>
      ) : children}
    </button>
  );
}

// ─── Étape 1 : Organisation
function StepOrg({ go }) {
  const [name, setName]     = useState(window.MARGEXA?.organization?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(null);

  const submit = () => {
    if (!name.trim()) { setErr('Please enter a workspace name.'); return; }
    setSaving(true); setErr(null);
    fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' },
      body: JSON.stringify({ organization_name: name.trim() }),
    })
      .then(r => r.json())
      .then(json => {
        setSaving(false);
        if (json.success || json.organization_id) go(1);
        else setErr(json.message ?? 'Failed to save.');
      })
      .catch(() => { setSaving(false); go(1); });
  };

  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: '.10em', textTransform: 'uppercase', marginBottom: 10 }}>Step 1 of 3</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 36, color: '#fff', margin: '0 0 8px', lineHeight: 1.1 }}>Name your workspace.</h2>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', margin: '0 0 32px', lineHeight: 1.5 }}>
        A workspace holds your providers, policies, and team.
      </p>
      <label className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Organization name</label>
      <DarkInput
        value={name}
        onChange={e => { setName(e.target.value); setErr(null); }}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Acme Inc."
        autoFocus
        error={!!err}
      />
      {err && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--danger)' }}>{err}</div>}
      <div style={{ marginTop: 24 }}>
        <DarkBtn onClick={submit} loading={saving}>{saving ? 'Saving…' : 'Continue →'}</DarkBtn>
      </div>
    </div>
  );
}

// ─── Étape 2 : Provider
const PROVIDERS = [
  { id: 'openai',    n: 'OpenAI',    s: 'GPT-4o, GPT-4o-mini, o1',   c: '#0E0E10', placeholder: 'sk-proj-…' },
  { id: 'anthropic', n: 'Anthropic', s: 'Claude Sonnet, Haiku',       c: '#B97A0B', placeholder: 'sk-ant-…' },
];
const COMING_SOON = [
  { n: 'Gemini' },
  { n: 'Mistral' },
  { n: 'Bedrock' },
];

function ProviderVerifyRow({ p, onVerified }) {
  const [open, setOpen]         = useState(false);
  const [key, setKey]           = useState('');
  const [status, setStatus]     = useState(null); // null | 'verifying' | 'ok' | 'err'
  const [errMsg, setErrMsg]     = useState(null);

  const verify = () => {
    if (!key.trim()) return;
    setStatus('verifying'); setErrMsg(null);
    fetch('/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' },
      body: JSON.stringify({ provider: p.id, api_key: key.trim() }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) { setStatus('ok'); onVerified(p.id); }
        else { setStatus('err'); setErrMsg(json.message ?? 'Invalid key — check and retry.'); }
      })
      .catch(() => { setStatus('err'); setErrMsg('Network error — please retry.'); });
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', textAlign: 'left', cursor: 'pointer', padding: '14px 16px',
        borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12,
        background: open ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.04)',
        border: `1px solid ${open ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.08)'}`,
        transition: 'all .15s',
      }}>
        <span style={{ width: 32, height: 32, borderRadius: 8, background: p.c, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15 }}>{p.n[0]}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{p.n}</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>{p.s}</div>
        </div>
        {status === 'ok' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="var(--success)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Connected
          </span>
        )}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}><path d="M2 4l3 3 3-3" stroke="rgba(255,255,255,.4)" strokeWidth="1.4" strokeLinecap="round"/></svg>
      </button>

      {open && status !== 'ok' && (
        <div style={{ padding: '12px 16px', animation: 'obFade .2s both' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <DarkInput
              value={key}
              onChange={e => { setKey(e.target.value); setStatus(null); setErrMsg(null); }}
              onKeyDown={e => e.key === 'Enter' && verify()}
              placeholder={p.placeholder}
              type="password"
              error={status === 'err'}
            />
            <button onClick={verify} disabled={!key.trim() || status === 'verifying'} style={{
              flexShrink: 0, padding: '0 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: key.trim() && status !== 'verifying' ? 'var(--accent)' : 'rgba(255,255,255,.1)',
              color: key.trim() && status !== 'verifying' ? '#fff' : 'rgba(255,255,255,.3)',
              border: 'none', cursor: key.trim() ? 'pointer' : 'not-allowed',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'all .15s',
            }}>
              {status === 'verifying' ? (
                <span style={{ width: 13, height: 13, borderRadius: 7, border: '1.5px solid rgba(255,255,255,.3)', borderTopColor: 'white', display: 'inline-block', animation: 'obSpin .6s linear infinite' }} />
              ) : 'Verify'}
            </button>
          </div>
          {errMsg && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--danger)' }}>{errMsg}</div>}
        </div>
      )}
    </div>
  );
}

function StepProvider({ go }) {
  const [verified, setVerified] = useState({});
  const anyVerified = Object.values(verified).some(Boolean);

  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: '.10em', textTransform: 'uppercase', marginBottom: 10 }}>Step 2 of 3</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 36, color: '#fff', margin: '0 0 8px', lineHeight: 1.1 }}>Connect a provider.</h2>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', margin: '0 0 28px', lineHeight: 1.5 }}>
        Keys are encrypted with a per-workspace key. Never stored in cleartext.
      </p>

      {PROVIDERS.map(p => (
        <ProviderVerifyRow key={p.id} p={p} onVerified={id => setVerified(v => ({ ...v, [id]: true }))} />
      ))}

      {/* Coming soon */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {COMING_SOON.map((p, i) => (
          <span key={i} style={{
            padding: '6px 12px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)',
            background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
            color: 'rgba(255,255,255,.25)',
          }}>
            {p.n} <span style={{ fontSize: 10, opacity: .7 }}>soon</span>
          </span>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <DarkBtn onClick={() => go(2)} disabled={false}>
          {anyVerified ? 'Continue →' : 'Continue →'}
        </DarkBtn>
        <button onClick={() => go(2)} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 13, color: 'rgba(255,255,255,.35)', padding: '6px 0',
          textDecoration: 'underline', textUnderlineOffset: 3,
        }}>Skip for now</button>
      </div>
    </div>
  );
}

// ─── Étape 3 : Integration
const CODE_SNIPPETS = {
  'Node.js': (url) =>
`import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: '${url}',
  apiKey: process.env.OPENAI_API_KEY,
});`,
  'Python': (url) =>
`from openai import OpenAI

client = OpenAI(
    base_url="${url}",
    api_key=os.environ["OPENAI_API_KEY"],
)`,
  'curl': (url) =>
`curl ${url}/chat/completions \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'`,
};

function StepIntegration({ go }) {
  const proxyUrl   = window.MARGEXA?.organization?.proxy_url ?? (window.location.origin + '/api/v1');
  const [tab, setTab]               = useState('Node.js');
  const [copied, setCopied]         = useState(false);
  const [testing, setTesting]       = useState(false);
  const [firstReq, setFirstReq]     = useState(false);
  const [testTimeout, setTestTimeout] = useState(false);
  const pollRef = useRef(null);

  const copy = () => {
    navigator.clipboard.writeText(CODE_SNIPPETS[tab](proxyUrl)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const startTest = () => {
    setTesting(true); setTestTimeout(false);
    let attempts = 0;
    const maxAttempts = 20;
    pollRef.current = setInterval(() => {
      attempts++;
      fetch('/api/dashboard/overview', { headers: { 'X-CSRF-TOKEN': window.MARGEXA?.csrfToken || '' } })
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (json?.total_requests > 0) {
            clearInterval(pollRef.current);
            setTesting(false);
            setFirstReq(true);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollRef.current);
            setTesting(false);
            setTestTimeout(true);
          }
        })
        .catch(() => {});
    }, 3000);
  };

  useEffect(() => () => pollRef.current && clearInterval(pollRef.current), []);

  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: '.10em', textTransform: 'uppercase', marginBottom: 10 }}>Step 3 of 3</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 36, color: '#fff', margin: '0 0 8px', lineHeight: 1.1 }}>
        {firstReq ? <>First request <em style={{ color: '#D97706' }}>received.</em></> : <>Connect your code.</>}
      </h2>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', margin: '0 0 28px', lineHeight: 1.5 }}>
        Change one line in your SDK. Your base URL is below.
      </p>

      {/* First request badge */}
      {firstReq && (
        <div style={{
          padding: '12px 16px', marginBottom: 20, borderRadius: 8,
          background: 'rgba(217,119,6,.15)', border: '1px solid rgba(217,119,6,.3)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'obFade .4s both',
        }}>
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M5 9l2 2 5-5" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontSize: 13, color: '#D97706', fontWeight: 500 }}>First request received — Margexa is live on your traffic.</span>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 0, padding: 4, background: 'rgba(255,255,255,.05)', borderRadius: '8px 8px 0 0', border: '1px solid rgba(255,255,255,.1)', borderBottom: 'none' }}>
        {Object.keys(CODE_SNIPPETS).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '5px 12px', borderRadius: 5, fontSize: 12, fontFamily: 'var(--font-mono)',
            background: tab === t ? 'rgba(255,255,255,.1)' : 'transparent',
            color: tab === t ? '#fff' : 'rgba(255,255,255,.4)',
            border: 'none', cursor: 'pointer',
            transition: 'all .12s',
          }}>{t}</button>
        ))}
      </div>

      {/* Code block */}
      <div style={{ position: 'relative', background: 'rgba(0,0,0,.5)', borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,.1)', borderTop: 'none' }}>
        <pre style={{
          margin: 0, padding: '16px 18px', fontSize: 12.5,
          fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,.8)',
          overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre',
        }}>{CODE_SNIPPETS[tab](proxyUrl)}</pre>
        <button onClick={copy} style={{
          position: 'absolute', top: 10, right: 10,
          padding: '4px 10px', borderRadius: 5, fontSize: 11,
          background: copied ? 'rgba(14,159,110,.2)' : 'rgba(255,255,255,.08)',
          color: copied ? 'var(--success)' : 'rgba(255,255,255,.5)',
          border: `1px solid ${copied ? 'rgba(14,159,110,.3)' : 'rgba(255,255,255,.12)'}`,
          cursor: 'pointer', fontFamily: 'var(--font-mono)',
          transition: 'all .15s',
        }}>{copied ? 'Copied ✓' : 'Copy'}</button>
      </div>

      {/* Base URL display */}
      <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 7, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.05em', textTransform: 'uppercase', flexShrink: 0 }}>Base URL</span>
        <code style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', fontFamily: 'var(--font-mono)', flex: 1, wordBreak: 'break-all' }}>{proxyUrl}</code>
      </div>

      {/* Test connection */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!firstReq && (
          <button onClick={startTest} disabled={testing} style={{
            padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: testing ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.08)',
            color: testing ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.7)',
            border: '1px solid rgba(255,255,255,.12)', cursor: testing ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all .15s',
          }}>
            {testing ? (
              <>
                <span style={{ width: 13, height: 13, borderRadius: 7, border: '1.5px solid rgba(255,255,255,.2)', borderTopColor: 'rgba(255,255,255,.7)', display: 'inline-block', animation: 'obSpin .6s linear infinite' }} />
                Waiting for first request… (up to 60s)
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Test connection
              </>
            )}
          </button>
        )}
        {testTimeout && !firstReq && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center' }}>
            No request received yet — send a test call and click Test connection again.
          </div>
        )}
        <DarkBtn onClick={() => window.location.href = '/app'}>Open dashboard →</DarkBtn>
        <button onClick={() => window.location.href = '/app'} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 13, color: 'rgba(255,255,255,.3)', padding: '4px 0',
          textDecoration: 'underline', textUnderlineOffset: 3,
        }}>Skip</button>
      </div>
    </div>
  );
}

// ─── Root
function OnboardingRoot() {
  const [step, setStep] = useState(0);

  const go = (n) => {
    if (n >= 3) { window.location.href = '/app'; return; }
    setStep(n);
  };

  const steps = [
    <StepOrg go={go} />,
    <StepProvider go={go} />,
    <StepIntegration go={go} />,
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)' }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>Margexa</span>
        <span style={{ flex: 1 }} />
        <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>Save & exit</a>
      </header>

      {/* Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <Dots active={step} />
          <div key={step} style={{ animation: 'obSlide .35s var(--ease-out) both' }}>
            {steps[step]}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes obSpin  { to { transform: rotate(360deg) } }
        @keyframes obFade  { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
        @keyframes obSlide { from { opacity: 0; transform: translateX(16px) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}

Object.assign(window, { OnboardingRoot });
