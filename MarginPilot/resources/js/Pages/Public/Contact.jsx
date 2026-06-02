import { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const Field = ({ label, error, required, children }) => (
    <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
            {required && <span className="ml-0.5 text-violet-500">*</span>}
        </label>
        {children}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const Input = ({ cls = '', ...props }) => (
    <input
        className={`w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm backdrop-blur-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 ${cls}`}
        {...props}
    />
);

const Select = ({ children, ...props }) => (
    <select
        className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm backdrop-blur-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
        {...props}
    >
        {children}
    </select>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Contact() {
    const { flash } = usePage().props;
    const success = flash?.success;

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        role: '',
        subject: '',
        message: '',
        team_size: '',
        ai_volume: '',
        website: '', // honeypot
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('contact.store'), { preserveScroll: true });
    };

    return (
        <PublicLayout>
            <Head>
                <title>Contact — Margexa</title>
                <meta name="description" content="Contactez l'équipe Margexa pour une démo, une offre Sur mesure ou toute question." />
            </Head>

            <section className="relative overflow-hidden px-4 pb-24 pt-36 sm:px-6 sm:pt-44">

                {/* Orb de fond */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-400/[0.07] blur-[120px]" />

                <div className="relative mx-auto max-w-5xl">

                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-violet-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                            </span>
                            Réponse sous 24h ouvrées
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl" style={{ lineHeight: 1.1 }}>
                            Parler à{' '}
                            <span className="bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                                l'équipe
                            </span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-500">
                            Démo, offre Sur mesure, questions techniques, ou simplement explorer
                            ce que Margexa peut faire pour vous.
                        </p>
                    </div>

                    {/* Confirmation */}
                    {success && (
                        <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50/80 px-6 py-5 text-center backdrop-blur-sm">
                            <div className="text-lg font-semibold text-emerald-800">Message envoyé ✓</div>
                            <p className="mt-1 text-sm text-emerald-700">
                                Merci ! Nous vous répondrons dans les 24h ouvrées.
                            </p>
                        </div>
                    )}

                    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">

                        {/* Colonne gauche : infos */}
                        <div className="lg:col-span-2">
                            <div className="sticky top-28 space-y-5">

                                {[
                                    {
                                        icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
                                        title: 'Demande de démo',
                                        desc: '30 minutes pour tout comprendre sur votre cas concret.',
                                    },
                                    {
                                        icon: 'M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
                                        title: 'Offre Sur mesure',
                                        desc: 'Multi-organisations, SLA, intégrations custom, accompagnement dédié.',
                                    },
                                    {
                                        icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
                                        title: 'Support & questions',
                                        desc: 'Intégration, configuration, billing — réponse garantie.',
                                    },
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-3.5 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-md">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                                            <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}

                                <div className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-md">
                                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Email direct</div>
                                    <a
                                        href="mailto:contact@Margexa.app"
                                        className="mt-1.5 block text-sm font-medium text-violet-700 hover:underline"
                                    >
                                        contact@Margexa.app
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Formulaire */}
                        <div className="lg:col-span-3">
                            <form
                                onSubmit={submit}
                                className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-xl sm:p-8"
                                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)' }}
                            >
                                {/* Honeypot (caché) */}
                                <div className="hidden" aria-hidden="true">
                                    <input
                                        type="text"
                                        name="website"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        value={data.website}
                                        onChange={e => setData('website', e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Prénom" required error={errors.first_name}>
                                        <Input
                                            type="text"
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                            placeholder="Marie"
                                            autoComplete="given-name"
                                            required
                                        />
                                    </Field>

                                    <Field label="Nom" required error={errors.last_name}>
                                        <Input
                                            type="text"
                                            value={data.last_name}
                                            onChange={e => setData('last_name', e.target.value)}
                                            placeholder="Dupont"
                                            autoComplete="family-name"
                                            required
                                        />
                                    </Field>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Field label="Email professionnel" required error={errors.email}>
                                        <Input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="marie@monentreprise.com"
                                            autoComplete="email"
                                            required
                                        />
                                    </Field>

                                    <Field label="Entreprise" required error={errors.company}>
                                        <Input
                                            type="text"
                                            value={data.company}
                                            onChange={e => setData('company', e.target.value)}
                                            placeholder="Mon Entreprise SAS"
                                            autoComplete="organization"
                                            required
                                        />
                                    </Field>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Field label="Rôle / Poste" error={errors.role}>
                                        <Input
                                            type="text"
                                            value={data.role}
                                            onChange={e => setData('role', e.target.value)}
                                            placeholder="CTO, Head of Product…"
                                        />
                                    </Field>

                                    <Field label="Sujet" required error={errors.subject}>
                                        <Select
                                            value={data.subject}
                                            onChange={e => setData('subject', e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Choisir un sujet…</option>
                                            <option value="demo">Demande de démo</option>
                                            <option value="essentiel">Offre Essentiel</option>
                                            <option value="scale">Offre Sur mesure</option>
                                            <option value="support">Support / Questions techniques</option>
                                            <option value="autre">Autre</option>
                                        </Select>
                                    </Field>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Field label="Taille de l'équipe support" error={errors.team_size}>
                                        <Select
                                            value={data.team_size}
                                            onChange={e => setData('team_size', e.target.value)}
                                        >
                                            <option value="">Non renseigné</option>
                                            <option value="1-5">1 – 5 personnes</option>
                                            <option value="6-20">6 – 20 personnes</option>
                                            <option value="21-100">21 – 100 personnes</option>
                                            <option value="100+">100+ personnes</option>
                                        </Select>
                                    </Field>

                                    <Field label="Volume IA estimé" error={errors.ai_volume}>
                                        <Select
                                            value={data.ai_volume}
                                            onChange={e => setData('ai_volume', e.target.value)}
                                        >
                                            <option value="">Non renseigné</option>
                                            <option value="< 10k req/mois">{'< 10k req/mois'}</option>
                                            <option value="10k – 50k">10k – 50k req/mois</option>
                                            <option value="50k – 100k">50k – 100k req/mois</option>
                                            <option value="100k+">100k+ req/mois</option>
                                        </Select>
                                    </Field>
                                </div>

                                <div className="mt-4">
                                    <Field label="Message" required error={errors.message}>
                                        <textarea
                                            rows={5}
                                            value={data.message}
                                            onChange={e => setData('message', e.target.value)}
                                            placeholder="Décrivez votre situation, votre stack IA, vos enjeux…"
                                            required
                                            className="w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm backdrop-blur-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
                                        />
                                        <p className="mt-1 text-xs text-slate-400">{data.message.length} / 3000</p>
                                    </Field>
                                </div>

                                <div className="mt-6 space-y-4">
                                    {/* RGPD consent */}
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            required
                                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                        />
                                        <span className="text-xs leading-5 text-slate-500">
                                            En soumettant ce formulaire, j'accepte que mes données soient traitées par Margexa pour répondre à ma demande, conformément à notre{' '}
                                            <a href="/legal/confidentialite" target="_blank" className="font-medium text-violet-600 hover:underline">
                                                Politique de confidentialité
                                            </a>
                                            .
                                        </span>
                                    </label>

                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-xs text-slate-400">
                                            Réponse sous 24h ouvrées · Données hébergées EU
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-violet-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {processing ? 'Envoi…' : 'Envoyer le message'}
                                            {!processing && (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
