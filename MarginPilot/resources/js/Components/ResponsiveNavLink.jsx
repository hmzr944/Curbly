import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-center rounded-lg px-3 py-2.5 ${
                active
                    ? 'bg-violet-50 font-medium text-violet-700'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
            } text-sm transition ${className}`}
        >
            {children}
        </Link>
    );
}
