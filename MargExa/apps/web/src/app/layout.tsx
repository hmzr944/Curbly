import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Margexa — AI Spend Control Plane',
  description: 'Route, govern and observe every LLM call across your stack. Cut model cost by 30–60%.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full antialiased" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--ink)',
              border: '1px solid var(--line-2)',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              boxShadow: 'var(--sh-pop)',
            },
          }}
        />
      </body>
    </html>
  )
}
