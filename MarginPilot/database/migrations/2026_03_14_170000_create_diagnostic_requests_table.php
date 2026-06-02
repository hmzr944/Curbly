<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create diagnostic_requests table for lead capture and audit requests.
 * 
 * This table stores:
 * - Public diagnostic form submissions (lead generation)
 * - Audit request details for scoring
 * - Generated mini-audit reports
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diagnostic_requests', function (Blueprint $table) {
            $table->id();
            
            // Lead information
            $table->string('email');
            $table->string('company_name');
            $table->string('contact_name')->nullable();
            $table->string('phone')->nullable();
            
            // Business context
            $table->string('provider'); // openai, anthropic, both
            $table->string('primary_model');
            $table->string('volume_tier'); // <10k, 10k-50k, 50k-100k, 100k+
            $table->string('use_case');
            $table->string('pricing_model'); // flat, usage, hybrid
            $table->json('plans'); // ['basic', 'pro', 'enterprise']
            
            // Optional context
            $table->decimal('current_monthly_spend', 12, 2)->nullable();
            $table->integer('customer_count')->nullable();
            $table->string('industry')->nullable();
            
            // Scoring results
            $table->integer('risk_score')->nullable(); // 0-100
            $table->string('risk_level')->nullable(); // low, moderate, high, critical
            $table->json('risk_breakdown')->nullable();
            
            // Generated audit
            $table->json('audit_report')->nullable();
            $table->json('policy_recommendations')->nullable();
            $table->decimal('estimated_monthly_cost', 12, 2)->nullable();
            $table->decimal('estimated_waste', 12, 2)->nullable();
            $table->decimal('potential_savings', 12, 2)->nullable();
            
            // Lead tracking
            $table->string('status')->default('new'); // new, contacted, qualified, converted, lost
            $table->string('source')->default('public_diagnostic');
            $table->string('utm_source')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_medium')->nullable();
            
            // Follow-up
            $table->boolean('requested_full_audit')->default(false);
            $table->boolean('requested_demo')->default(false);
            $table->timestamp('contacted_at')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('email');
            $table->index('status');
            $table->index(['created_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diagnostic_requests');
    }
};
