<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter enforcement_mode sur policies
        Schema::table('policies', function (Blueprint $table) {
            // Mode d'application de la policy :
            // - 'enforce' : bloque ou applique le fallback réellement
            // - 'observe' : évalue mais n'applique pas, log seulement
            $table->string('enforcement_mode', 20)->default('enforce')->after('is_active');
        });

        // Ajouter is_observed sur policy_triggers
        Schema::table('policy_triggers', function (Blueprint $table) {
            // Indique si ce trigger est une observation (pas d'action réelle)
            $table->boolean('is_observed')->default(false)->after('triggered_at');
        });
    }

    public function down(): void
    {
        Schema::table('policies', function (Blueprint $table) {
            $table->dropColumn('enforcement_mode');
        });

        Schema::table('policy_triggers', function (Blueprint $table) {
            $table->dropColumn('is_observed');
        });
    }
};
