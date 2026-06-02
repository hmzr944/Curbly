'use client'
import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium cursor-pointer select-none',
    '[transition:background-color_.15s_var(--ease),border-color_.15s_var(--ease),transform_.15s_var(--ease),box-shadow_.2s_var(--ease)]',
    'disabled:pointer-events-none disabled:opacity-40',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-[var(--ink)] text-white border border-[var(--ink)] hover:bg-[#27272A]',
        accent:
          'bg-[var(--accent)] text-white border border-[var(--accent)] hover:bg-[var(--accent-hover)]',
        secondary:
          'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line-2)] hover:border-[var(--line-3)] hover:bg-[var(--surface-2)]',
        ghost:
          'text-[var(--ink-2)] border border-transparent hover:bg-[var(--surface-2)]',
        danger:
          'bg-[var(--danger-tint)] text-[var(--danger)] border border-[rgba(200,52,27,0.2)] hover:bg-[rgba(200,52,27,0.12)]',
        success:
          'bg-[var(--success-tint)] text-[var(--success)] border border-[rgba(14,159,110,0.2)] hover:bg-[rgba(14,159,110,0.12)]',
        outline:
          'border border-[var(--line-2)] text-[var(--ink)] hover:bg-[var(--surface-2)] hover:border-[var(--line-3)]',
        link: 'text-[var(--accent)] underline-offset-4 hover:underline p-0 h-auto shadow-none border-none',
      },
      size: {
        sm:        'h-[30px] px-3 text-[13px] rounded-[var(--r-md)]',
        md:        'h-9 px-4 text-[14px] rounded-[var(--r-md)]',
        lg:        'h-11 px-[22px] text-[15px] rounded-[var(--r-md)]',
        icon:      'h-8 w-8 rounded-lg',
        'icon-sm': 'h-7 w-7 rounded-md',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, icon, iconRight, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span
            className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"
          />
        )}
        {icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
        {children}
        {iconRight && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{iconRight}</span>}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
