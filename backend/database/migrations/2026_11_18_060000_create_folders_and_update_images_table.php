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
        Schema::create('folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->foreignId('parent_id')->nullable()->constrained('folders')->cascadeOnDelete();
            $table->string('color')->nullable()->default('#94a3b8');
            $table->timestamps();
        });

        Schema::table('images', function (Blueprint $table) {
            $table->foreignId('folder_id')->nullable()->after('user_id')->constrained('folders')->nullOnDelete();
            $table->boolean('is_starred')->default(false)->after('thumbnail_url');
            $table->boolean('is_trashed')->default(false)->after('is_starred');
            $table->timestamp('trashed_at')->nullable()->after('is_trashed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->dropForeign(['folder_id']);
            $table->dropColumn(['folder_id', 'is_starred', 'is_trashed', 'trashed_at']);
        });

        Schema::dropIfExists('folders');
    }
};
