<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            // Stripe API key for THIS org's customer base (encrypted AES-256)
            // NOT the Stripe key for Margexa's own billing
            $table->text('stripe_api_key_encrypted')->nullable()->after('plan');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn('stripe_api_key_encrypted');
        });
    }
};
