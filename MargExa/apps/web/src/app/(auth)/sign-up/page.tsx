'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeSlash, CircleNotch } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

/* ─── Brand panel ─────────────────────────────────────────────────────────── */
function BrandPanel() {
  return (
    <aside style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--ink)', color: '#fff',
      display: 'flex', flexDirection: 'column', padding: '40px 48px',
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
          <filter id="ap-blur2"><feGaussianBlur stdDeviation="80" /></filter>
        </svg>
        <div style={{ position: 'absolute', inset: '-30%', filter: 'url(#ap-blur2)', opacity: .9 }}>
          <span className="blob-a" style={{ position: 'absolute', width: '60%', height: '60%', left: '-10%', top: '-15%', borderRadius: '50%', background: 'rgba(91,91,214,.5)' }} />
          <span className="blob-b" style={{ position: 'absolute', width: '55%', height: '60%', right: '-10%', bottom: '-10%', borderRadius: '50%', background: 'rgba(139,92,246,.35)' }} />
          <span className="blob-c" style={{ position: 'absolute', width: '40%', height: '50%', left: '30%', bottom: '10%', borderRadius: '50%', background: 'rgba(14,159,110,.18)' }} />
        </div>
        <div style={{
          position: 'absolute', inset: 0, opacity: .12,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 70%)',
        }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)' }} />
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>Margexa</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1, maxWidth: 460 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,4vw,56px)', fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.02em', margin: 0, color: '#fff' }}>
          Route, govern<br />and observe your<br />
          <em style={{ color: 'var(--accent-soft)' }}>AI spend.</em>
        </h1>
        <p style={{ marginTop: 28, fontSize: 15, color: 'rgba(255,255,255,.65)', lineHeight: 1.55, maxWidth: 380 }}>
          Cut LLM costs by 30–60%. Detect runaway agents. Set policy guardrails — all without changing a line of your app.
        </p>
        <div style={{ marginTop: 56, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', justifyContent: 'space-between' }}>
          {[{ v: '38%', l: 'avg savings' }, { v: '99.99%', l: 'uptime SLA' }, { v: '2.8ms', l: 'p50 latency' }].map((s, i) => (
            <div key={i}>
              <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#fff' }}>{s.v}</div>
              <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '.05em', textTransform: 'uppercase' }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  )
}

function Field({ label, type = 'text', placeholder, name, autoFocus, value, onChange }: {
  label: string; type?: string; placeholder?: string; name?: string; autoFocus?: boolean;
  value: string; onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</label>
      <input
        type={type} name={name} placeholder={placeholder} autoFocus={autoFocus}
        value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '10px 12px', border: `1px solid ${focused ? 'var(--accent)' : 'var(--line-2)'}`,
          borderRadius: 'var(--r-md)', background: 'var(--surface)', fontSize: 14,
          color: 'var(--ink)', outline: 'none',
          boxShadow: focused ? '0 0 0 3px var(--accent-tint)' : 'none',
          transition: 'border-color .15s, box-shadow .15s',
        }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </div>
  )
}

/* ─── Success state ────────────────────────────────────────────────────────── */
function SuccessView({ email }: { email: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center', animation: 'authIn .5s var(--ease-out) both' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--success-tint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="3" y="6" width="22" height="16" rx="3" stroke="var(--success)" strokeWidth="1.6"/>
            <path d="M3 8l11 8 11-8" stroke="var(--success)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="h-display" style={{ fontSize: 40, color: 'var(--ink)', margin: 0, lineHeight: 1.04 }}>
          Check your <em className="serif" style={{ color: 'var(--accent)' }}>inbox.</em>
        </h2>
        <p style={{ marginTop: 16, fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.55 }}>
          We sent a confirmation link to{' '}
          <span className="mono" style={{ color: 'var(--ink)', background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4 }}>{email}</span>.
          <br />Click it to activate your account.
        </p>
        <Link href="/sign-in" style={{ display: 'inline-block', marginTop: 32, fontSize: 14, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}

/* ─── Register form ────────────────────────────────────────────────────────── */
function RegisterForm() {
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [oauthLoad, setOauthLoad] = useState<'google' | 'github' | null>(null)
  const [done, setDone]           = useState(false)

  const supabase = createClient()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    })
    setLoading(false)
    if (error) { toast.error(error.message) } else { setDone(true) }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoad(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    })
    if (error) { toast.error('OAuth error'); setOauthLoad(null) }
  }

  if (done) return <SuccessView email={email} />

  const OAuthBtn = ({ id, label, icon }: { id: 'google' | 'github'; label: string; icon: React.ReactNode }) => (
    <button onClick={() => handleOAuth(id)} disabled={!!oauthLoad || loading} style={{
      padding: '9px 10px', background: 'var(--surface)', border: '1px solid var(--line-2)',
      borderRadius: 'var(--r-md)', cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%',
      transition: 'border-color .15s, background .15s', opacity: oauthLoad ? 0.5 : 1,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--line-3)'; e.currentTarget.style.background = 'var(--surface-2)' }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.background = 'var(--surface)' }}>
      {oauthLoad === id ? <CircleNotch size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 440, animation: 'authIn .5s var(--ease-out) both' }}>
        <h2 className="h-display" style={{ fontSize: 'clamp(36px,4vw,48px)', color: 'var(--ink)', margin: 0, lineHeight: 1.04 }}>
          Start using <em className="serif" style={{ color: 'var(--accent)' }}>Margexa.</em>
        </h2>
        <p style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 12 }}>
          14 days free. No credit card. Cancel anytime.
        </p>

        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <OAuthBtn id="google" label="Google" icon={
              <svg width="14" height="14" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.71-1.57 2.69-3.88 2.69-6.62z" fill="#4285F4"/><path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" fill="#34A853"/><path d="M3.97 10.71a5.41 5.41 0 010-3.42V4.96H.96a9 9 0 000 8.08l3.01-2.33z" fill="#FBBC05"/><path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 00.96 4.96l3.01 2.33C4.68 5.18 6.66 3.58 9 3.58z" fill="#EA4335"/></svg>
            } />
            <OAuthBtn id="github" label="GitHub" icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5C6 1.5 1.5 6 1.5 12c0 4.5 3 8.4 7.2 9.7.5.1.7-.2.7-.5v-1.9c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.2-1.5-1.2-1.5-.9-.7.1-.7.1-.7 1.1.1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3.1.9.1-.7.4-1.1.6-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1.8-.2 1.7-.3 2.6-.3.9 0 1.8.1 2.6.3 2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.7 1.1 2.9 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 1.9v2.9c0 .3.2.6.7.5 4.2-1.4 7.2-5.3 7.2-9.7 0-6-4.5-10.5-10.5-10.5z"/></svg>
            } />
          </div>

          <Divider>or with email</Divider>

          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="First name" placeholder="Jamie" value={fullName} onChange={setFullName} autoFocus name="given-name" />
              <Field label="Last name" placeholder="Doe" value={''} onChange={() => {}} name="family-name" />
            </div>
            <Field label="Work email" type="email" placeholder="you@company.com" value={email} onChange={setEmail} name="email" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters" required minLength={8}
                  style={{
                    width: '100%', padding: '10px 36px 10px 12px',
                    border: '1px solid var(--line-2)', borderRadius: 'var(--r-md)',
                    background: 'var(--surface)', fontSize: 14, color: 'var(--ink)', outline: 'none',
                    transition: 'border-color .15s, box-shadow .15s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-tint)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line-2)'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 2,
                }}>
                  {showPw ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                  {[...Array(4)].map((_, i) => {
                    const filled = i < Math.min(Math.floor(password.length / 3), 4)
                    const color = password.length >= 12 ? 'var(--success)' : password.length >= 8 ? 'var(--warning)' : 'var(--danger)'
                    return <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: filled ? color : 'var(--surface-3)', transition: 'background .2s' }} />
                  })}
                </div>
              )}
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, color: 'var(--ink-3)', cursor: 'pointer', lineHeight: 1.5 }}>
              <input type="checkbox" required style={{ marginTop: 3, accentColor: 'var(--accent)' }} />
              I agree to the <a href="#" style={{ color: 'var(--accent)' }}>Terms</a> and <a href="#" style={{ color: 'var(--accent)' }}>Privacy policy</a>.
            </label>
            <button type="submit" disabled={loading} style={{
              marginTop: 6, width: '100%', height: 40,
              background: loading ? 'var(--surface-2)' : 'var(--ink)',
              color: loading ? 'var(--ink-4)' : '#fff',
              border: 'none', borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .15s var(--ease)',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#27272A' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--ink)' }}>
              {loading && <CircleNotch size={15} className="animate-spin" />}
              Create account
            </button>
          </form>
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
          Already have an account?{' '}
          <Link href="/sign-in" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in →</Link>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', minHeight: '100vh' }}>
      <BrandPanel />
      <section style={{ background: 'var(--bg)', overflowY: 'auto' }}>
        <RegisterForm />
      </section>
    </div>
  )
}
