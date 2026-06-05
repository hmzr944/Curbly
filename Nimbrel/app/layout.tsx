import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'nimbrel - AI infrastructure control layer',
  description:
    'Route, observe, and govern every LLM request. Cut model cost 30-60% without changing your code.',
  openGraph: {
    title: 'nimbrel - AI infrastructure control layer',
    description:
      'Route, observe, and govern every LLM request. Cut model cost 30-60% without changing your code.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="antialiased">
        <a href="#main" className="skip-to-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
