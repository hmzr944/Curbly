<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('policy_triggers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('policy_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ai_request_id')->nullable()->constrained('ai_requests')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('feature_id')->nullable()->constrained()->nullOnDelete();
            $table->string('target_label')->nullable();
            $table->string('reason');
            $table->decimal('impacted_cost', 12, 6)->default(0);
            $table->decimal('estimated_cost_avoided', 12, 6)->default(0);
            $table->timestamp('triggered_at')->useCurrent();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'triggered_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('policy_triggers');
    }
};
