<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('tier')->default('low');
            $table->decimal('monthly_price', 10, 2)->nullable();
            $table->decimal('monthly_ai_budget', 12, 2)->nullable();
            $table->boolean('allow_premium_models')->default(false);
            $table->string('fallback_model')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
