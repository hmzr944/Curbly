export default function StatCard({ label, value, hint, variant = 'default' }) {
    const variantStyles = {
        default:   'border-slate-200/60 bg-white/85 backdrop-blur-xl',
        highlight: 'border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-white/80 backdrop-blur-xl',
    };
    const valueStyles = {
        default:   'text-slate-900',
        highlight: 'text-violet-600',
    };
    return (
        <div className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${variantStyles[variant] || variantStyles.default}`}>
            <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${valueStyles[variant] || valueStyles.default}`}>{value}</p>
                {hint && <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">{hint}</p>}
            </div>
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-violet-400/10 to-purple-400/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
        </div>
    );
}
