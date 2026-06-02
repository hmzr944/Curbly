<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add attribution tracking fields to ai_requests table.
 * 
 * This enables:
 * - Tracking attribution quality per request
 * - Measuring % correctly tagged requests (KPI)
 * - Debugging attribution issues
 * - FinOps-grade cost allocation accuracy
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_requests', function (Blueprint $table) {
            // Attribution status: full, partial, none, failed
            $table->string('attribution_status', 20)->default('none')->after('enforcement_reason');
            
            // Attribution quality score (0-100)
            $table->tinyInteger('attribution_score')->unsigned()->default(0)->after('attribution_status');
            
            // JSON array of attribution issues encountered
            $table->json('attribution_issues')->nullable()->after('attribution_score');
            
            // Index for metrics queries
            $table->index(['organization_id', 'attribution_status', 'created_at']);
            $table->index(['organization_id', 'attribution_score', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('ai_requests', function (Blueprint $table) {
            $table->dropIndex(['organization_id', 'attribution_status', 'created_at']);
            $table->dropIndex(['organization_id', 'attribution_score', 'created_at']);
            $table->dropColumn(['attribution_status', 'attribution_score', 'attribution_issues']);
        });
    }
};
