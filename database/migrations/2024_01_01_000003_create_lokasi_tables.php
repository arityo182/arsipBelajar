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
        // 1. Ruang
        Schema::create('ruang', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100);
            $table->string('kode', 20)->unique();
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });

        // 2. Rak
        Schema::create('rak', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ruang_id')->constrained('ruang')->onDelete('cascade');
            $table->string('kode', 20)->unique();
            $table->timestamps();
        });

        // 3. Shaf
        Schema::create('shaf', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rak_id')->constrained('rak')->onDelete('cascade');
            $table->string('kode', 20);
            $table->timestamps();

            $table->unique(['rak_id', 'kode'], 'uq_shaf_rak_kode');
        });

        // 4. Boks
        Schema::create('boks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shaf_id')->constrained('shaf')->onDelete('cascade');
            $table->string('nomor', 10);
            $table->integer('kapasitas')->default(50);
            $table->timestamps();

            $table->unique(['shaf_id', 'nomor'], 'uq_boks_shaf_nomor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boks');
        Schema::dropIfExists('shaf');
        Schema::dropIfExists('rak');
        Schema::dropIfExists('ruang');
    }
};
