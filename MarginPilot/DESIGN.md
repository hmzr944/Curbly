# Margexa — Design System

> References: Linear, Vercel Dashboard, Anthropic Console.
> Philosophie: densité d'information élevée, espace négatif calculé, typographie comme architecture.

---

## Tokens (tokens.css — NE PAS MODIFIER)

### Typographie

| Variable | Fonte | Usage |
|---|---|---|
| `--font-sans` | Inter | Corps de texte, labels, UI générique |
| `--font-display` | Instrument Serif italic | KPIs heroes, grands chiffres, h1/h2 landing |
| `--font-mono` | Geist Mono | Données numériques, code, eyebrows, timestamps |

**Règle des 3 fontes:**
- `--font-display` uniquement pour les moments d'impact (KPIs 36px+, h1, h2)
- `--font-mono` uniquement pour les données (jamais pour les titres)
- Ne jamais mélanger les 3 sur la même ligne

**Classes utilitaires:**
```
.h1           → font-display, clamp(48px → 92px), letter-spacing -0.025em
.h2           → font-display, clamp(36px → 64px), letter-spacing -0.02em
.h-display    → font-display italic, letter-spacing -0.02em
.mono         → font-mono, letter-spacing 0
.tnum         → tabular-nums (pour tous les chiffres)
.eyebrow      → font-mono, 11px, uppercase, letter-spacing 0.12em, --ink-4
.serif        → font-display italic (alias)
.body-lg      → 17px, line-height 1.55, --ink-3
```

### Palette

```
Fond page:      --bg        #FAFAF8   warm white
Cartes:         --surface   #FFFFFF
Surface hover:  --surface-2 #F5F4F1
Surface deep:   --surface-3 #EFEEEA

Texte:          --ink       #0E0E10   encre principale
                --ink-2     #2A2A2E   secondaire
                --ink-3     #5C5C66   tertiaire
                --ink-4     #8E8E99   muted
                --ink-5     #B8B8C0   placeholder

Bordures:       --line      #ECEBE6   hairline
                --line-2    #E1DFD9   visible
                --line-3    #C9C7BF   divider fort

Accent:         --accent    #5B5BD6   indigo-violet premium
                --accent-hover   #4949C8
                --accent-tint    #EEEEFF
                --accent-soft    #C7C5F3

Sémantique:     --success   #0E9F6E   vert
                --warning   #B97A0B   ambre
                --danger    #C8341B   rouge
```

**Règle couleur:**
- L'accent `#5B5BD6` est réservé à : l'élément primaire actionnable de chaque vue, les graphiques en position 1, les états actifs de navigation
- Jamais plus de 2 couleurs accent simultanément visibles
- Les couleurs sémantiques (success/warning/danger) = états de données uniquement, jamais décoration

### Radii

```
--r-sm:   6px    inputs, tags
--r-md:   8px    boutons (défaut)
--r-lg:   10px   cartes, panels
--r-xl:   14px   modals, overlays
--r-pill: 999px  badges, pills
```
Maximum 14px. Jamais de `border-radius > 14px` sur les éléments d'interface.

### Ombres

```
--sh-1    micro (cartes au repos)
--sh-2    légère (cartes hover)
--sh-3    medium (modals)
--sh-pop  popup (menus, tooltips)
```
Uniquement `--sh-1` et `--sh-2` dans l'interface courante. Jamais de box-shadow lourde.

### Spacing

Base 4px. Variables `--s-1` (4px) → `--s-12` (160px).

| Contexte | Valeur recommandée |
|---|---|
| Padding interne carte | 18-24px (`--s-6`) |
| Gap entre sections majeures | 48px minimum (`--s-9`) |
| Row hauteur minimale (tables) | 44px |
| Padding page | `24px 28px` |

### Motion

```
--ease:      cubic-bezier(.22,.61,.36,1)    transitions UI
--ease-out:  cubic-bezier(.16,1,.3,1)       reveals, entrées
```
Durées : 150ms micro, 250ms transitions, 400ms reveals.

---

## Composants disponibles (components.jsx — NE PAS MODIFIER)

```jsx
<Button variant="primary|secondary|ghost|accent" size="sm|md|lg" icon={...} iconRight={...}>
<Badge tone="accent|success|warning|danger|outline" dot>
<Spotlight>                    // carte avec glow au hover
<SectionHead title sub action>
<PulseDot color size>
<CountUp to duration decimals>
<Spark data width height color fill>
```

### Composants layout (fx.jsx — NE PAS MODIFIER)

```jsx
<Stagger gap={50}>            // animation entrée séquentielle
<Reveal delay={100}>          // fade-up au scroll
<Magnetic strength={0.25}>    // hover magnétique (landing only)
<AnimatedMesh palette>        // fond mesh animé (landing hero)
<GridSpot>                    // spotlight grille (landing hero)
<Container max={1200}>        // wrapper max-width centré
<Card padding hover>          // carte générique landing
<Eyebrow>                     // label section uppercase
<Mark size>                   // logo Margexa SVG
```

---

## Hiérarchie typographique — Règle des 3 niveaux

Chaque écran doit avoir exactement 3 niveaux de lecture:

```
1. HERO (Instrument Serif italic)
   → KPI principal, h1 landing, titre de page
   → fontSize: 36-92px, fontStyle: italic, letterSpacing: -0.04em

2. LABEL (Geist Mono)
   → Eyebrow au-dessus du KPI, catégorie, timestamp
   → fontSize: 10-11px, uppercase, letterSpacing: 0.08em, color: --ink-4

3. DONNÉES (Geist Mono + .tnum)
   → Valeurs précises, tokens, latence, coûts unitaires
   → fontSize: 11-13px, fontVariantNumeric: tabular-nums
```

**Contraste asymétrique cible :** 10px mono label + 38px Instrument Serif + 11px mono données = sophistication sans couleur.

---

## Patterns UI

### KPI Strip (pages app)

```jsx
// Bande horizontale avec dividers — jamais des cards séparées
<div style={{
  display: 'flex', background: 'var(--surface)',
  border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden',
}}>
  {metrics.map((m, i) => (
    <div style={{
      flex: 1, padding: '22px 24px',
      borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
    }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 14 }}>
        {m.label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 38, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>
        {m.value}
      </div>
      <div className="mono" style={{ fontSize: 11, color: m.delta < 0 ? 'var(--success)' : 'var(--danger)', marginTop: 10 }}>
        {m.delta > 0 ? '+' : ''}{m.delta}% vs prev period
      </div>
    </div>
  ))}
</div>
```

### Provider / Liste de ressources

```
Ne JAMAIS utiliser des cards Spotlight pour lister des providers ou entités.
Utiliser une liste avec colonnes fixes:
- dot status (7px, couleur sémantique)
- nom (Inter 500 13px)
- region (Geist Mono 11px, --ink-4)
- métriques (Geist Mono tnum, textAlign right)
- sparkline (60px)
Hauteur row: 52px minimum. Séparateur: 1px solid var(--line).
```

### IF/THEN règles

```
Header:   nom de la règle seul (pas de "Rule #N")
IF row:   background: var(--accent-tint), "IF" en var(--accent) bold
THEN row: background: transparent, "THEN" en var(--success) bold
Hover:    border-color passe à var(--line-3), background var(--surface-2)
```

### Tooltip graphique

```jsx
// Fond surface clair, pas noir
{
  background: 'var(--surface)',
  border: '1px solid var(--line-2)',
  borderRadius: 8,
  boxShadow: 'var(--sh-2)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
}
```

### Empty state

```jsx
// Pas d'emoji. Toujours: icône SVG + titre 13px + description 12px
<div style={{ padding: '32px 0', textAlign: 'center' }}>
  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
    <svg>...</svg>
  </div>
  <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>Titre clair</div>
  <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>Ce qu'il faut faire.</div>
</div>
```

---

## Structure des pages app

### En-tête de page (pattern commun)

```jsx
<div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
  <div>
    <div className="mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>
      {/* Contexte court — ex: "Governance engine" */}
    </div>
    <h1 style={{
      fontFamily: 'var(--font-display)', fontStyle: 'italic',
      fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.04em',
      lineHeight: 1, margin: 0, color: 'var(--ink)',
    }}>
      {/* Nom de la page */}
    </h1>
    <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 10 }}>
      {/* Sous-titre court */}
    </div>
  </div>
  <div style={{ display: 'flex', gap: 8 }}>
    {/* Actions: Button secondary + Button primary */}
  </div>
</div>
```

### Contexte eyebrow par page

| Page | Eyebrow mono |
|---|---|
| Dashboard | `{orgName} · AI Control Plane` |
| Analytics | `Cost intelligence` |
| AI Gateway | `Routing engine` |
| Policies | `Governance engine` |
| Leak detection | `Anomaly engine` |
| Prompts | `Prompt intelligence` |
| Team | `Access control` |
| Billing | `Subscription` |

---

## Landing page

### Structure des sections

```
1. Nav         (sticky, glassmorphism au scroll)
2. Hero        (announcement pill + h1 + subtext + CTAs) ← max 4 éléments
3. HeroPreview (mini-dashboard authentique, pas de fake divs)
4. Trust strip  (hors hero — "No credit card" "SOC 2" "5-minute setup")
5. Pain/Problem (eyebrow "The problem" autorisé — eyebrow 1)
6. HowItWorks   (pas d'eyebrow)
7. Platform     (eyebrow "The platform" — eyebrow 2)
8. Architecture (pas d'eyebrow)
9. ROI          (pas d'eyebrow)
10. Pricing     (pas d'eyebrow)
11. FAQ         (pas d'eyebrow)
12. CTA/Footer
```

**Règle eyebrows landing:** max `ceil(sections / 3)` = 4 pour 10 sections. Actuellement: 2 actifs.

### Hero — contraintes strictes

- Max **4 éléments** dans le stack textuel: pill OU brand strip / h1 / subtext / CTAs
- Le trust strip (`No credit card · SOC 2...`) va **sous** la HeroPreview, pas dedans
- Subtext: **max 20 mots**, 3-4 lignes max
- Headline: **max 2 lignes** desktop
- Padding top max **160px**

---

## Anti-patterns — Ce qui est interdit

### Typography
- Instrument Serif pour le corps de texte → Jamais
- Geist Mono pour les titres → Jamais
- 3 fontes mélangées sur la même ligne → Jamais
- Em-dash `—` ou en-dash `–` dans le texte visible → **0 tolérance**

### Layout
- 3 cards égales en colonnes (`repeat(3, 1fr)`) → Bannies
- `h1` en Inter 24px générique → Bannir, utiliser Instrument Serif
- Cards Spotlight pour lister des providers/membres → Utiliser une liste
- `Rule #1`, `Rule #2` dans les policies → Supprimer le numéro
- Eyebrow sur chaque section → max 1 par tranche de 3 sections

### Contenu
- Emoji (🎉 📡 🚀) → SVG icons uniquement
- "by Margexa" dans les footers de composants → Supprimer
- Numéros de section dans les eyebrows (`01 · How it works`) → Interdit
- Labels numériques dans les bento cards (`n='01'`) → Supprimer
- Numéros de pagination sur les tiles (`01 / 4`) → Interdit
- Fake-precise numbers non sourcés → Interdit
- Noms génériques ("Acme Corp") dans les démos → Contextualiser

### Ombres & bordures
- `box-shadow: 0 4px 20px rgba(0,0,0,0.3)` → trop lourde, utiliser `var(--sh-2)`
- `border-radius > 14px` → hors tokens, interdit
- `border-top` + `border-bottom` sur chaque row d'une liste → choisir un seul côté

### Couleurs
- Gradient sur les surfaces app → Landing uniquement
- Plus de 2 couleurs accent simultanées → Interdit
- Couleurs sémantiques comme décoration → Réservées aux états de données

---

## Babel UMD — Contraintes techniques

Les fichiers `resources/js/Margexa/*.jsx` utilisent Babel Standalone (UMD). Pas d'import/export.

```jsx
// En-tête obligatoire de chaque fichier
const { useState, useEffect, useRef } = React;

// Enregistrement global obligatoire en fin de fichier
Object.assign(window, { NomDePage });
```

**Packages disponibles uniquement:**
- `React` (global via CDN)
- Composants de `components.jsx` (global: `Button`, `Badge`, `Spotlight`, `SectionHead`, `CountUp`, `Spark`, `PulseDot`)
- Animations de `fx.jsx` (global: `Reveal`, `Stagger`, `Magnetic`, `AnimatedMesh`, `GridSpot`, `Container`, `Card`, `Eyebrow`, `Mark`)

**Pas de GSAP, Framer Motion, npm packages.** Animations via CSS keyframes et `useEffect` vanilla.

**Sync après chaque modification:**
```bash
node scripts/copy-margexa.js
```
Cette commande copie `resources/js/Margexa/` → `public/js/margexa/`.

**Cache navigateur:** En dev, le blade injecte `?v=timestamp` sur chaque fichier JSX pour forcer le rechargement.

---

## Checklist avant chaque PR

- [ ] Aucun emoji dans le code visible
- [ ] Aucun em-dash `—` dans le texte visible
- [ ] KPI principaux en Instrument Serif italic (pas en Inter bold)
- [ ] Labels/eyebrows en Geist Mono uppercase (pas en Inter)
- [ ] Valeurs numériques avec classe `.tnum` (tabular nums)
- [ ] Empty states avec icône SVG (pas d'emoji)
- [ ] `node scripts/copy-margexa.js` exécuté
- [ ] `php artisan test` — 114/114 passing
