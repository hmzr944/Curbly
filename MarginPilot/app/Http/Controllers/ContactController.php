<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * GET /contact — Display the contact form.
     */
    public function create(): Response
    {
        return Inertia::render('Public/Contact');
    }

    /**
     * POST /contact — Handle the form submission.
     *
     * Validates input, logs the submission (email delivery
     * is handled separately via queue / mailgun once configured).
     */
    public function store(Request $request): RedirectResponse
    {
        // Honeypot — bot detection
        if ($request->filled('website')) {
            return back()->with('success', true);
        }

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name'  => ['required', 'string', 'max:80'],
            'email'      => ['required', 'email', 'max:255'],
            'company'    => ['nullable', 'string', 'max:120'],
            'role'       => ['nullable', 'string', 'max:80'],
            'subject'    => ['required', 'string', 'max:160'],
            'message'    => ['required', 'string', 'min:20', 'max:4000'],
            'team_size'  => ['nullable', 'string', 'max:40'],
            'ai_volume'  => ['nullable', 'string', 'max:40'],
        ]);

        // Log for now — replace with Mail::to(...)->queue(new ContactSubmitted($validated))
        // once MAIL_* env vars are configured.
        Log::channel('stack')->info('Contact form submission', [
            'from'       => $validated['email'],
            'name'       => $validated['first_name'] . ' ' . $validated['last_name'],
            'company'    => $validated['company'] ?? null,
            'subject'    => $validated['subject'],
            'team_size'  => $validated['team_size'] ?? null,
            'ai_volume'  => $validated['ai_volume'] ?? null,
        ]);

        return back()->with('success', true);
    }
}
