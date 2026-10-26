/** Wordmark: the circumflex of "û" doubles as a check mark, the sign of an invoice settled. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-[1.35rem] font-bold tracking-tight ${className}`} aria-label="Dûment">
      D
      <span className="relative inline-block">
        u
        <svg aria-hidden viewBox="0 0 12 8" className="absolute left-1/2 -translate-x-1/2 -top-[0.08em] w-[0.6em] text-paid">
          <path d="M1.5 4.2 4.6 6.8 10.5 1.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      ment
    </span>
  );
}
