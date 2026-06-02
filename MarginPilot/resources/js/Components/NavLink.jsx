import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ' +
                (active
                    ? 'bg-violet-50 text-violet-700 shadow-sm'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm') +
                ' ' + className
            }
        >
            {children}
            {active && (
                <span className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-violet-500" />
            )}
        </Link>
    );
}
