interface LogoMarkProps {
  size?: number
  className?: string
}

/**
 * Nimbrel mark: two asymmetric arcs that almost close without touching.
 * The space between them represents the passage layer where each call is intercepted.
 * Left arc: taller, wider sweep. Right arc: tighter, slightly shorter.
 * Monochrome only — no gradient on the mark.
 */
export function LogoMark({ size = 28, className = '' }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left arc: larger C-shape facing right, sweeps wide */}
      <path
        d="M9 3 C3.5 6 1.5 10.5 1.5 14 C1.5 17.5 3.5 22 9 25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Right arc: slightly tighter, shorter — the asymmetry is intentional */}
      <path
        d="M20 5.5 C24.5 8.5 26.5 11.5 26.5 14 C26.5 16.5 24.5 19.5 20 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface NimbrelLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function NimbrelLogo({ className = '', size = 'md' }: NimbrelLogoProps) {
  const markSize = { sm: 20, md: 26, lg: 32 }[size]
  const fontSize = { sm: '13px', md: '15px', lg: '19px' }[size]

  return (
    <div className={`flex items-center gap-[10px] text-foreground ${className}`}>
      <LogoMark size={markSize} />
      <span
        style={{
          fontSize,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          fontFamily: 'var(--font-family-sans)',
        }}
      >
        nimbrel
      </span>
    </div>
  )
}
