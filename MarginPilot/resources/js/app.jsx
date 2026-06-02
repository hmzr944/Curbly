import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Margexa';

// Sanitize props to remove null values that cause Object.keys() errors
const sanitizeProps = (obj) => {
    if (obj === null || obj === undefined) return {};
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeProps);
    
    const result = {};
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (value !== null && value !== undefined) {
            result[key] = typeof value === 'object' ? sanitizeProps(value) : value;
        }
    }
    return result;
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        // Sanitize page props before rendering
        const sanitizedProps = {
            ...props,
            initialPage: {
                ...props.initialPage,
                props: sanitizeProps(props.initialPage.props),
            },
        };
        
        const root = createRoot(el);
        root.render(<App {...sanitizedProps} />);
    },
    progress: {
        color: '#4B5563',
    },
});
