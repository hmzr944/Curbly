<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Stripe customer ID from the org's own Stripe account
            $table->string('stripe_customer_id')->nullable()->after('external_id');
            // Monthly revenue pulled from Stripe invoices
            $table->decimal('monthly_revenue', 12, 4)->nullable()->after('stripe_customer_id');
            // Customer email (for Stripe matching)
            $table->string('email')->nullable()->after('monthly_revenue');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['stripe_customer_id', 'monthly_revenue', 'email']);
        });
    }
};
