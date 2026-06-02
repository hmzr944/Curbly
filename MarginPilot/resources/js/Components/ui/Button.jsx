import { Link } from '@inertiajs/react';

/**
 * Button component with premium design system
 * 
 * Variants:
 * - primary: Solid gradient button for main CTAs
 * - secondary: Translucent glass button with blur
 * - ghost: Minimal text-only button
 * - outline: Border only button
 */

const variants = {
    primary: `
        bg-gradient-to-r from-violet-600 to-violet-500 
        text-white font-semibold
        shadow-md shadow-violet-500/20
        hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/25
        active:translate-y-0 active:shadow-md
    `,
    secondary: `
        border border-slate-200/60 
        bg-white/40 backdrop-blur-md
        text-slate-700 font-medium
        hover:bg-white/70 hover:shadow-md hover:border-slate-200/80
        active:bg-white/60
    `,
    ghost: `
        text-slate-600 font-medium
        hover:text-slate-900 hover:bg-slate-100/50
        active:bg-slate-100/70
    `,
    outline: `
        border border-slate-200 
        bg-transparent
        text-slate-700 font-medium
        hover:bg-slate-50 hover:border-slate-300
        active:bg-slate-100
    `,
    glass: `
        border border-white/40
        bg-white/30 backdrop-blur-xl
        text-slate-800 font-medium
        shadow-lg shadow-slate-200/20
        hover:bg-white/50 hover:shadow-xl
        active:bg-white/40
    `,
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
    xl: 'px-8 py-4 text-base rounded-2xl',
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    href,
    external,
    className = '',
    disabled = false,
    ...props
}) {
    const baseClasses = `
        inline-flex items-center justify-center gap-2
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
    `;

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`.trim();

    // External link
    if (href && external) {
        return (
            <a
                href={href}
                className={classes}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
            >
                {children}
            </a>
        );
    }

    // Internal link with Inertia
    if (href) {
        return (
            <Link href={href} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    // Regular button
    return (
        <button className={classes} disabled={disabled} {...props}>
            {children}
        </button>
    );
}

// Export a glass pill component for tags/filters
export function GlassPill({ children, active, onClick, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`
                inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium
                transition-all duration-200 backdrop-blur-md
                ${active
                    ? 'border border-violet-200/60 bg-violet-50/80 text-violet-700 shadow-sm'
                    : 'border border-slate-200/50 bg-white/40 text-slate-600 hover:bg-white/60 hover:border-slate-200/70'
                }
                ${className}
            `}
        >
            {children}
        </button>
    );
}

// Export a glass card wrapper
export function GlassCard({ children, className = '', hover = true }) {
    return (
        <div
            className={`
                rounded-2xl border border-white/40 
                bg-white/30 backdrop-blur-xl
                shadow-lg shadow-slate-200/20
                ${hover ? 'transition-all duration-300 hover:bg-white/50 hover:shadow-xl' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
}
