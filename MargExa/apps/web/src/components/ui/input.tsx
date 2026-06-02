import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, style, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && (
          <label htmlFor={id} style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(className)}
          style={{
            height: 40, width: '100%', padding: '0 12px',
            borderRadius: 'var(--r-md)',
            border: `1px solid ${error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--line-2)'}`,
            background: 'var(--surface)',
            fontSize: 14, color: 'var(--ink)',
            outline: 'none',
            boxShadow: focused && !error ? '0 0 0 3px var(--accent-tint)' : focused && error ? '0 0 0 3px var(--danger-tint)' : 'none',
            transition: 'border-color .15s var(--ease), box-shadow .15s var(--ease)',
            ...style,
          }}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
          {...props}
        />
        {error && (
          <p style={{ fontSize: 12, color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{error}</p>
        )}
        {hint && !error && (
          <p style={{ fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
