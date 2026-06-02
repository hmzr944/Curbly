<?php

use App\Http\Controllers\AppController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PolicyController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;




// Page d'accueil publique — Margexa landing
Route::get('/', fn () => Inertia::render('Public/Home'))->name('home');

// ─── Public Audit Flow — commercial entry point ────────────────────────────
// GET /audit → form | POST /audit → process + redirect | GET /audit/{token} → result
Route::get('/audit', [AuditController::class, 'create'])->name('audit.index');
Route::post('/audit', [AuditController::class, 'store'])->name('audit.store');
Route::get('/audit/{token}', [AuditController::class, 'show'])->name('audit.show');

// ─── Public pages ──────────────────────────────────────────────────────────
Route::get('/pricing', PricingController::class)->name('pricing');
Route::get('/docs',    fn () => Inertia::render('Public/Docs'))->name('docs');

// Contact form
Route::get('/contact',  [ContactController::class, 'create'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

// ─── Legal pages ───────────────────────────────────────────────────────────
Route::prefix('legal')->name('legal.')->group(function () {
    Route::get('/mentions-legales',  fn () => Inertia::render('Public/Legal/MentionsLegales'))->name('mentions-legales');
    Route::get('/cgu',               fn () => Inertia::render('Public/Legal/CGU'))->name('cgu');
    Route::get('/cgv',               fn () => Inertia::render('Public/Legal/CGV'))->name('cgv');
    Route::get('/confidentialite',   fn () => Inertia::render('Public/Legal/Confidentialite'))->name('confidentialite');
});

// ─── Margexa SPA — served as a custom blade view ──────────────────────────
// All /app/* routes load the Margexa shell (margexa-app.blade.php).
// The React app handles internal routing (dashboard, policies, analytics…).
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/app', [AppController::class, 'index'])->name('app.index');
    Route::get('/app/{any}', [AppController::class, 'index'])->where('any', '.*')->name('app.any');
});

// Stripe webhook (conservé si facturation Stripe active)
Route::post('/stripe/webhook', [BillingController::class, 'webhook'])->name('stripe.webhook');


// Authenticated routes (facturation uniquement)
Route::middleware('auth')->group(function () {
    // Billing (auth required, no email verification)
    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::post('/billing/checkout', [BillingController::class, 'createCheckoutSession'])->name('billing.checkout');
    Route::post('/billing/scan-checkout', [BillingController::class, 'createScanCheckout'])->name('billing.scan-checkout');
    Route::post('/billing/portal', [BillingController::class, 'createPortalSession'])->name('billing.portal');
    Route::get('/billing/success', [BillingController::class, 'success'])->name('billing.success');
    Route::get('/billing/scan-success', [BillingController::class, 'scanSuccess'])->name('billing.scan-success');
    Route::get('/billing/cancel', [BillingController::class, 'cancel'])->name('billing.cancel');
});

// Profile management (Breeze standard — GET/PATCH/DELETE /profile)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Authenticated + Verified routes (email verification required)
Route::middleware(['auth', 'verified'])->group(function () {
    // ── Legacy routes — redirect to the Margexa SPA ──────────────────────
    // These Inertia pages have been replaced by the /app SPA.
    Route::redirect('/dashboard',    '/app', 301)->name('dashboard');
    Route::redirect('/margin-leaks', '/app', 301)->name('margin-leaks.index');
    Route::redirect('/margin-impact','/app', 301)->name('margin-impact.index');
    Route::redirect('/simulation',   '/app', 301)->name('simulation.index');
    Route::redirect('/clients',      '/app', 301)->name('clients.index');
    Route::redirect('/plans',        '/app', 301)->name('plans.index');
    Route::redirect('/ai-requests',  '/app', 301)->name('ai-requests.index');
    Route::redirect('/audit-ia',     '/app', 301)->name('audit-ia.index');

    // ── Settings (still served as Inertia for now) ────────────────────────
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings', [SettingsController::class, 'update'])->name('settings.update');

    // Policies (guardrails) — requires the 'policies' entitlement (control+ plans)
    Route::middleware('entitlement:policies')->group(function () {
        Route::get('/policies', [PolicyController::class, 'index'])->name('policies.index');
        Route::post('/policies', [PolicyController::class, 'store'])->name('policies.store');
        Route::post('/policies/templates/{key}', [PolicyController::class, 'storeTemplate'])->name('policies.templates.store');
        Route::patch('/policies/{policy}/toggle', [PolicyController::class, 'toggle'])->name('policies.toggle');
        Route::patch('/policies/{policy}/toggle-mode', [PolicyController::class, 'toggleMode'])->name('policies.toggle-mode');
        Route::put('/policies/{policy}', [PolicyController::class, 'update'])->name('policies.update');
        Route::delete('/policies/{policy}', [PolicyController::class, 'destroy'])->name('policies.destroy');
    });
});

require __DIR__.'/auth.php';
