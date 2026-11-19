<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dokumen', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_gu', 30)->unique();
            $table->integer('tahun');
            $table->string('nib', 20);
            $table->string('jenis_dokumen', 50);
            $table->string('nama_pemilik', 100);
            $table->foreignId('desa_id')->constrained('desa');
            $table->foreignId('boks_id')->constrained('boks');
            $table->string('status_fisik', 10)->default('TERSEDIA');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });

        // Check constraint untuk status_fisik di PostgreSQL
        DB::statement("ALTER TABLE dokumen ADD CONSTRAINT chk_dokumen_status_fisik CHECK (status_fisik IN ('TERSEDIA', 'DIPINJAM', 'RUSAK', 'HILANG'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokumen');
    }
};
