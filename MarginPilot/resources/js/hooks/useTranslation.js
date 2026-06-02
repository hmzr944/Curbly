import { usePage } from '@inertiajs/react';

/**
 * Translation hook.
 *
 * @param {string|null} overrideLocale  — pass `data.locale` on the Settings page
 *                                        to get live preview before saving.
 *
 * Usage:
 *   const { t } = useTranslation();           // uses saved locale from server
 *   const { t } = useTranslation(data.locale); // live preview (Settings page)
 *
 *   t('settings.title')
 *   t('settings.providers.disconnect_warning', { name: 'OpenAI' })
 */
export function useTranslation(overrideLocale = null) {
    const { locale, translations } = usePage().props;

    const activeLocale = overrideLocale || locale || 'fr';
    const bundle = translations?.[activeLocale] ?? translations?.['fr'] ?? {};

    const t = (key, replace = {}) => {
        let str = bundle[key] ?? key;
        Object.entries(replace).forEach(([k, v]) => {
            str = str.replace(`:${k}`, v);
        });
        return str;
    };

    return { t, locale: activeLocale };
}
