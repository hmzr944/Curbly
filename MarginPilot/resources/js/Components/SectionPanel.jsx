export default function SectionPanel({ title, subtitle, children, actions = null, variant = 'default' }) {
    const variantStyles = {
        default:   'border-slate-200/60 bg-white/82 backdrop-blur-xl',
        highlight: 'border-violet-200/60 bg-gradient-to-br from-violet-50/70 to-white/84 backdrop-blur-xl',
        warning:   'border-amber-200/60 bg-gradient-to-br from-amber-50/85 to-white/84 backdrop-blur-xl',
    };
    return (
        <section className={`relative overflow-hidden rounded-2xl border p-5 shadow-[0_18px_40px_rgba(148,163,184,0.10)] transition-all duration-300 hover:shadow-[0_22px_50px_rgba(148,163,184,0.14)] sm:rounded-3xl sm:p-6 lg:p-8 ${variantStyles[variant] || variantStyles.default}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/80 to-transparent" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-100/40 blur-2xl" />
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h3>
                    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
                {actions && <div className="flex-shrink-0">{actions}</div>}
            </div>
            <div className="relative">{children}</div>
        </section>
    );
}
