<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('diagnostic_requests', function (Blueprint $table) {
            $table->string('access_token', 64)->nullable()->unique()->after('id');
            $table->index('access_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diagnostic_requests', function (Blueprint $table) {
            $table->dropIndex(['access_token']);
            $table->dropColumn('access_token');
        });
    }
};
