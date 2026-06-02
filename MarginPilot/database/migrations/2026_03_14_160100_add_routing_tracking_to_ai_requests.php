<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add routing tracking columns to ai_requests table.
 * 
 * Tracks economic routing decisions:
 * - routing_outcome: allowed, downgraded, blocked, escalated
 * - routing_tier: the tier the request was routed to
 * - routing_savings: estimated cost savings from downgrade
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_requests', function (Blueprint $table) {
            // Routing decision outcome
            $table->string('routing_outcome', 20)->nullable()->after('attribution_issues');
            
            // Tier the request was routed to
            $table->string('routing_tier', 20)->nullable()->after('routing_outcome');
            
            // Estimated savings from downgrade
            $table->decimal('routing_savings', 12, 6)->default(0)->after('routing_tier');

            // Index for routing analytics
            $table->index(['organization_id', 'routing_outcome', 'created_at']);
            $table->index(['organization_id', 'routing_tier', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('ai_requests', function (Blueprint $table) {
            $table->dropIndex(['organization_id', 'routing_outcome', 'created_at']);
            $table->dropIndex(['organization_id', 'routing_tier', 'created_at']);
            $table->dropColumn(['routing_outcome', 'routing_tier', 'routing_savings']);
        });
    }
};
