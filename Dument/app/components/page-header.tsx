/** Interior page header: animated title and intro. */
export function PageHeader({
  title,
  intro,
  eyebrow,
  children,
}: {
  title: string;
  intro: React.ReactNode;
  eyebrow?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="no-print">
      {eyebrow && <div className="fade-up mb-4 text-sm text-muted">{eyebrow}</div>}
      <h1 className="font-display text-[2rem] font-extrabold leading-[1.08] sm:text-[2.7rem]">
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
