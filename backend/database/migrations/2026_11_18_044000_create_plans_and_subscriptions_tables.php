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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price_monthly_usd', 8, 2)->default(0);
            $table->decimal('price_yearly_usd', 8, 2)->default(0);
            $table->decimal('price_monthly_inr', 8, 2)->default(0);
            $table->decimal('price_yearly_inr', 8, 2)->default(0);
            $table->integer('storage_limit_mb')->default(100); // Storage quota in MB
            $table->integer('max_file_size_mb')->default(5);   // Max single upload size in MB
            $table->boolean('allow_r2')->default(false);        // Access to Cloudflare R2 cloud sync
            $table->json('features')->nullable();              // Bullet list of features
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->string('gateway')->default('free'); // 'stripe', 'razorpay', 'free'
            $table->string('gateway_subscription_id')->nullable();
            $table->string('gateway_order_id')->nullable();
            $table->string('gateway_payment_id')->nullable();
            $table->enum('billing_cycle', ['monthly', 'yearly', 'lifetime'])->default('monthly');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();
            $table->enum('status', ['active', 'cancelled', 'expired'])->default('active');
            $table->decimal('amount', 8, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->timestamps();
        });

        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->string('gateway'); // 'stripe' or 'razorpay'
            $table->string('transaction_id');
            $table->decimal('amount', 8, 2);
            $table->string('currency', 3);
            $table->string('status'); // 'succeeded', 'failed', 'pending'
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
    }
};
