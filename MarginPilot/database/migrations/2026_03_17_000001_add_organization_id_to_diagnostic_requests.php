<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lie les diagnostic_requests à une organisation.
 *
 * La soumission du formulaire public est sans auth, donc organization_id
 * est null à la création. Il est renseigné lazily lorsque l'utilisateur
 * dont l'email correspond se connecte et visite Audit IA.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diagnostic_requests', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->after('id')
                ->constrained('organizations')
                ->nullOnDelete();

            $table->index('organization_id');
        });
    }

    public function down(): void
    {
        Schema::table('diagnostic_requests', function (Blueprint $table) {
            $table->dropForeign(['organization_id']);
            $table->dropColumn('organization_id');
        });
    }
};
