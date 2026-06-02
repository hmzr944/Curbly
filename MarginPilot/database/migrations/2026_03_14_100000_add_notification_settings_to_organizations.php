<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            // notification_settings stocke les préférences de notification
            // Structure attendue:
            // {
            //     "policy_triggers": {
            //         "email_enabled": true,
            //         "email_recipients": ["admin@company.com"],
            //         "notify_on_blocked": true,
            //         "notify_on_fallback": true,
            //         "notify_on_observed": false
            //     }
            // }
            $table->json('notification_settings')->nullable()->after('settings');
            
            // Timestamp du dernier email envoyé pour anti-spam
            $table->timestamp('last_policy_notification_at')->nullable()->after('notification_settings');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn(['notification_settings', 'last_policy_notification_at']);
        });
    }
};
