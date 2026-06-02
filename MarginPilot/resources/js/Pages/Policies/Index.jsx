import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SectionPanel from '@/Components/SectionPanel';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const TYPE_LABELS = {
    budget_cap:                'Plafond budget',
    alert_threshold:           "Seuil d'alerte",
    fallback_model:            'Repli de modèle',
    premium_model_restriction: 'Restriction premium',
};

const SCOPE_LABELS = {
    organization: 'Organisation',
    plan:         'Plan',
    customer:     'Client',
    feature:      'Fonctionnalité',
};

const policyTypes = [
    { value: 'budget_cap',                label: 'Plafond budgétaire' },
    { value: 'alert_threshold',           label: "Seuil d'alerte" },
    { value: 'fallback_model',            label: 'Repli de modèle' },
    { value: 'premium_model_restriction', label: 'Restriction modèles premium' },
];

const policyScopes = [
    { value: 'organization', label: 'Organisation' },
    { value: 'plan',         label: 'Plan' },
    { value: 'customer',     label: 'Client' },
    { value: 'feature',      label: 'Fonctionnalité' },
];

const enforcementModes = [
    { value: 'enforce', label: 'Appliquer', description: 'Bloque ou applique le repli réellement' },
    { value: 'observe', label: 'Observer',  description: 'Évalue sans action réelle — idéal pour tester' },
];

const selectCls = 'mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/20';

/* ─────────────────────────────────────────────────────────
   VERTICAL LABELS + SAVINGS POTENTIAL
───────────────────────────────────────────────────────── */
const VERTICAL_LABELS = {
    universal: { label: 'Essentiels',       cls: 'border-slate-200 bg-slate-50 text-slate-600' },
    support:   { label: 'Support SaaS',     cls: 'border-violet-200 bg-violet-50 text-violet-700' },
    ecommerce: { label: 'E-commerce',       cls: 'border-violet-200 bg-violet-50 text-violet-700' },
    fintech:   { label: 'Fintech',          cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    rh:        { label: 'RH / Recrutement', cls: 'border-amber-200 bg-amber-50 text-amber-700' },
};

const SAVINGS_LABELS = {
    'élevé':  { label: 'Impact élevé',  cls: 'border-violet-200 bg-violet-50 text-violet-700' },
    'moyen':  { label: 'Impact moyen',  cls: 'border-amber-200 bg-amber-50 text-amber-700'   },
    'faible': { label: 'Impact faible', cls: 'border-slate-200 bg-slate-50 text-slate-500'   },
};

/* ─────────────────────────────────────────────────────────
   TEMPLATE ENRICHMENT
   Falls back to derived values when metadata is missing
───────────────────────────────────────────────────────── */
function enrichTemplate(template) {
    const k = (template.key  || '').toLowerCase();
    const n = (template.name || '').toLowerCase();

    if (k.includes('fallback') || n.includes('repli') || n.includes('fallback'))
        return { protects: 'Coût des modèles premium non justifiés', priority: 'high' };
    if (k.includes('budget') || n.includes('budget') || n.includes('plafond'))
        return { protects: 'Budget IA mensuel de l\'organisation',  priority: 'high' };
    if ((k.includes('plan') && !k.includes('fallback')) || (n.includes('plan') && !n.includes('fallback')))
        return { protects: 'Rentabilité par plan tarifaire',        priority: 'medium' };
    if (k.includes('customer') || k.includes('client') || n.includes('client'))
        return { protects: 'Exposition coût d\'un client spécifique', priority: 'medium' };
    if (k.includes('feature') || n.includes('feature') || n.includes('fonction'))
        return { protects: 'Coût d\'une fonctionnalité isolée',     priority: 'low' };
    if (k.includes('restrict') || k.includes('premium') || n.includes('restrict') || n.includes('premium'))
        return { protects: 'Accès aux modèles premium par plan',    priority: 'medium' };

    return { protects: 'Usage IA support', priority: 'medium' };
}

/* ─────────────────────────────────────────────────────────
   POLICY HUMAN-READABLE BUILDERS
───────────────────────────────────────────────────────── */
function buildConditionLabel(policy) {
    const t = policy.conditions?.threshold;
    const s = t != null ? `$${t}` : 'le seuil défini';
    switch (policy.type) {
        case 'fallback_model':            return `Si le coût d'une requête dépasse ${s}`;
        case 'budget_cap':                return `Si le coût mensuel total dépasse ${s}`;
        case 'alert_threshold':           return `Si le coût par requête dépasse ${s}`;
        case 'premium_model_restriction': return 'Dès qu\'un modèle premium est demandé sur ce scope';
        default:                          return 'Condition personnalisée';
    }
}

function buildActionLabel(policy) {
    const fb = policy.actions?.fallback_model;
    switch (policy.type) {
        case 'fallback_model':            return fb ? `Rediriger vers ${fb}` : 'Rediriger vers modèle économique';
        case 'budget_cap':                return 'Bloquer la requête';
        case 'alert_threshold':           return 'Envoyer une alerte email';
        case 'premium_model_restriction': return fb ? `Refuser, rediriger vers ${fb}` : 'Refuser l\'accès au modèle premium';
        default:                          return 'Action personnalisée';
    }
}

function buildExpectedOutcome(policy) {
    switch (policy.type) {
        case 'fallback_model':            return 'Réduction du coût par requête en limitant l\'usage des modèles coûteux.';
        case 'budget_cap':                return 'Maintien du coût IA dans l\'enveloppe budgétaire mensuelle.';
        case 'alert_threshold':           return 'Détection proactive des requêtes anormalement coûteuses.';
        case 'premium_model_restriction': return 'Protection des plans inférieurs contre les surcoûts liés aux modèles premium.';
        default:                          return 'Contrôle renforcé du coût IA support.';
    }
}

/* ─────────────────────────────────────────────────────────
   BADGES
───────────────────────────────────────────────────────── */
function PriorityBadge({ priority }) {
    const map = {
        high:   { cls: 'border-violet-200 bg-violet-50 text-violet-700',  label: 'Priorité haute' },
        medium: { cls: 'border-slate-200 bg-slate-50 text-slate-600',     label: 'Recommandé' },
        low:    { cls: 'border-slate-200 bg-slate-50 text-slate-400',     label: 'Optionnel' },
    };
    const { cls, label } = map[priority] ?? map.medium;
    return (
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
            {label}
        </span>
    );
}

function ModeBadge({ mode }) {
    if (mode === 'observe') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Observation
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Actif
        </span>
    );
}

/* ─────────────────────────────────────────────────────────
   TEMPLATE CARD
───────────────────────────────────────────────────────── */
function TemplateCard({ template, onActivate }) {
    const meta     = enrichTemplate(template);
    const vLabel   = VERTICAL_LABELS[template.vertical];
    const sLabel   = SAVINGS_LABELS[template.savings_potential];
    const whyText  = template.why || `Protège : ${meta.protects}`;

    return (
        <div className={`flex flex-col rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
            template.is_active
                ? 'border-violet-200/70 bg-gradient-to-br from-violet-50/80 to-white/80 shadow-sm'
                : 'border-slate-200/60 bg-white/85 backdrop-blur-xl hover:border-violet-200/60'
        }`}>
            {/* Top badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
                {vLabel && (
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${vLabel.cls}`}>
                        {vLabel.label}
                    </span>
                )}
                {sLabel && (
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${sLabel.cls}`}>
                        {sLabel.label}
                    </span>
                )}
            </div>

            {/* Name + status indicator */}
            <div className="mt-2 flex items-start justify-between gap-2">
                <p className="text-sm font-bold leading-snug text-slate-900">{template.name}</p>
                {template.is_active ? (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-500 shadow-sm shadow-violet-500/20">
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </span>
                ) : (
                    <PriorityBadge priority={meta.priority} />
                )}
            </div>

            {/* Description */}
            <p className="mt-1.5 flex-1 line-clamp-2 text-xs text-slate-500">{template.description}</p>

            {/* Why (business rationale) */}
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50/80 px-3 py-2.5">
                <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs font-medium leading-snug text-slate-600">{whyText}</span>
            </div>

            {/* CTA */}
            <button
                type="button"
                onClick={() => onActivate(template.key)}
                className={`mt-4 w-full rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    template.is_active
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-sm shadow-violet-500/20 hover:-translate-y-px hover:shadow-violet-500/30'
                }`}
            >
                {template.is_active ? 'Réinitialiser' : 'Activer ce guardrail'}
            </button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   POLICY DETAIL PANEL
───────────────────────────────────────────────────────── */
function PolicyDetailPanel({ policy, onClose, onEdit }) {
    const condition = buildConditionLabel(policy);
    const action    = buildActionLabel(policy);
    const outcome   = buildExpectedOutcome(policy);

    return (
        <div className="rounded-2xl border border-violet-200/50 bg-white/90 p-6 backdrop-blur-xl sm:rounded-3xl">
            {/* Panel header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <ModeBadge mode={policy.enforcement_mode || 'enforce'} />
                        <span className={`text-xs font-medium ${policy.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {policy.is_active ? '· Active' : '· En pause'}
                        </span>
                        <span className="text-xs text-slate-400">
                            · {SCOPE_LABELS[policy.scope] || policy.scope}
                        </span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">{policy.name}</h3>
                    {policy.description && (
                        <p className="mt-0.5 text-sm text-slate-500">{policy.description}</p>
                    )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(policy)}
                        className="rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:shadow-sm"
                    >
                        Modifier
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Detail grid */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Condition</p>
                    <p className="mt-1.5 text-sm font-medium text-slate-800">{condition}</p>
                </div>

                <div className="rounded-xl border border-violet-100/70 bg-violet-50/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">Action appliquée</p>
                    <p className="mt-1.5 text-sm font-medium text-slate-800">{action}</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Portée protégée</p>
                    <p className="mt-1.5 text-sm font-medium text-slate-800">
                        {SCOPE_LABELS[policy.scope] || policy.scope}
                        {policy.conditions?.threshold && (
                            <span className="ml-2 text-xs font-normal text-slate-400">· Seuil : ${policy.conditions.threshold}</span>
                        )}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mode d'activation</p>
                    <p className="mt-1.5 text-sm font-medium text-slate-800">
                        {policy.enforcement_mode === 'observe'
                            ? 'Observation — évalue sans agir, idéal pour tester'
                            : 'Production — bloque ou redirige les requêtes réelles'}
                    </p>
                </div>
            </div>

            {/* Expected outcome */}
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200/60 bg-white/80 p-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50">
                    <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Résultat attendu</p>
                    <p className="mt-1 text-sm text-slate-700">{outcome}</p>
                </div>
            </div>

            {/* Quick actions */}
            <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                <button
                    type="button"
                    onClick={() => router.patch(route('policies.toggle-mode', policy.id))}
                    className={`inline-flex items-center rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                        policy.enforcement_mode === 'observe'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                >
                    {policy.enforcement_mode === 'observe' ? 'Passer en mode Appliquer' : 'Passer en mode Observation'}
                </button>
                <button
                    type="button"
                    onClick={() => router.patch(route('policies.toggle', policy.id))}
                    className="inline-flex items-center rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:shadow-sm"
                >
                    {policy.is_active ? 'Mettre en pause' : 'Réactiver'}
                </button>
                <Link
                    href={route('margin-impact.index')}
                    className="inline-flex items-center rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:shadow-sm"
                >
                    Voir l'impact de cette règle →
                </Link>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function PoliciesIndex({ policies, templates, recentTriggersCount = 0 }) {
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [editingPolicy,  setEditingPolicy]  = useState(null);
    const [showForm,       setShowForm]       = useState(false);
    const [activeVertical, setActiveVertical] = useState('all');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name:             '',
        type:             'budget_cap',
        scope:            'organization',
        description:      '',
        threshold:        '',
        fallback_model:   '',
        is_active:        true,
        enforcement_mode: 'enforce',
    });

    const submit = (e) => {
        e.preventDefault();
        const payload = { ...data, threshold: data.threshold === '' ? null : Number(data.threshold) };
        if (editingPolicy) {
            put(route('policies.update', editingPolicy.id), {
                data: payload,
                onSuccess: () => { setEditingPolicy(null); setShowForm(false); reset(); setSelectedPolicy(null); },
            });
            return;
        }
        post(route('policies.store'), {
            data: payload,
            onSuccess: () => { setShowForm(false); reset(); },
        });
    };

    const startEdit = (policy) => {
        setSelectedPolicy(null);
        setEditingPolicy(policy);
        setShowForm(true);
        setData({
            name:             policy.name,
            type:             policy.type,
            scope:            policy.scope,
            description:      policy.description || '',
            threshold:        policy.conditions?.threshold ?? '',
            fallback_model:   policy.actions?.fallback_model ?? '',
            is_active:        policy.is_active,
            enforcement_mode: policy.enforcement_mode || 'enforce',
        });
    };

    const cancelForm = () => { setEditingPolicy(null); setShowForm(false); reset(); };

    const rows         = useMemo(() => policies  ?? [], [policies]);
    const allTemplates = useMemo(() => templates ?? [], [templates]);
    const templateRows = useMemo(
        () => activeVertical === 'all'
            ? allTemplates
            : allTemplates.filter(t => t.vertical === activeVertical),
        [allTemplates, activeVertical],
    );

    const activeCount  = rows.filter(p => p.is_active && p.enforcement_mode !== 'observe').length;
    const observeCount = rows.filter(p => p.is_active && p.enforcement_mode === 'observe').length;
    const pausedCount  = rows.filter(p => !p.is_active).length;

    const openCreate = () => { setShowForm(true); setEditingPolicy(null); reset(); setSelectedPolicy(null); };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Policies</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Activez des guardrails métier pour limiter les usages support IA non rentables.</p>
                    </div>
                    {!showForm && !editingPolicy && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/25 transition hover:-translate-y-px hover:shadow-md"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Créer une policy
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Policies" />

            <div className="mx-auto grid max-w-7xl gap-5 sm:gap-6">

                {/* ── KPI cards ── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/60 bg-white/85 p-5 backdrop-blur-xl">
                        <p className="text-sm font-medium text-slate-500">Policies actives</p>
                        <p className="mt-2 text-3xl font-bold text-violet-600">{activeCount}</p>
                        <p className="mt-1 text-xs text-slate-400">Appliquées en production</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/60 bg-white/85 p-5 backdrop-blur-xl">
                        <p className="text-sm font-medium text-slate-500">En observation</p>
                        <p className="mt-2 text-3xl font-bold text-amber-500">{observeCount}</p>
                        <p className="mt-1 text-xs text-slate-400">Test — aucune action réelle</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/60 bg-white/85 p-5 backdrop-blur-xl">
                        <p className="text-sm font-medium text-slate-500">En pause</p>
                        <p className="mt-2 text-3xl font-bold text-slate-400">{pausedCount}</p>
                        <p className="mt-1 text-xs text-slate-400">Désactivées — sans effet</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/60 bg-white/85 p-5 backdrop-blur-xl">
                        <p className="text-sm font-medium text-slate-500">Déclenchements récents</p>
                        <p className={`mt-2 text-3xl font-bold ${recentTriggersCount > 0 ? 'text-violet-600' : 'text-slate-300'}`}>
                            {recentTriggersCount}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">Dernières 24 heures</p>
                    </div>
                </div>

                {/* ── Templates ── */}
                <SectionPanel
                    title="Guardrails recommandés"
                    subtitle="Activez en un clic des protections éprouvées adaptées à votre usage"
                    variant="highlight"
                    actions={
                        <span className="text-xs font-medium text-violet-600">
                            {templateRows.filter(t => t.is_active).length} / {templateRows.length} activé{templateRows.filter(t => t.is_active).length !== 1 ? 's' : ''}
                        </span>
                    }
                >
                    {/* Vertical filter tabs */}
                    <div className="mb-4 flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            onClick={() => setActiveVertical('all')}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                activeVertical === 'all'
                                    ? 'border-violet-300 bg-violet-100 text-violet-700'
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            }`}
                        >
                            Tous ({allTemplates.length})
                        </button>
                        {Object.entries(VERTICAL_LABELS).map(([key, { label, cls }]) => {
                            const count = allTemplates.filter(t => t.vertical === key).length;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveVertical(key)}
                                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                        activeVertical === key ? cls : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                                >
                                    {label} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {templateRows.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {templateRows.map((template) => (
                                <TemplateCard
                                    key={template.key}
                                    template={template}
                                    onActivate={(key) => router.post(route('policies.templates.store', key))}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="py-6 text-center text-sm text-slate-400">Aucun guardrail disponible pour ce secteur.</p>
                    )}
                </SectionPanel>

                {/* ── Create / edit form ── */}
                {(showForm || editingPolicy) && (
                    <SectionPanel
                        title={editingPolicy ? `Modifier : ${editingPolicy.name}` : 'Nouvelle policy personnalisée'}
                        subtitle="Configurez un guardrail sur mesure pour votre organisation"
                    >
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Nom</label>
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ex : Plafond GPT-4 plan Basic"
                                />
                                <InputError className="mt-1" message={errors.name} />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Type de protection</label>
                                <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={selectCls}>
                                    {policyTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Portée cible</label>
                                <select value={data.scope} onChange={(e) => setData('scope', e.target.value)} className={selectCls}>
                                    {policyScopes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Seuil de coût ($)</label>
                                <TextInput
                                    type="number" step="0.01"
                                    className="mt-1 block w-full"
                                    value={data.threshold}
                                    onChange={(e) => setData('threshold', e.target.value)}
                                    placeholder="Ex : 0.05"
                                />
                                <p className="mt-1 text-xs text-slate-400">Coût unitaire à partir duquel la policy s'active.</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Modèle de repli</label>
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={data.fallback_model}
                                    onChange={(e) => setData('fallback_model', e.target.value)}
                                    placeholder="gpt-4o-mini"
                                />
                                <p className="mt-1 text-xs text-slate-400">Requis pour les policies de type "Repli de modèle".</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Description interne</label>
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Pourquoi cette policy existe"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Mode d'application</label>
                                <select value={data.enforcement_mode} onChange={(e) => setData('enforcement_mode', e.target.value)} className={selectCls}>
                                    {enforcementModes.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label} — {m.description}</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-slate-500">
                                    {data.enforcement_mode === 'observe'
                                        ? 'Mode test : évalue sans appliquer d\'action. Recommandé pour démarrer.'
                                        : 'Mode production : bloque ou applique le repli sur les requêtes réelles.'}
                                </p>
                            </div>

                            <label className="flex items-center gap-2 self-end pb-1 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-400"
                                />
                                Activer immédiatement
                            </label>

                            <div className="flex items-center gap-3 pt-2 md:col-span-2">
                                <PrimaryButton disabled={processing}>
                                    {editingPolicy ? 'Enregistrer les modifications' : 'Créer cette policy'}
                                </PrimaryButton>
                                <button type="button" onClick={cancelForm} className="text-sm text-slate-500 transition hover:text-slate-700">
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </SectionPanel>
                )}

                {/* ── Policies list ── */}
                <SectionPanel
                    title="Policies configurées"
                    subtitle="Guardrails actifs et en observation sur vos flux support IA"
                    actions={
                        !showForm && !editingPolicy ? (
                            <button
                                type="button"
                                onClick={openCreate}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-400 hover:bg-violet-50/60 hover:text-violet-700"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Nouvelle policy
                            </button>
                        ) : null
                    }
                >
                    {rows.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                                <svg className="h-6 w-6 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700">Aucune policy configurée</p>
                                <p className="mt-0.5 text-sm text-slate-400">Activez un guardrail recommandé ci-dessus ou créez votre première policy.</p>
                            </div>
                            <button
                                type="button"
                                onClick={openCreate}
                                className="mt-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:-translate-y-px"
                            >
                                Créer ma première policy
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        {['Nom', 'Type', 'Portée', 'Seuil', 'Mode', 'Statut', 'Actions'].map((col) => (
                                            <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 first:pl-0">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/80">
                                    {rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className={`transition-colors duration-150 ${
                                                selectedPolicy?.id === row.id
                                                    ? 'bg-violet-50/50'
                                                    : 'hover:bg-violet-50/20'
                                            }`}
                                        >
                                            {/* Name + description */}
                                            <td className="py-4 pl-0 pr-4">
                                                <p className="font-medium text-slate-900">{row.name}</p>
                                                {row.description && (
                                                    <p className="mt-0.5 max-w-[200px] truncate text-xs text-slate-400">{row.description}</p>
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-slate-600">
                                                {TYPE_LABELS[row.type] || row.type}
                                            </td>

                                            <td className="px-4 py-4 text-slate-600">
                                                {SCOPE_LABELS[row.scope] || row.scope}
                                            </td>

                                            <td className="px-4 py-4 font-mono text-xs text-slate-600">
                                                {row.conditions?.threshold != null ? `$${row.conditions.threshold}` : '—'}
                                            </td>

                                            <td className="px-4 py-4">
                                                <ModeBadge mode={row.enforcement_mode || 'enforce'} />
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className={`text-xs font-medium ${row.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {row.is_active ? 'Active' : 'En pause'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedPolicy(selectedPolicy?.id === row.id ? null : row)}
                                                        className={`text-xs font-semibold transition ${
                                                            selectedPolicy?.id === row.id
                                                                ? 'text-violet-700'
                                                                : 'text-violet-600 hover:text-violet-800'
                                                        }`}
                                                    >
                                                        {selectedPolicy?.id === row.id ? 'Fermer' : 'Détail'}
                                                    </button>
                                                    <span className="text-slate-200">·</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(row)}
                                                        className="text-xs font-medium text-slate-500 transition hover:text-slate-800"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <span className="text-slate-200">·</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => router.patch(route('policies.toggle-mode', row.id))}
                                                        className={`text-xs font-medium transition ${
                                                            row.enforcement_mode === 'observe'
                                                                ? 'text-emerald-600 hover:text-emerald-800'
                                                                : 'text-amber-600 hover:text-amber-800'
                                                        }`}
                                                    >
                                                        {row.enforcement_mode === 'observe' ? '→ Appliquer' : '→ Observer'}
                                                    </button>
                                                    <span className="text-slate-200">·</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => router.patch(route('policies.toggle', row.id))}
                                                        className="text-xs font-medium text-slate-500 transition hover:text-slate-800"
                                                    >
                                                        {row.is_active ? 'Pause' : 'Activer'}
                                                    </button>
                                                    <span className="text-slate-200">·</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm('Supprimer cette policy ? Action irréversible.')) {
                                                                router.delete(route('policies.destroy', row.id));
                                                            }
                                                        }}
                                                        className="text-xs font-medium text-red-400 transition hover:text-red-600"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionPanel>

                {/* ── Policy detail panel ── */}
                {selectedPolicy && (
                    <PolicyDetailPanel
                        policy={selectedPolicy}
                        onClose={() => setSelectedPolicy(null)}
                        onEdit={startEdit}
                    />
                )}

                {/* ── Inter-page CTAs ── */}
                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2">
                    <Link
                        href={route('margin-impact.index')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition hover:bg-white hover:shadow-sm"
                    >
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Voir l'impact
                    </Link>
                    <Link
                        href={route('simulation.index')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition hover:bg-white hover:shadow-sm"
                    >
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Simuler avant activation
                    </Link>
                    <Link
                        href={route('margin-leaks.index')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition hover:bg-white hover:shadow-sm"
                    >
                        Voir les fuites de marge
                    </Link>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
