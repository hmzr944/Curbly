<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create routing_rules table for economic router configuration.
 * 
 * Routing rules allow organizations to customize model routing behavior:
 * - By plan: "Starter plan gets standard tier max"
 * - By feature: "Code review feature requires premium"
 * - By customer: "VIP customers get flagship access"
 * - By segment: "Enterprise segment allows all tiers"
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routing_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();

            // Rule identification
            $table->string('name', 100);
            $table->text('description')->nullable();

            // Scope: what does this rule apply to?
            // global, plan, feature, customer, segment
            $table->string('scope', 20)->default('global');
            $table->unsignedBigInteger('scope_id')->nullable(); // ID if scope is plan/feature/customer

            // Target tier for this rule
            // economy, standard, premium, flagship
            $table->string('target_tier', 20);

            // Action: what to do when rule matches
            // allow (grant this tier), restrict (limit to this tier), upgrade, downgrade
            $table->string('action', 20)->default('restrict');

            // Priority for rule ordering (higher = evaluated first)
            $table->unsignedSmallInteger('priority')->default(100);

            // Conditions for rule matching (JSON)
            // Examples:
            // {"segment": ["enterprise", "pro"]}
            // {"model_pattern": "/gpt-4.*/"}
            // {"workflow_id": "critical-pipeline"}
            // {"time_window": {"start": "09:00", "end": "18:00"}}
            // {"min_cost": 0.01}
            $table->json('conditions')->nullable();

            // Metadata for auditing/description
            $table->json('metadata')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['organization_id', 'is_active', 'priority']);
            $table->index(['organization_id', 'scope', 'scope_id']);
        });

        // Add routing-related columns to plans table
        Schema::table('plans', function (Blueprint $table) {
            // Maximum model tier this plan allows
            // Replaces/supplements the allow_premium_models boolean
            $table->string('max_model_tier', 20)->default('standard')->after('fallback_model');
        });

        // Add routing config to features table
        Schema::table('features', function (Blueprint $table) {
            // Optional: minimum tier required for this feature
            $table->string('min_model_tier', 20)->nullable()->after('active');
            // Optional: routing configuration JSON
            $table->json('routing_config')->nullable()->after('min_model_tier');
        });
    }

    public function down(): void
    {
        Schema::table('features', function (Blueprint $table) {
            $table->dropColumn(['min_model_tier', 'routing_config']);
        });

        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('max_model_tier');
        });

        Schema::dropIfExists('routing_rules');
    }
};
