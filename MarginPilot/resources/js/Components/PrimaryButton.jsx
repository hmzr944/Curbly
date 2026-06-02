export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/35 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:ring-offset-2 active:translate-y-0 ${
                    disabled && 'cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-lg'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
