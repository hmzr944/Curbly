'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CircleNotch } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'authIn .5s var(--ease-out) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center', marginBottom: 40 }}>
          <span style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)' }} />
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Margexa</span>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [focused, setFocused] = useState(false)
  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    setLoading(false)
    if (error) { toast.error(error.message) } else { setDone(true) }
  }

  if (done) {
    return (
      <AuthShell>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: 32, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--success-tint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke="var(--success)" strokeWidth="1.5"/><path d="M3 8l9 7 9-7" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <h2 className="h-display" style={{ fontSize: 32, color: 'var(--ink)', margin: 0, lineHeight: 1.04 }}>
            Check your <em className="serif" style={{ color: 'var(--accent)' }}>inbox.</em>
          </h2>
          <p style={{ marginTop: 14, fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6 }}>
            We sent a reset link to{' '}
            <span className="mono" style={{ color: 'var(--ink)', background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4 }}>{email}</span>.
          </p>
          <Link href="/sign-in" style={{ display: 'inline-block', marginTop: 24, fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>← Back to sign in</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <h2 className="h-display" style={{ fontSize: 'clamp(32px,4vw,44px)', color: 'var(--ink)', margin: '0 0 10px', lineHeight: 1.04 }}>
        Reset your <em className="serif" style={{ color: 'var(--accent)' }}>password.</em>
      </h2>
      <p style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 32 }}>
        We&apos;ll email you a link to set a new one.
      </p>

      <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com" required autoFocus
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
        <button type="submit" disabled={loading} style={{
          height: 40, background: loading ? 'var(--surface-2)' : 'var(--ink)',
          color: loading ? 'var(--ink-4)' : '#fff', border: 'none',
          borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background .15s var(--ease)',
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#27272A' }}
        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--ink)' }}>
          {loading && <CircleNotch size={15} className="animate-spin" />}
          Send reset link
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Link href="/sign-in" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>← Back to sign in</Link>
      </div>
    </AuthShell>
  )
}
