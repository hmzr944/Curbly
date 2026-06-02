<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\User;
use App\Support\MargeXaCatalog;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    /**
     * Display the Margexa registration view (replaces Inertia Auth/Register).
     */
    public function create(): \Illuminate\View\View
    {
        return view('margexa-auth', [
            'authView' => 'register',
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'offer' => ['nullable', 'string', Rule::in(MargeXaCatalog::selfServeOfferIds())],
            'plan' => ['nullable', 'string'],
            'product' => ['nullable', 'string'],
        ]);

        // Create organization for this user
        $companyName = $this->extractCompanyName($request->email, $request->name);
        $org = Organization::create([
            'name' => $companyName,
            'slug' => Str::slug($companyName) . '-' . Str::random(6),
            'plan' => 'free',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'organization_id' => $org->id,
        ]);

        event(new Registered($user));

        Auth::login($user);

        $offer = MargeXaCatalog::resolveOffer(
            $request->input('offer'),
            $request->input('plan'),
            $request->input('product'),
        );

        if ($offer && in_array($offer, MargeXaCatalog::selfServeOfferIds(), true)) {
            return redirect()->route('billing.index')->with('checkout_offer', $offer);
        }

        // Default: go to Margexa SPA (onboarding is in-app)
        return redirect(route('app.index', absolute: false));
    }

    /**
     * Extract company name from email domain or user name.
     */
    private function extractCompanyName(string $email, string $name): string
    {
        // Try to extract from email domain
        $domain = explode('@', $email)[1] ?? '';
        $domainParts = explode('.', $domain);
        
        // Skip common free email providers
        $freeProviders = ['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'mail', 'protonmail', 'live'];
        
        if (count($domainParts) > 1 && !in_array(strtolower($domainParts[0]), $freeProviders)) {
            return ucfirst($domainParts[0]);
        }
        
        // Fallback to "Entreprise de [name]"
        $firstName = explode(' ', $name)[0] ?? $name;
        return "Organisation de {$firstName}";
    }
}
