'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NimbrelLogo } from './logo'

const NAV_LINKS = [
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'Changelog', href: '/changelog' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // IntersectionObserver on a sentinel element — avoids window.addEventListener('scroll')
    const sentinel = document.createElement('div')
    sentinel.style.cssText =
      'position:absolute;top:80px;left:0;width:1px;height:1px;pointer-events:none'
    document.body.prepend(sentinel)

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      sentinel.remove()
    }
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: '64px',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        backgroundColor: scrolled ? 'rgba(11,11,12,0.82)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px) saturate(160%)' : 'none',
        transition:
          'background-color 200ms var(--ease-spring), border-color 200ms var(--ease-spring)',
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <NimbrelLogo />

        <div className="flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] text-muted-fg hover:text-foreground"
              style={{
                transition: 'color var(--duration-micro) var(--ease-spring)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/register"
          className="h-8 px-4 rounded-[6px] text-[13px] font-medium text-white flex items-center"
          style={{
            backgroundColor: 'var(--color-accent-1)',
            transition: 'background-color var(--duration-micro) var(--ease-spring)',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--color-accent-1-hover)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--color-accent-1)')
          }
        >
          Start free trial
        </Link>
      </nav>
    </header>
  )
}
