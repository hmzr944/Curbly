export default function ApplicationLogo({ className = 'h-5 w-auto', gradientId = 'mp-logo-gradient' }) {
    return (
        <svg viewBox="0 0 184 78" className={className} fill="none" aria-hidden="true">
            <defs>
                <linearGradient id={gradientId} x1="12" y1="39" x2="170" y2="39" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="55%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
            </defs>
            <path
                d="M14 56L44 22C52 14 64 14 72 22L94 44M94 44L121 14H168L140 53C134 61 122 61 115 54L104 46M94 44L72 66H22"
                stroke={`url(#${gradientId})`}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
