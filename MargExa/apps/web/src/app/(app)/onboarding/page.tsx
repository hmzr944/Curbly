'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const STEPS = [
  { id: 'workspace', t: 'Create workspace',  s: 'Name your organisation' },
  { id: 'apikey',    t: 'Your API key',       s: 'Copy it now — shown once' },
  { id: 'integrate', t: 'Change one line',    s: 'Point your app to Margexa' },
  { id: 'done',      t: 'You\'re live',       s: 'Open the dashboard' },
]

/* ─── Stepper ─────────────────────────────────────────────────────────────── */
function Stepper({ active }: { active: number }) {
  const CheckIcon = () => <svg width="10" height="10" viewBox="0 0 12 12"><path d="M3 6l2 2 4-4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
      {STEPS.map((s, i) => {
        const done = i < active, current = i === active
        return (
          <span key={s.id} style={{ display: 'contents' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: done || current ? 1 : 0.5 }}>
              <span style={{
                width: 24, height: 24, borderRadius: 12, flexShrink: 0, fontSize: 11, fontWeight: 600,
                fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--accent)' : current ? 'var(--ink)' : 'var(--surface)',
                border: '1px solid', borderColor: done ? 'var(--accent)' : current ? 'var(--ink)' : 'var(--line-2)',
                color: done || current ? '#fff' : 'var(--ink-4)',
                transition: 'all .25s',
              }}>
                {done ? <CheckIcon /> : i + 1}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{s.t}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.s}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <span style={{ flex: 1, height: 1, background: done ? 'var(--accent)' : 'var(--line)', margin: '0 16px', transition: 'background .25s' }} />
            )}
          </span>
        )
      })}
    </div>
  )
}

/* ─── StepFrame ───────────────────────────────────────────────────────────── */
function StepFrame({
  title, sub, children, onPrimary, onBack, canBack, primaryLabel = 'Continue', loading,
}: {
  title: React.ReactNode; sub: string; children?: React.ReactNode
  onPrimary: () => void; onBack?: () => void; canBack?: boolean
  primaryLabel?: string; loading?: boolean
}) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
      <div style={{ animation: 'stepIn .5s var(--ease-out) both' }}>
        <h2 className="h-display" style={{ fontSize: 'clamp(32px, 3.8vw, 48px)', color: 'var(--ink)', margin: 0, lineHeight: 1.04 }}>
          {title}
        </h2>
        <p style={{ fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 14, marginBottom: 36 }}>{sub}</p>
        {children}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
        <button onClick={onBack} disabled={!canBack} style={{
          background: 'transparent', border: 'none', cursor: canBack ? 'pointer' : 'default',
          color: canBack ? 'var(--ink-2)' : 'var(--ink-5)', fontSize: 13, padding: '6px 0',
        }}>← Back</button>
        <Button variant="default" size="md" onClick={onPrimary} disabled={loading}>
          {loading ? 'Please wait…' : primaryLabel}
        </Button>
      </div>
    </div>
  )
}

/* ─── ControlledInput ─────────────────────────────────────────────────────── */
function ControlledInput({
  label, placeholder, hint, value, onChange, autoFocus, type = 'text',
}: {
  label: string; placeholder?: string; hint?: string
  value: string; onChange: (v: string) => void
  autoFocus?: boolean; type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoFocus={autoFocus}
        style={{
          padding: '10px 12px', border: `1px solid ${focused ? 'var(--accent)' : 'var(--line-2)'}`,
          borderRadius: 'var(--r-md)', background: 'var(--surface)', fontSize: 14, color: 'var(--ink)', outline: 'none',
          boxShadow: focused ? '0 0 0 3px var(--accent-tint)' : 'none',
          transition: 'border-color .15s, box-shadow .15s',
        }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
      {hint && <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{hint}</div>}
    </div>
  )
}

/* ─── Step 0: Create workspace ────────────────────────────────────────────── */
function StepWorkspace({ onDone }: { onDone: (workspaceId: string) => void }) {
  const [name, setName] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!name.trim()) { setError('Workspace name is required'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), openai_key: openaiKey.trim() || undefined }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed to create workspace'); }
      const ws = await res.json()
      onDone(ws.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StepFrame
      title={<>Let&apos;s set up your <em className="serif" style={{ color: 'var(--accent)' }}>workspace.</em></>}
      sub="A workspace holds your providers, API keys, and analytics."
      onPrimary={submit} canBack={false} primaryLabel="Create workspace" loading={loading}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ControlledInput label="Workspace name" placeholder="Acme Inc." value={name} onChange={setName} autoFocus />
        <ControlledInput
          label="OpenAI API key (optional — you can add it later)"
          placeholder="sk-…"
          type="password"
          value={openaiKey}
          onChange={setOpenaiKey}
          hint="Stored encrypted at rest. Never logged."
        />
        {error && <div style={{ fontSize: 13, color: 'var(--danger)', padding: '8px 12px', background: 'rgba(220,38,38,.06)', borderRadius: 8 }}>{error}</div>}
      </div>
    </StepFrame>
  )
}

/* ─── Step 1: Generate & reveal API key ───────────────────────────────────── */
function StepApiKey({ workspaceId, onDone }: { workspaceId: string; onDone: (key: string) => void }) {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generated, setGenerated] = useState(false)

  async function generate() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Default key' }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed'); }
      const data = await res.json()
      setApiKey(data.key)
      setGenerated(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <StepFrame
      title={<>Your <em className="serif" style={{ color: 'var(--accent)' }}>API key.</em></>}
      sub="This key will only be shown once. Copy it somewhere safe before continuing."
      onPrimary={() => generated ? onDone(apiKey) : generate()}
      canBack={false}
      primaryLabel={generated ? 'I copied it, continue →' : 'Generate API key'}
      loading={loading}
    >
      {!generated ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
          Click &ldquo;Generate API key&rdquo; to create your <span className="mono" style={{ color: 'var(--accent)' }}>mrg_</span> key.
        </div>
      ) : (
        <div style={{ background: 'var(--ink)', borderRadius: 'var(--r-lg)', padding: 24 }}>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>
            Your secret key — do not share
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff', wordBreak: 'break-all', flex: 1 }}>{apiKey}</code>
            <button onClick={copy} style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.2)',
              background: copied ? 'rgba(14,159,110,.25)' : 'rgba(255,255,255,.08)',
              color: copied ? '#4ade80' : 'rgba(255,255,255,.7)', fontFamily: 'var(--font-mono)', fontSize: 11.5, cursor: 'pointer',
              transition: 'all .15s',
            }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.6 }}>
            Store it in your <code style={{ color: 'rgba(255,255,255,.6)' }}>.env</code> file as{' '}
            <code style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,.6)' }}>MARGEXA_API_KEY</code>.
            It cannot be recovered.
          </div>
        </div>
      )}
      {error && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--danger)', padding: '8px 12px', background: 'rgba(220,38,38,.06)', borderRadius: 8 }}>{error}</div>}
    </StepFrame>
  )
}

/* ─── Step 2: Code snippet ────────────────────────────────────────────────── */
function StepIntegrate({ apiKey, onDone }: { apiKey: string; onDone: () => void }) {
  const [tab, setTab] = useState<'curl' | 'node' | 'python'>('node')
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://api.margexa.io'
  const keyPreview = apiKey ? apiKey.slice(0, 14) + '…' : 'mrg_…'

  const snippets = {
    curl: `curl ${baseUrl}/v1/chat/completions \\
  -H "Authorization: Bearer ${keyPreview}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,
    node: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.MARGEXA_API_KEY,   // your mrg_ key
  baseURL: "${baseUrl}/v1",              // ← one line change
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);`,
    python: `from openai import OpenAI

client = OpenAI(
    api_key=os.environ["MARGEXA_API_KEY"],  # your mrg_ key
    base_url="${baseUrl}/v1",               # ← one line change
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)`,
  }

  async function copy() {
    await navigator.clipboard.writeText(snippets[tab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <StepFrame
      title={<>One line <em className="serif" style={{ color: 'var(--accent)' }}>change.</em></>}
      sub="Replace your existing OpenAI baseURL. Your code keeps working — we proxy transparently."
      onPrimary={onDone} canBack={false} primaryLabel="Open dashboard →"
    >
      <div style={{ background: 'var(--ink)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          {(['node', 'python', 'curl'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.03em',
              color: tab === t ? '#fff' : 'rgba(255,255,255,.35)',
              borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
              transition: 'color .15s',
            }}>
              {t === 'node' ? 'Node.js' : t === 'python' ? 'Python' : 'cURL'}
            </button>
          ))}
          <button onClick={copy} style={{
            marginLeft: 'auto', padding: '10px 18px', border: 'none', background: 'transparent',
            cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11.5,
            color: copied ? '#4ade80' : 'rgba(255,255,255,.45)',
            transition: 'color .15s',
          }}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        {/* Code */}
        <pre style={{
          margin: 0, padding: '20px 24px', fontFamily: 'var(--font-mono)', fontSize: 12.5,
          color: 'rgba(255,255,255,.85)', lineHeight: 1.75, overflowX: 'auto',
          whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {snippets[tab]}
        </pre>
      </div>
      <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(91,91,214,.07)', borderRadius: 'var(--r-md)', border: '1px solid rgba(91,91,214,.15)' }}>
        <span className="mono" style={{ fontSize: 11.5, color: 'var(--accent)' }}>
          Every call is tracked, costed, and logged in your dashboard. No other changes needed.
        </span>
      </div>
    </StepFrame>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [workspaceId, setWorkspaceId] = useState('')
  const [apiKey, setApiKey] = useState('')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Top bar */}
      <header style={{
        padding: '20px 32px', borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'rgba(250,250,248,.85)', backdropFilter: 'saturate(160%) blur(14px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)' }} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Margexa</span>
        </div>
        <span style={{ height: 18, width: 1, background: 'var(--line-2)' }} />
        <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)', letterSpacing: '.04em' }}>Quick setup · 2 minutes</div>
        <a href="/dashboard" className="mono" style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--ink-4)', textDecoration: 'none' }}>Skip for now</a>
      </header>

      {/* Stepper */}
      <div style={{ borderBottom: '1px solid var(--line)', padding: '20px 32px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Stepper active={step} />
        </div>
      </div>

      {/* Step content */}
      <main style={{ flex: 1, padding: '56px 32px 80px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(800px 400px at 50% 0%, rgba(91,91,214,.04), transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {step === 0 && (
            <StepWorkspace onDone={(id) => { setWorkspaceId(id); setStep(1) }} />
          )}
          {step === 1 && (
            <StepApiKey workspaceId={workspaceId} onDone={(key) => { setApiKey(key); setStep(2) }} />
          )}
          {step === 2 && (
            <StepIntegrate apiKey={apiKey} onDone={() => router.push('/dashboard')} />
          )}
        </div>
      </main>
    </div>
  )
}
