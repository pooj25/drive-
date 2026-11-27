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
        Schema::create('images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('original_filename');
            $table->string('stored_filename');
            $table->string('thumbnail_filename')->nullable();
            $table->string('file_path');
            $table->string('thumbnail_path')->nullable();
            $table->string('disk')->default('local'); // 'local', 'public', or 'r2'
            $table->string('mime_type')->default('image/jpeg');
            $table->unsignedBigInteger('original_size');    // in bytes
            $table->unsignedBigInteger('compressed_size');  // in bytes
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->decimal('compression_ratio', 5, 2)->default(0); // e.g. 64.50% saved
            $table->string('public_url')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('images');
    }
};
