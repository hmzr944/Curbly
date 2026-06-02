import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'accent' | 'interactive'
  padding?: number | string
}

function Card({ className, variant = 'default', padding, style, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--r-lg)]',
        '[transition:border-color_.2s_var(--ease),box-shadow_.2s_var(--ease),transform_.2s_var(--ease)]',
        variant === 'default' && 'bg-[var(--surface)] border border-[var(--line)]',
        variant === 'flat' && 'bg-[var(--surface)]',
        variant === 'accent' && 'bg-[var(--accent-tint)] border border-[rgba(91,91,214,0.2)]',
        variant === 'interactive' && 'bg-[var(--surface)] border border-[var(--line)] cursor-pointer hover:border-[var(--line-3)] hover:-translate-y-px hover:shadow-[var(--sh-2)]',
        className
      )}
      style={{ padding: padding ?? 24, ...style }}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props} />
  )
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-[14px] font-medium leading-none', className)}
      style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}
      {...props}
    />
  )
}

function CardSub({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mono text-[11px] mt-[3px]', className)}
      style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', letterSpacing: '.02em' }}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardSub, CardContent }
