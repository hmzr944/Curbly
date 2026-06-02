<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add Stripe billing fields to organizations.
 * 
 * Supports:
 * - One-shot payments (AI Margin Scan)
 * - Recurring subscriptions (Observe, Control, Scale)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            // Stripe customer
            $table->string('stripe_customer_id')->nullable()->after('slug');
            
            // Subscription
            $table->string('stripe_subscription_id')->nullable()->after('stripe_customer_id');
            $table->string('stripe_price_id')->nullable()->after('stripe_subscription_id');
            $table->string('subscription_status')->nullable()->after('stripe_price_id'); // active, past_due, canceled, trialing
            $table->timestamp('subscription_ends_at')->nullable()->after('subscription_status');
            $table->timestamp('trial_ends_at')->nullable()->after('subscription_ends_at');
            
            // Plan & Entitlements
            $table->string('plan')->default('free')->after('trial_ends_at'); // free, scan, observe, control, scale
            $table->json('entitlements')->nullable()->after('plan');
            
            // One-shot purchases
            $table->boolean('has_purchased_scan')->default(false)->after('entitlements');
            $table->timestamp('scan_purchased_at')->nullable()->after('has_purchased_scan');
            
            // Billing info
            $table->string('billing_email')->nullable()->after('scan_purchased_at');
            $table->json('billing_address')->nullable()->after('billing_email');
            
            // Indexes
            $table->index('stripe_customer_id');
            $table->index('subscription_status');
            $table->index('plan');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropIndex(['stripe_customer_id']);
            $table->dropIndex(['subscription_status']);
            $table->dropIndex(['plan']);
            
            $table->dropColumn([
                'stripe_customer_id',
                'stripe_subscription_id',
                'stripe_price_id',
                'subscription_status',
                'subscription_ends_at',
                'trial_ends_at',
                'plan',
                'entitlements',
                'has_purchased_scan',
                'scan_purchased_at',
                'billing_email',
                'billing_address',
            ]);
        });
    }
};
