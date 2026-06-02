<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('policy_triggers', function (Blueprint $table) {
            $table->uuid('attempt_uuid')->nullable()->after('id');
            $table->index('attempt_uuid');
        });

        Schema::table('ai_requests', function (Blueprint $table) {
            $table->string('enforcement_action', 30)->nullable()->after('policy_trigger_reason');
            $table->string('enforcement_reason')->nullable()->after('enforcement_action');
        });
    }

    public function down(): void
    {
        Schema::table('policy_triggers', function (Blueprint $table) {
            $table->dropIndex(['attempt_uuid']);
            $table->dropColumn('attempt_uuid');
        });

        Schema::table('ai_requests', function (Blueprint $table) {
            $table->dropColumn(['enforcement_action', 'enforcement_reason']);
        });
    }
};
