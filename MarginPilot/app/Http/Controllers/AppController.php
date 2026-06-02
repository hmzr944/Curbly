<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

class AppController extends Controller
{
    /**
     * Serve the Margexa SPA shell.
     * Auth check is handled by the 'auth' middleware on the route.
     */
    public function index(Request $request): View
    {
        $user         = auth()->user();
        $organization = $user?->organization;

        return view('margexa-app', compact('organization'));
    }
}
