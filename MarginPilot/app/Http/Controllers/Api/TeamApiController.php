<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InvitationMail;
use App\Models\Invitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class TeamApiController extends Controller
{
    /** Avatar gradient palette — deterministic per member index */
    private const AVATAR_COLORS = [
        'linear-gradient(135deg, #5B5BD6, #8B5CF6)',
        'linear-gradient(135deg, #0E9F6E, #5B5BD6)',
        'linear-gradient(135deg, #B97A0B, #8B5CF6)',
        'linear-gradient(135deg, #D946EF, #5B5BD6)',
        'linear-gradient(135deg, #0E9F6E, #B97A0B)',
        'linear-gradient(135deg, #5B5BD6, #0E9F6E)',
    ];

    /**
     * GET /api/team/members
     * Returns the list of users in the current organization.
     */
    public function members(): JsonResponse
    {
        $organization = Auth::user()?->organization;

        if (! $organization) {
            return response()->json([]);
        }

        $members = $organization->users()
            ->select(['id', 'name', 'email', 'is_admin', 'updated_at'])
            ->get()
            ->values()
            ->map(function ($user, int $idx) use ($organization) {
                $role = ($user->id === $organization->user_id ?? null)
                    ? 'Owner'
                    : ($user->is_admin ? 'Admin' : 'Member');

                return [
                    'id'     => $user->id,
                    'name'   => $user->name,
                    'email'  => $user->email,
                    'role'   => $role,
                    'teams'  => [],   // no teams model yet — placeholder
                    'last'   => $user->updated_at?->diffForHumans() ?? '—',
                    'mfa'    => false, // MFA not implemented yet
                    'c'      => self::AVATAR_COLORS[$idx % count(self::AVATAR_COLORS)],
                ];
            });

        return response()->json($members);
    }

    /**
     * GET /api/team/invites
     * Returns all pending invitations for the current organization.
     */
    public function invites(): JsonResponse
    {
        $organization = Auth::user()?->organization;

        if (! $organization) {
            return response()->json([]);
        }

        $invites = Invitation::query()
            ->where('organization_id', $organization->id)
            ->pending()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($inv) => [
                'id'         => $inv->id,
                'email'      => $inv->email,
                'role'       => ucfirst($inv->role),
                'sent'       => $inv->created_at->diffForHumans(),
                'expires_at' => $inv->expires_at?->toISOString(),
            ]);

        return response()->json($invites);
    }

    /**
     * POST /api/team/invite
     * Create (or refresh) an invitation, then queue the invitation email.
     *
     * Mail is best-effort: a missing MAIL_* config will be caught and logged
     * so the HTTP response always succeeds (invitation is stored regardless).
     */
    public function invite(Request $request): JsonResponse
    {
        $organization = Auth::user()?->organization;

        if (! $organization) {
            return response()->json(['error' => 'No organization found.'], 403);
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'role'  => ['sometimes', 'string', 'in:member,admin,developer,viewer,billing'],
        ]);

        // Upsert: if a pending invite already exists for this email, renew it.
        $invitation = Invitation::query()
            ->where('organization_id', $organization->id)
            ->where('email', $validated['email'])
            ->whereNull('accepted_at')
            ->first();

        $token = Str::random(48);

        if ($invitation) {
            $invitation->update([
                'role'            => $validated['role'] ?? 'member',
                'token'           => $token,
                'invited_by_name' => Auth::user()->name,
                'expires_at'      => now()->addDays(7),
            ]);
        } else {
            $invitation = Invitation::query()->create([
                'organization_id' => $organization->id,
                'email'           => $validated['email'],
                'role'            => $validated['role'] ?? 'member',
                'token'           => $token,
                'invited_by_name' => Auth::user()->name,
                'expires_at'      => now()->addDays(7),
            ]);
        }

        // Queue the invitation email — wrapped in try/catch so a missing
        // MAIL_* config does not break the response.
        try {
            Mail::to($invitation->email)->queue(
                new InvitationMail(
                    invitation:       $invitation,
                    inviterName:      Auth::user()->name,
                    organizationName: $organization->name,
                )
            );
        } catch (\Throwable $e) {
            Log::warning('InvitationMail could not be queued', [
                'email' => $invitation->email,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success'    => true,
            'invitation' => [
                'id'    => $invitation->id,
                'email' => $invitation->email,
                'role'  => ucfirst($invitation->role),
                'sent'  => $invitation->created_at->diffForHumans(),
            ],
        ], 201);
    }

    /**
     * PATCH /api/team/invites/{id}
     * Renew the token + expiry and resend the invitation email.
     */
    public function resendInvite(int $id): JsonResponse
    {
        $organization = Auth::user()?->organization;

        if (! $organization) {
            return response()->json(['error' => 'No organization found.'], 403);
        }

        $invitation = Invitation::query()
            ->where('organization_id', $organization->id)
            ->where('id', $id)
            ->whereNull('accepted_at')
            ->firstOrFail();

        $invitation->update([
            'token'      => Str::random(48),
            'expires_at' => now()->addDays(7),
        ]);

        // Resend — best-effort, same try/catch as invite()
        try {
            Mail::to($invitation->email)->queue(
                new InvitationMail(
                    invitation:       $invitation,
                    inviterName:      $invitation->invited_by_name ?? Auth::user()->name,
                    organizationName: $organization->name,
                )
            );
        } catch (\Throwable $e) {
            Log::warning('InvitationMail resend could not be queued', [
                'email' => $invitation->email,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json(['success' => true, 'resent' => true]);
    }

    /**
     * DELETE /api/team/invites/{id}
     * Cancel / revoke a pending invitation.
     */
    public function cancelInvite(int $id): JsonResponse
    {
        $organization = Auth::user()?->organization;

        if (! $organization) {
            return response()->json(['error' => 'No organization found.'], 403);
        }

        $invitation = Invitation::query()
            ->where('organization_id', $organization->id)
            ->where('id', $id)
            ->whereNull('accepted_at')
            ->firstOrFail();

        $invitation->delete();

        return response()->json(['success' => true, 'deleted' => true]);
    }
}
