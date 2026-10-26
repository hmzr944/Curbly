type Tone = "brand" | "late" | "paid";

const blobs: Record<Tone, [string, string]> = {
  brand: ["bg-brand/25", "bg-late/20"],
  late: ["bg-late/25", "bg-brand/20"],
  paid: ["bg-paid/25", "bg-brand/20"],
};

/** Interior page header: animated title, intro and soft colour field matching the page's role. */
export function PageHeader({
  title,
  intro,
  tone = "brand",
  eyebrow,
  children,
}: {
  title: string;
  intro: React.ReactNode;
  tone?: Tone;
  eyebrow?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [a, b] = blobs[tone];
  return (
    <div className="no-print relative isolate">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-80 overflow-hidden">
        <div className={`blob absolute -left-10 top-0 h-72 w-72 rounded-full ${a}`} />
        <div className={`blob absolute right-10 top-10 h-60 w-60 rounded-full ${b} [animation-delay:-6s]`} />
      </div>
      {eyebrow && <div className="fade-up mb-4 text-sm text-muted">{eyebrow}</div>}
      <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-[3.4rem]">
        <span className="line-mask">
          <span>{title}</span>
        </span>
      </h1>
      <div className="fade-up mt-5 max-w-2xl text-lg text-muted" style={{ "--i": 1 } as React.CSSProperties}>
        {intro}
      </div>
      {children}
    </div>
  );
}
