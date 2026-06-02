import { cn } from '@/lib/utils'

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'outline'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  dot?: boolean
  /** @deprecated use tone */
  variant?: string
}

const toneMap: Record<BadgeTone, { bg: string; color: string; border?: string; dotColor: string }> = {
  neutral: { bg: 'var(--surface-2)',   color: 'var(--ink-2)',    dotColor: 'var(--ink-4)' },
  accent:  { bg: 'var(--accent-tint)', color: 'var(--accent)',   dotColor: 'var(--accent)' },
  success: { bg: 'var(--success-tint)', color: 'var(--success)', dotColor: 'var(--success)' },
  warning: { bg: 'var(--warning-tint)', color: 'var(--warning)', dotColor: 'var(--warning)' },
  danger:  { bg: 'var(--danger-tint)',  color: 'var(--danger)',  dotColor: 'var(--danger)' },
  outline: { bg: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--line-2)', dotColor: 'var(--ink-4)' },
}

/* map legacy variant → tone */
function resolveTone(tone?: BadgeTone, variant?: string): BadgeTone {
  if (tone) return tone
  const m: Record<string, BadgeTone> = {
    default: 'accent', success: 'success', warning: 'warning',
    danger: 'danger', info: 'accent', muted: 'neutral',
  }
  return (variant && m[variant]) || 'neutral'
}

export function Badge({ tone, variant, dot = false, className, style, children, ...props }: BadgeProps) {
  const t = toneMap[resolveTone(tone, variant)]
  return (
    <span
      className={cn('inline-flex items-center gap-[6px] px-[10px] py-[3px] rounded-[var(--r-pill)]', className)}
      style={{
        background: t.bg,
        color: t.color,
        border: t.border,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '.02em',
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          style={{ width: 6, height: 6, borderRadius: 3, background: t.dotColor, flexShrink: 0 }}
        />
      )}
      {children}
    </span>
  )
}
