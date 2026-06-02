'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeSlash, CircleNotch } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440, animation: 'authIn .5s var(--ease-out) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center', marginBottom: 40 }}>
          <span style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)' }} />
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Margexa</span>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const supabase = createClient()

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { toast.error(error.message) } else { setDone(true); setTimeout(() => router.push('/dashboard'), 2000) }
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 12px', border: `1px solid ${focused ? 'var(--accent)' : 'var(--line-2)'}`,
    borderRadius: 'var(--r-md)', background: 'var(--surface)', fontSize: 14, color: 'var(--ink)', outline: 'none',
    boxShadow: focused ? '0 0 0 3px var(--accent-tint)' : 'none', transition: 'border-color .15s, box-shadow .15s',
  })

  if (done) {
    return (
      <AuthShell>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: 40, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--success-tint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-9" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="h-display" style={{ fontSize: 32, color: 'var(--ink)', margin: 0, lineHeight: 1.04 }}>
            Password <em className="serif" style={{ color: 'var(--accent)' }}>updated.</em>
          </h2>
          <p style={{ marginTop: 14, fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6 }}>Redirecting to your dashboard…</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <h2 className="h-display" style={{ fontSize: 'clamp(32px,4vw,44px)', color: 'var(--ink)', margin: '0 0 10px', lineHeight: 1.04 }}>
        New <em className="serif" style={{ color: 'var(--accent)' }}>password.</em>
      </h2>
      <p style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 32 }}>
        Choose a secure password for your account.
      </p>

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>New password</label>
          <PwField value={password} onChange={setPassword} show={showPw} onToggle={() => setShowPw(!showPw)} placeholder="At least 8 characters" inputStyle={inputStyle} />
          {password.length > 0 && (
            <div style={{ display: 'flex', gap: 4 }}>
              {[...Array(4)].map((_, i) => {
                const filled = i < Math.min(Math.floor(password.length / 3), 4)
                const color = password.length >= 12 ? 'var(--success)' : password.length >= 8 ? 'var(--warning)' : 'var(--danger)'
                return <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: filled ? color : 'var(--surface-3)', transition: 'background .2s' }} />
              })}
            </div>
          )}
        </div>

        {/* Confirm */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>Confirm password</label>
          <PwField value={confirm} onChange={setConfirm} show={showPw} onToggle={() => setShowPw(!showPw)} placeholder="Repeat password" inputStyle={inputStyle} />
          {confirm.length > 0 && confirm !== password && (
            <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>Passwords do not match</div>
          )}
        </div>

        <button type="submit" disabled={loading || !password || !confirm} style={{
          marginTop: 4, height: 40,
          background: loading ? 'var(--surface-2)' : 'var(--ink)',
          color: loading ? 'var(--ink-4)' : '#fff', border: 'none',
          borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 500,
          cursor: (loading || !password || !confirm) ? 'not-allowed' : 'pointer', opacity: (!password || !confirm) ? 0.5 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background .15s var(--ease)',
        }}
        onMouseEnter={(e) => { if (!loading && password && confirm) e.currentTarget.style.background = '#27272A' }}
        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--ink)' }}>
          {loading && <CircleNotch size={15} className="animate-spin" />}
          Update password
        </button>
      </form>
    </AuthShell>
  )
}

function PwField({ value, onChange, show, onToggle, placeholder, inputStyle }: {
  value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void;
  placeholder: string; inputStyle: (f: boolean) => React.CSSProperties
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required
        style={{ ...inputStyle(focused), paddingRight: 36 }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
      <button type="button" onClick={onToggle} style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 2,
      }}>
        {show ? <EyeSlash size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}
