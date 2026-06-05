import Link from 'next/link'
import { NimbrelLogo } from './logo'

const LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Docs', href: '/docs' },
  { label: 'Status', href: 'https://status.nimbrel.io' },
]

export function Footer() {
  return (
    <footer
      className="py-10"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <NimbrelLogo size="sm" />

        <nav
          className="flex items-center flex-wrap gap-5"
          aria-label="Footer navigation"
        >
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[12px] hover:text-foreground"
              style={{
                color: 'var(--color-muted-fg)',
                transition: 'color 120ms cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p
          className="tabular"
          style={{
            fontSize: '11px',
            letterSpacing: '0.05em',
            color: 'var(--color-muted-fg)',
          }}
        >
          {new Date().getFullYear()} Nimbrel, Inc.
        </p>
      </div>
    </footer>
  )
}
