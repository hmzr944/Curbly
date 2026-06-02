<?php

namespace App\Http\Controllers;

use App\Support\MargeXaCatalog;
use Inertia\Inertia;
use Inertia\Response;

class PricingController extends Controller
{
    /**
     * GET /pricing
     * Renders the public Pricing page with the offer catalog injected as props.
     */
    public function __invoke(): Response
    {
        return Inertia::render('Public/Pricing', [
            'catalog' => [
                'public_offers' => MargeXaCatalog::publicOffers(),
                'public_ctas'   => MargeXaCatalog::publicCtas(),
            ],
        ]);
    }
}
