/**
 * Abstract mark: a disc (what is owed) coming back to a half-circle (the account it belongs to).
 * Read together they hint at a "D". Single colour, so it holds up at favicon size.
 */
export const MARK_PATH = "M19 4a16 16 0 0 1 0 32Z M3 20a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0Z";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className}>
      <path d={MARK_PATH} fill="var(--color-brand)" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Dûment">
      <LogoMark className="h-7 w-7" />
      <span aria-hidden className="font-display text-[1.15rem] font-extrabold">
        Dûment
      </span>
    </span>
  );
}
