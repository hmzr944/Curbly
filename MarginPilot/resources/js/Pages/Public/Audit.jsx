import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useState } from 'react';
import { track } from '@/lib/track';

const ANIM_CSS = `
@keyframes mp-orb-a {
  0%,100% { transform:translate(0,0) scale(1);    opacity:.10; }
  33%      { transform:translate(16px,-12px) scale(1.05); opacity:.17; }
  66%      { transform:translate(-8px,18px)  scale(.97); opacity:.12; }
}
@keyframes mp-orb-b {
  0%,100% { transform:translate(0,0) scale(1);    }
  40%      { transform:translate(-18px,14px) scale(1.07); }
  70%      { transform:translate(12px,-6px)  scale(.95); }
}
.mp-orb-a { animation:mp-orb-a 18s ease-in-out infinite; }
.mp-orb-b { animation:mp-orb-b 22s ease-in-out infinite; }
.mp-glass {
  background: rgba(255,255,255,.74);
  backdrop-filter: blur(24px) saturate(1.6);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  border: 1px solid rgba(255,255,255,.65);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.55) inset,
    0 4px 16px rgba(0,0,0,.06),
    0 14px 44px rgba(0,0,0,.09);
}
`;

function PageOrbs() {
    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
            <div className="mp-orb-a absolute -top-28 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-violet-400/[0.10] blur-[120px]" />
            <div className="mp-orb-b absolute -bottom-20 -right-16 h-[440px] w-[440px] rounded-full bg-violet-300/[0.09] blur-[100px]" />
            <div className="mp-orb-a absolute top-1/2 -left-20 h-[320px] w-[320px] rounded-full bg-purple-300/[0.06] blur-[80px]" style={{ animationDelay: '4s' }} />
        </div>
    );
}

const StepIndicator = ({ currentStep, totalSteps }) => (
    <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
            <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                    i < currentStep
                        ? 'w-8 bg-gradient-to-r from-violet-500 to-violet-400'
                        : i === currentStep
                        ? 'w-8 bg-violet-400'
                        : 'w-2 bg-slate-200'
                }`}
            />
        ))}
    </div>
);

const SelectCard = ({ option, selected, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`group relative flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-all duration-300 hover:-translate-y-0.5 ${
            selected
                ? 'border-violet-400 bg-gradient-to-br from-violet-50 to-violet-50/60 shadow-lg shadow-violet-500/15'
                : 'border-slate-200/80 bg-white/70 backdrop-blur-sm hover:border-slate-300 hover:shadow-md'
        }`}
    >
        {selected && (
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-500/30">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        )}
        {children}
    </button>
);

const MultiSelectCard = ({ option, selected, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`group relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
            selected
                ? 'border-violet-400 bg-violet-50/80'
                : 'border-slate-200/80 bg-white/70 backdrop-blur-sm hover:border-slate-300'
        }`}
    >
        <div
            className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                selected
                    ? 'border-violet-500 bg-violet-500 text-white'
                    : 'border-slate-300 bg-white'
            }`}
        >
            {selected && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
        <span className="font-medium text-slate-700">{children}</span>
    </button>
);

export default function Audit({ providers, models, volumes, useCases, pricingModels, plans }) {
    const [step, setStep] = useState(0);
    const totalSteps = 5;
    const [submitError, setSubmitError] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        company: '',
        contact_name: '',
        phone: '',
        provider: '',
        model: '',
        volume: '',
        useCase: '',
        pricing: '',
        plans: [],
        current_spend: '',
        customer_count: '',
        industry: '',
    });

    const filteredModels = models.filter(
        (m) => !data.provider || m.provider === data.provider
    );

    const togglePlan = (plan) => {
        const currentPlans = data.plans;
        if (currentPlans.includes(plan)) {
            setData('plans', currentPlans.filter((p) => p !== plan));
        } else {
            setData('plans', [...currentPlans, plan]);
        }
    };

    const nextStep = () => {
        if (step < totalSteps - 1) {
            track('Audit Step Completed', { step: step + 1 });
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    const canProceed = () => {
        switch (step) {
            case 0:
                return data.provider && data.model;
            case 1:
                return data.volume && data.useCase;
            case 2:
                return data.pricing && data.plans.length > 0;
            case 3:
                return data.email && data.company;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (step < totalSteps - 1 && canProceed()) {
                nextStep();
            } else if (step === totalSteps - 1 && canProceed() && !processing) {
                post(route('audit.store'));
            }
        }
    };

    const submit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (step !== totalSteps - 1) return;
        setSubmitError(null);
        track('Audit Submitted', { provider: data.provider, volume: data.volume });
        post(route('audit.store'), {
            onError: () => {
                setSubmitError("Erreur lors de la génération de l'audit. Vérifiez les champs et réessayez.");
            },
            onSuccess: () => setSubmitError(null),
        });
    };

    return (
        <PublicLayout>
            <Head title="Audit IA Gratuit en 5 Minutes — Margexa" />
            <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />
            <PageOrbs />

            <div className="relative" style={{ zIndex: 1 }}>
            <section className="relative min-h-screen overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pt-32">

                <div className="relative mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/80 px-4 py-2 text-sm font-medium text-violet-700 backdrop-blur-sm">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Audit gratuit • 5 minutes
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                            Où fuit votre marge IA ?
                        </h1>
                        <p className="mt-4 text-lg text-slate-600">
                            Répondez à quelques questions, recevez un diagnostic complet avec recommandations.
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="mb-8">
                        <StepIndicator currentStep={step} totalSteps={totalSteps} />
                    </div>

                    {/* Form */}
                    <div onKeyDown={handleKeyDown}>
                        {submitError && (
                            <div className="mb-4 rounded bg-red-100 px-4 py-2 text-red-700">
                                {submitError}
                            </div>
                        )}
                        <div className="mp-glass rounded-3xl p-6 sm:p-8">
                            {/* Top accent */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/50 to-transparent" />

                            {/* Step 0: Provider & Model */}
                            {step === 0 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Votre stack IA</h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Quel provider et modèle utilisez-vous principalement ?
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-3 block text-sm font-medium text-slate-700">
                                            Provider
                                        </label>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {providers.map((p) => (
                                                <SelectCard
                                                    key={p.value}
                                                    selected={data.provider === p.value}
                                                    onClick={() => setData('provider', p.value)}
                                                >
                                                    <span className="font-semibold text-slate-900">{p.label}</span>
                                                </SelectCard>
                                            ))}
                                        </div>
                                    </div>

                                    {data.provider && (
                                        <div>
                                            <label className="mb-3 block text-sm font-medium text-slate-700">
                                                Modèle principal
                                            </label>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {filteredModels.map((m) => (
                                                    <SelectCard
                                                        key={m.value}
                                                        selected={data.model === m.value}
                                                        onClick={() => setData('model', m.value)}
                                                    >
                                                        <span className="font-semibold text-slate-900">{m.label}</span>
                                                    </SelectCard>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 1: Volume & Use Case */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Volume & Usage</h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Quel est votre volume et cas d'usage ?
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-3 block text-sm font-medium text-slate-700">
                                            Volume mensuel
                                        </label>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {volumes.map((v) => (
                                                <SelectCard
                                                    key={v.value}
                                                    selected={data.volume === v.value}
                                                    onClick={() => setData('volume', v.value)}
                                                >
                                                    <span className="font-semibold text-slate-900">{v.label}</span>
                                                    <span className="mt-1 text-xs text-slate-500">{v.estimate}</span>
                                                </SelectCard>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-3 block text-sm font-medium text-slate-700">
                                            Cas d'usage principal
                                        </label>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {useCases.map((u) => (
                                                <SelectCard
                                                    key={u.value}
                                                    selected={data.useCase === u.value}
                                                    onClick={() => setData('useCase', u.value)}
                                                >
                                                    <span className="font-semibold text-slate-900">{u.label}</span>
                                                </SelectCard>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Pricing & Plans */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Business model</h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Comment facturez-vous vos clients ?
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-3 block text-sm font-medium text-slate-700">
                                            Modèle de pricing
                                        </label>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {pricingModels.map((p) => (
                                                <SelectCard
                                                    key={p.value}
                                                    selected={data.pricing === p.value}
                                                    onClick={() => setData('pricing', p.value)}
                                                >
                                                    <span className="font-semibold text-slate-900">{p.label}</span>
                                                </SelectCard>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-3 block text-sm font-medium text-slate-700">
                                            Plans proposés (plusieurs choix possibles)
                                        </label>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {plans.map((p) => (
                                                <MultiSelectCard
                                                    key={p.value}
                                                    selected={data.plans.includes(p.value)}
                                                    onClick={() => togglePlan(p.value)}
                                                >
                                                    {p.label}
                                                </MultiSelectCard>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Contact Info */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Vos coordonnées</h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Pour recevoir votre rapport d'audit complet.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Email professionnel *
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 focus:border-violet-400 focus:bg-white focus:ring-violet-400"
                                                placeholder="vous@entreprise.com"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                            )}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Nom de l'entreprise *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.company}
                                                onChange={(e) => setData('company', e.target.value)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 focus:border-violet-400 focus:bg-white focus:ring-violet-400"
                                                placeholder="Acme Inc."
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Votre nom
                                            </label>
                                            <input
                                                type="text"
                                                value={data.contact_name}
                                                onChange={(e) => setData('contact_name', e.target.value)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 focus:border-violet-400 focus:bg-white focus:ring-violet-400"
                                                placeholder="Jean Dupont"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Téléphone
                                            </label>
                                            <input
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 focus:border-violet-400 focus:bg-white focus:ring-violet-400"
                                                placeholder="+33 6 ..."
                                            />
                                        </div>
                                    </div>

                                    {/* Privacy note */}
                                    <p className="text-xs leading-5 text-slate-400">
                                        Ces données sont utilisées uniquement pour générer votre audit et vous recontacter si vous le souhaitez.
                                        Elles sont conservées 90 jours.{' '}
                                        <a href="/legal/confidentialite" target="_blank" className="text-violet-500 hover:underline">
                                            Politique de confidentialité
                                        </a>
                                    </p>
                                </div>
                            )}

                            {/* Step 4: Optional details */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Précisions (optionnel)</h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Ces informations affinent votre diagnostic.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Dépense IA mensuelle actuelle (€)
                                            </label>
                                            <input
                                                type="number"
                                                value={data.current_spend}
                                                onChange={(e) => setData('current_spend', e.target.value)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 focus:border-violet-400 focus:bg-white focus:ring-violet-400"
                                                placeholder="2000"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Nombre de clients actifs
                                            </label>
                                            <input
                                                type="number"
                                                value={data.customer_count}
                                                onChange={(e) => setData('customer_count', e.target.value)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 focus:border-violet-400 focus:bg-white focus:ring-violet-400"
                                                placeholder="150"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Secteur d'activité
                                            </label>
                                            <input
                                                type="text"
                                                value={data.industry}
                                                onChange={(e) => setData('industry', e.target.value)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 focus:border-violet-400 focus:bg-white focus:ring-violet-400"
                                                placeholder="SaaS, E-commerce, Fintech..."
                                            />
                                        </div>
                                    </div>

                                    {/* Summary before submit */}
                                    <div className="rounded-2xl border border-violet-100/80 bg-violet-50/40 p-5 backdrop-blur-sm">
                                        <h3 className="font-semibold text-slate-900">Récapitulatif</h3>
                                        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                            <div>
                                                <dt className="text-slate-500">Provider</dt>
                                                <dd className="font-medium text-slate-900">{data.provider}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Modèle</dt>
                                                <dd className="font-medium text-slate-900">{data.model}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Volume</dt>
                                                <dd className="font-medium text-slate-900">{data.volume}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Plans</dt>
                                                <dd className="font-medium text-slate-900">{data.plans.join(', ')}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="mt-8 flex items-center justify-between">
                                {step > 0 ? (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Précédent
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {step < totalSteps - 1 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!canProceed()}
                                        className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Continuer
                                        <svg className="h-4 w-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => post(route('audit.store'))}
                                        disabled={processing || !canProceed()}
                                        className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Analyse en cours...
                                            </>
                                        ) : (
                                            <>
                                                Recevoir mon audit
                                                <svg className="h-4 w-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                            Données confidentielles
                        </span>
                        <span className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Résultat instantané
                        </span>
                        <span className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                            </svg>
                            100% gratuit
                        </span>
                    </div>
                </div>
            </section>
            </div>
        </PublicLayout>
    );
}
