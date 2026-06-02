<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('policy_triggers', function (Blueprint $table) {
            // Used in ClientsController GROUP BY customer_id, policy_id
            $table->index(['organization_id', 'customer_id']);
            // Used in MarginImpactController + PolicyController aggregations
            $table->index(['organization_id', 'policy_id']);
        });
    }

    public function down(): void
    {
        Schema::table('policy_triggers', function (Blueprint $table) {
            $table->dropIndex(['organization_id', 'customer_id']);
            $table->dropIndex(['organization_id', 'policy_id']);
        });
    }
};
