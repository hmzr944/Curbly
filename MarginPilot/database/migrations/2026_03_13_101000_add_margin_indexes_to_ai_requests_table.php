<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_requests', function (Blueprint $table) {
            $table->index(['organization_id', 'feature_id']);
            $table->index(['organization_id', 'customer_id']);
            $table->index(['organization_id', 'plan_id']);
        });
    }

    public function down(): void
    {
        Schema::table('ai_requests', function (Blueprint $table) {
            $table->dropIndex(['organization_id', 'feature_id']);
            $table->dropIndex(['organization_id', 'customer_id']);
            $table->dropIndex(['organization_id', 'plan_id']);
        });
    }
};
