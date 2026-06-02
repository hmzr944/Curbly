'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignOut, Gear, CaretDown } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface UserMenuProps { email?: string; name?: string }

export function UserMenu({ email, name }: UserMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const onOutside = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    if (open) { document.addEventListener('mousedown', onOutside); document.addEventListener('keydown', onEsc) }
    return () => { document.removeEventListener('mousedown', onOutside); document.removeEventListener('keydown', onEsc) }
  }, [open])

  async function handleSignOut() {
    setOpen(false)
    await supabase.auth.signOut()
    toast.success('Déconnecté')
    window.location.href = '/'
  }

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Menu utilisateur"
        aria-expanded={open}
        aria-haspopup="menu"
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)', fontFamily: 'JetBrains Mono, monospace' }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <CaretDown size={11} weight="bold" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border shadow-lg z-50 overflow-hidden"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--border-2)' }}
          role="menu"
        >
          <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            {name && <p className="text-xs font-medium truncate" style={{ color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{name}</p>}
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>{email}</p>
          </div>
          <div className="p-1">
            <button
              onClick={() => { setOpen(false); router.push('/settings') }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer"
              style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}
              role="menuitem"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Gear size={14} /> Paramètres
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer"
              style={{ color: 'var(--danger)', fontFamily: 'Outfit, sans-serif' }}
              role="menuitem"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-muted)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <SignOut size={14} /> Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
