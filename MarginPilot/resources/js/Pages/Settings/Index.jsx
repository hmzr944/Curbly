import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SectionPanel from '@/Components/SectionPanel';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const inputCls = 'mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/20';

/* ─────────────────────────────────────────────────────────
   PROVIDER CARD
───────────────────────────────────────────────────────── */
const PROVIDER_META = {
    openai:    { name: 'OpenAI',    models: 'GPT-4o, GPT-4o-mini',      abbr: 'OA' },
    anthropic: { name: 'Anthropic', models: 'Claude 3.5 Sonnet, Haiku', abbr: 'AN' },
};

function EyeIcon({ open }) {
    if (open) {
        return (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
        );
    }
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function ProviderCard({ providerKey, provider, keyValue, disconnecting, onKeyChange, onDisconnect, onCancelDisconnect, error, t }) {
    const [showKey, setShowKey] = useState(false);
    const meta      = PROVIDER_META[providerKey] ?? { name: providerKey, models: '', abbr: '??' };
    const isConnected = provider?.status === 'connected' && !disconnecting;

    return (
        <div className={`rounded-2xl border p-5 transition-all duration-200 ${
            disconnecting   ? 'border-red-200/70 bg-red-50/30'
            : isConnected   ? 'border-emerald-200/60 bg-gradient-to-br from-emerald-50/30 to-white/80'
            : 'border-slate-200/60 bg-white/70'
        }`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border text-xs font-bold tracking-wide ${
                        disconnecting   ? 'border-red-200 bg-white text-red-400'
                        : isConnected   ? 'border-emerald-200/80 bg-white text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}>
                        {meta.abbr}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">{meta.name}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${
                                disconnecting   ? 'bg-red-400'
                                : isConnected   ? 'bg-emerald-400 shadow-sm shadow-emerald-300/60'
                                : 'bg-slate-300'
                            }`} />
                            <span className={`text-xs font-medium ${
                                disconnecting   ? 'text-red-500'
                                : isConnected   ? 'text-emerald-600'
                                : 'text-slate-400'
                            }`}>
                                {disconnecting  ? t('settings.providers.status_removing')
                                : isConnected   ? t('settings.providers.status_on')
                                : t('settings.providers.status_off')}
                            </span>
                            {isConnected && provider?.last_checked_at && (
                                <span className="text-xs text-slate-400">· {provider.last_checked_at}</span>
                            )}
                        </div>
                    </div>
                </div>

                {isConnected && !disconnecting && (
                    <button type="button" onClick={onDisconnect}
                        className="text-xs font-medium text-slate-400 transition hover:text-red-500">
                        {t('settings.providers.disconnect')}
                    </button>
                )}
                {disconnecting && (
                    <button type="button" onClick={onCancelDisconnect}
                        className="text-xs font-medium text-slate-500 transition hover:text-slate-800">
                        {t('settings.providers.cancel')}
                    </button>
                )}
            </div>

            {/* Key field */}
            {!disconnecting && (
                <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {isConnected ? t('settings.providers.update_key') : t('settings.providers.api_key')}
                    </p>
                    <div className="relative mt-1.5">
                        <TextInput
                            type={showKey ? 'text' : 'password'}
                            className="block w-full pr-10"
                            value={keyValue}
                            onChange={onKeyChange}
                            placeholder={isConnected ? t('settings.providers.placeholder_connected') : 'sk-...'}
                        />
                        <button type="button" onClick={() => setShowKey(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
                            <EyeIcon open={showKey} />
                        </button>
                    </div>
                    {!isConnected && <p className="mt-1.5 text-xs text-slate-400">{meta.models}</p>}
                    <InputError className="mt-1" message={error} />
                </div>
            )}

            {disconnecting && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                    {t('settings.providers.disconnect_warning', { name: meta.name })}
                </p>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   TOGGLE
───────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
    return (
        <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-violet-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-400/30" />
        </label>
    );
}

/* ─────────────────────────────────────────────────────────
   ALERT ROW
───────────────────────────────────────────────────────── */
function AlertRow({ checked, onChange, disabled, label, description, variant = 'default' }) {
    return (
        <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
            variant === 'amber'
                ? 'border-amber-200/60 bg-amber-50/40 hover:bg-amber-50/70'
                : 'border-slate-200/60 bg-white/80 hover:bg-slate-50/80'
        }`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className={`h-4 w-4 rounded border-slate-300 focus:ring-2 ${
                    variant === 'amber' ? 'text-amber-500 focus:ring-amber-400' : 'text-violet-600 focus:ring-violet-400'
                }`}
            />
            <div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
        </label>
    );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */
export default function SettingsIndex({ organization, providers, notificationSettings }) {
    const openaiProvider    = providers?.find(p => p.provider === 'openai')    ?? null;
    const anthropicProvider = providers?.find(p => p.provider === 'anthropic') ?? null;
    const connectedCount    = [openaiProvider, anthropicProvider].filter(p => p?.status === 'connected').length;

    const { data, setData, put, processing, errors } = useForm({
        organization_name:           organization?.name ?? '',
        monthly_budget_cap:          organization?.monthly_budget_cap ?? '',
        currency:                    organization?.settings?.currency ?? 'EUR',
        timezone:                    organization?.settings?.timezone ?? 'Europe/Paris',
        locale:                      organization?.settings?.locale   ?? 'fr',
        openai_key:                  '',
        anthropic_key:               '',
        disconnect_openai:           false,
        disconnect_anthropic:        false,
        email_notifications_enabled: notificationSettings?.email_enabled    ?? false,
        notify_on_blocked:           notificationSettings?.notify_on_blocked ?? true,
        notify_on_fallback:          notificationSettings?.notify_on_fallback ?? true,
        notify_on_observed:          notificationSettings?.notify_on_observed ?? false,
        notification_recipients:     (notificationSettings?.recipients ?? []).join(', '),
    });

    // Live translation preview — updates as user picks a language before saving
    const { t } = useTranslation(data.locale);

    const submit = (e) => {
        e.preventDefault();
        put(route('settings.update'));
    };

    const LANGUAGES = [
        { value: 'fr', label: 'Français',  flag: '🇫🇷' },
        { value: 'en', label: 'English',   flag: '🇬🇧' },
        { value: 'es', label: 'Español',   flag: '🇪🇸' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{t('settings.title')}</h2>
                        <p className="mt-0.5 text-sm text-slate-500">{t('settings.subtitle')}</p>
                    </div>
                    {/* Live locale indicator */}
                    <span className="flex-shrink-0 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-500 backdrop-blur-sm">
                        {LANGUAGES.find(l => l.value === data.locale)?.flag}{' '}
                        {LANGUAGES.find(l => l.value === data.locale)?.label}
                    </span>
                </div>
            }
        >
            <Head title={t('settings.title')} />

            <form onSubmit={submit}>
                <div className="mx-auto grid max-w-4xl gap-5 sm:gap-6">

                    {/* ── 1. Organisation ── */}
                    <SectionPanel
                        title={t('settings.org.title')}
                        subtitle={t('settings.org.subtitle')}
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">{t('settings.org.name')}</label>
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={data.organization_name}
                                    onChange={(e) => setData('organization_name', e.target.value)}
                                    placeholder={t('settings.org.name_placeholder')}
                                />
                                {organization?.slug && (
                                    <p className="mt-1.5 text-xs text-slate-400">
                                        {t('settings.org.identifier')} :{' '}
                                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">
                                            {organization.slug}
                                        </span>
                                    </p>
                                )}
                                <InputError className="mt-1" message={errors.organization_name} />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">{t('settings.org.budget')}</label>
                                <div className="relative mt-1">
                                    <TextInput
                                        type="number" step="0.01"
                                        className="block w-full pr-12"
                                        value={data.monthly_budget_cap}
                                        onChange={(e) => setData('monthly_budget_cap', e.target.value)}
                                        placeholder="500"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                                        {data.currency}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-400">{t('settings.org.budget_hint')}</p>
                                <InputError className="mt-1" message={errors.monthly_budget_cap} />
                            </div>
                        </div>
                    </SectionPanel>

                    {/* ── 2. Providers ── */}
                    <SectionPanel
                        title={t('settings.providers.title')}
                        subtitle={t('settings.providers.subtitle')}
                        actions={
                            connectedCount > 0 ? (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                    {connectedCount}{' '}
                                    {connectedCount > 1
                                        ? t('settings.providers.connected_many')
                                        : t('settings.providers.connected_one')}
                                </span>
                            ) : null
                        }
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <ProviderCard
                                providerKey="openai"
                                provider={openaiProvider}
                                keyValue={data.openai_key}
                                disconnecting={data.disconnect_openai}
                                onKeyChange={(e) => setData('openai_key', e.target.value)}
                                onDisconnect={() => { setData('disconnect_openai', true); setData('openai_key', ''); }}
                                onCancelDisconnect={() => setData('disconnect_openai', false)}
                                error={errors.openai_key}
                                t={t}
                            />
                            <ProviderCard
                                providerKey="anthropic"
                                provider={anthropicProvider}
                                keyValue={data.anthropic_key}
                                disconnecting={data.disconnect_anthropic}
                                onKeyChange={(e) => setData('anthropic_key', e.target.value)}
                                onDisconnect={() => { setData('disconnect_anthropic', true); setData('anthropic_key', ''); }}
                                onCancelDisconnect={() => setData('disconnect_anthropic', false)}
                                error={errors.anthropic_key}
                                t={t}
                            />
                        </div>
                        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50/80 p-3 text-xs text-slate-500">
                            <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            {t('settings.providers.security_note')}
                        </div>
                    </SectionPanel>

                    {/* ── 3. Préférences ── */}
                    <SectionPanel
                        title={t('settings.prefs.title')}
                        subtitle={t('settings.prefs.subtitle')}
                    >
                        {/* Language dropdown */}
                        <div className="mb-5">
                            <label className="text-sm font-medium text-slate-700">{t('settings.prefs.language')}</label>
                            <select
                                value={data.locale}
                                onChange={(e) => setData('locale', e.target.value)}
                                className={inputCls}
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.value} value={lang.value}>
                                        {lang.flag}  {lang.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1.5 text-xs text-slate-400">{t('settings.prefs.language_hint')}</p>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">{t('settings.prefs.currency')}</label>
                                <select
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    className={inputCls}
                                >
                                    <optgroup label={t('settings.prefs.currency_group.main')}>
                                        <option value="EUR">€  EUR — Euro</option>
                                        <option value="USD">$  USD — Dollar américain</option>
                                        <option value="GBP">£  GBP — Livre sterling</option>
                                        <option value="CHF">Fr CHF — Franc suisse</option>
                                        <option value="CAD">$  CAD — Dollar canadien</option>
                                        <option value="AUD">$  AUD — Dollar australien</option>
                                    </optgroup>
                                    <optgroup label={t('settings.prefs.currency_group.other')}>
                                        <option value="JPY">¥  JPY — Yen japonais</option>
                                        <option value="SEK">kr SEK — Couronne suédoise</option>
                                        <option value="NOK">kr NOK — Couronne norvégienne</option>
                                        <option value="DKK">kr DKK — Couronne danoise</option>
                                        <option value="PLN">zł PLN — Złoty polonais</option>
                                        <option value="BRL">R$ BRL — Real brésilien</option>
                                        <option value="MXN">$  MXN — Peso mexicain</option>
                                        <option value="SGD">$  SGD — Dollar de Singapour</option>
                                        <option value="AED">د.إ AED — Dirham des Émirats</option>
                                        <option value="MAD">د.م MAD — Dirham marocain</option>
                                    </optgroup>
                                </select>
                                <p className="mt-1 text-xs text-slate-400">{t('settings.prefs.currency_hint')}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">{t('settings.prefs.timezone')}</label>
                                <select
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                    className={inputCls}
                                >
                                    <optgroup label={t('settings.prefs.tz_group.europe')}>
                                        <option value="Europe/Paris">Europe/Paris (UTC+1/+2)</option>
                                        <option value="Europe/London">Europe/London (UTC+0/+1)</option>
                                        <option value="Europe/Berlin">Europe/Berlin (UTC+1/+2)</option>
                                        <option value="Europe/Madrid">Europe/Madrid (UTC+1/+2)</option>
                                        <option value="Europe/Rome">Europe/Rome (UTC+1/+2)</option>
                                        <option value="Europe/Amsterdam">Europe/Amsterdam (UTC+1/+2)</option>
                                        <option value="Europe/Brussels">Europe/Brussels (UTC+1/+2)</option>
                                        <option value="Europe/Zurich">Europe/Zurich (UTC+1/+2)</option>
                                        <option value="Europe/Lisbon">Europe/Lisbon (UTC+0/+1)</option>
                                        <option value="Europe/Warsaw">Europe/Warsaw (UTC+1/+2)</option>
                                        <option value="Europe/Stockholm">Europe/Stockholm (UTC+1/+2)</option>
                                    </optgroup>
                                    <optgroup label={t('settings.prefs.tz_group.americas')}>
                                        <option value="America/New_York">America/New_York (UTC-5/-4)</option>
                                        <option value="America/Chicago">America/Chicago (UTC-6/-5)</option>
                                        <option value="America/Denver">America/Denver (UTC-7/-6)</option>
                                        <option value="America/Los_Angeles">America/Los_Angeles (UTC-8/-7)</option>
                                        <option value="America/Toronto">America/Toronto (UTC-5/-4)</option>
                                        <option value="America/Vancouver">America/Vancouver (UTC-8/-7)</option>
                                        <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</option>
                                        <option value="America/Mexico_City">America/Mexico_City (UTC-6/-5)</option>
                                    </optgroup>
                                    <optgroup label={t('settings.prefs.tz_group.asia')}>
                                        <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                                        <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                                        <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                                        <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                                        <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
                                        <option value="Australia/Sydney">Australia/Sydney (UTC+10/+11)</option>
                                    </optgroup>
                                    <optgroup label={t('settings.prefs.tz_group.africa')}>
                                        <option value="Africa/Casablanca">Africa/Casablanca (UTC+0/+1)</option>
                                        <option value="Africa/Tunis">Africa/Tunis (UTC+1)</option>
                                        <option value="Africa/Algiers">Africa/Algiers (UTC+1)</option>
                                        <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
                                        <option value="Africa/Johannesburg">Africa/Johannesburg (UTC+2)</option>
                                    </optgroup>
                                    <optgroup label={t('settings.prefs.tz_group.utc')}>
                                        <option value="UTC">UTC (UTC+0)</option>
                                    </optgroup>
                                </select>
                                <InputError className="mt-1" message={errors.timezone} />
                            </div>
                        </div>
                    </SectionPanel>

                    {/* ── 4. Alertes email ── */}
                    <SectionPanel
                        title={t('settings.notif.title')}
                        subtitle={t('settings.notif.subtitle')}
                    >
                        {/* Master toggle */}
                        <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/60 px-4 py-3.5">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{t('settings.notif.master_label')}</p>
                                <p className="mt-0.5 text-xs text-slate-500">{t('settings.notif.master_hint')}</p>
                            </div>
                            <Toggle
                                checked={data.email_notifications_enabled}
                                onChange={(e) => setData('email_notifications_enabled', e.target.checked)}
                            />
                        </div>

                        {/* Event rows */}
                        <div className={`space-y-2 transition-opacity ${data.email_notifications_enabled ? 'opacity-100' : 'pointer-events-none opacity-40'}`}>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {t('settings.notif.section_label')}
                            </p>
                            <AlertRow
                                checked={data.notify_on_blocked}
                                onChange={(e) => setData('notify_on_blocked', e.target.checked)}
                                disabled={!data.email_notifications_enabled}
                                label={t('settings.notif.blocked_label')}
                                description={t('settings.notif.blocked_hint')}
                            />
                            <AlertRow
                                checked={data.notify_on_fallback}
                                onChange={(e) => setData('notify_on_fallback', e.target.checked)}
                                disabled={!data.email_notifications_enabled}
                                label={t('settings.notif.fallback_label')}
                                description={t('settings.notif.fallback_hint')}
                            />
                            <AlertRow
                                checked={data.notify_on_observed}
                                onChange={(e) => setData('notify_on_observed', e.target.checked)}
                                disabled={!data.email_notifications_enabled}
                                label={t('settings.notif.observe_label')}
                                description={t('settings.notif.observe_hint')}
                                variant="amber"
                            />
                        </div>

                        {/* Recipients */}
                        <div className={`mt-4 transition-opacity ${data.email_notifications_enabled ? 'opacity-100' : 'pointer-events-none opacity-40'}`}>
                            <label className="text-sm font-medium text-slate-700">{t('settings.notif.recipients')}</label>
                            <TextInput
                                className="mt-1 block w-full"
                                value={data.notification_recipients}
                                onChange={(e) => setData('notification_recipients', e.target.value)}
                                placeholder={t('settings.notif.recipients_placeholder')}
                                disabled={!data.email_notifications_enabled}
                            />
                            <p className="mt-1 text-xs text-slate-400">{t('settings.notif.recipients_hint')}</p>
                        </div>

                        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50/80 p-3 text-xs text-slate-500">
                            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-500">i</span>
                            {t('settings.notif.rate_note')}
                        </div>
                    </SectionPanel>

                    {/* ── Save ── */}
                    <div className="flex items-center gap-3 pb-2">
                        <PrimaryButton disabled={processing}>{t('common.save')}</PrimaryButton>
                        {processing && <span className="text-sm text-slate-400">{t('common.saving')}</span>}
                    </div>

                </div>
            </form>
        </AuthenticatedLayout>
    );
}
