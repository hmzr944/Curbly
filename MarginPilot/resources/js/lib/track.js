/**
 * Plausible event helper — safe no-op when script not loaded (dev/staging).
 *
 * Usage:
 *   track('Audit Started');
 *   track('Plan CTA Clicked', { plan: 'control' });
 */
export function track(event, props = {}) {
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
        window.plausible(event, { props });
    }
}
