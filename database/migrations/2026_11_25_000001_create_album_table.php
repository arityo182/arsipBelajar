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
        Schema::create('album', function (Blueprint $table) {
            $table->id();
            $table->integer('nomor_album');
            $table->foreignId('rak_id')->constrained('rak')->onDelete('cascade');
            $table->string('tingkat', 10)->nullable();
            $table->string('posisi', 10)->nullable();
            $table->integer('kapasitas')->default(30);
            $table->timestamps();

            $table->unique(['nomor_album', 'rak_id'], 'uq_album_nomor_rak');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('album');
    }
};
