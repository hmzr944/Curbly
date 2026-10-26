/**
 * Mark: an indigo tile holding a "û" whose circumflex is a green check, the sign of an invoice settled.
 * The wordmark repeats the idea on the "û".
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className}>
      <rect width="40" height="40" rx="11" fill="var(--color-brand)" />
      <path d="M12.5 17v6.2a7.5 7.5 0 0 0 15 0V17" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M14.5 10.6 18.6 14l7-6.6" fill="none" stroke="var(--color-paid)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Dûment">
      <LogoMark className="h-8 w-8" />
      <span aria-hidden className="font-display text-[1.4rem] font-extrabold tracking-tight">
        Dûment
      </span>
    </span>
  );
}
