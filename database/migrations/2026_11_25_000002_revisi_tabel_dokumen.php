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
        // Drop check constraint lama jika ada
        DB::statement("ALTER TABLE dokumen DROP CONSTRAINT IF EXISTS chk_dokumen_status_fisik");

        // Jika tabel masih memakai skema lama (nomor_gu) dan kolom DI-302 belum ada,
        // bersihkan baris dummy lama terlebih dahulu agar penambahan kolom NOT NULL berhasil di PostgreSQL
        if (Schema::hasColumn('dokumen', 'nomor_gu') && !Schema::hasColumn('dokumen', 'nomor_di302')) {
            DB::table('log_aktivitas')->delete();
            DB::table('dokumen')->delete();
        }

        Schema::table('dokumen', function (Blueprint $table) {
            // Hapus foreign key & kolom lama jika ada
            if (Schema::hasColumn('dokumen', 'boks_id')) {
                $table->dropForeign(['boks_id']);
                $table->dropColumn('boks_id');
            }
            if (Schema::hasColumn('dokumen', 'nomor_gu')) {
                $table->dropColumn('nomor_gu');
            }
            if (Schema::hasColumn('dokumen', 'nib')) {
                $table->dropColumn('nib');
            }
            if (Schema::hasColumn('dokumen', 'jenis_dokumen')) {
                $table->dropColumn('jenis_dokumen');
            }
            if (Schema::hasColumn('dokumen', 'nama_pemilik')) {
                $table->dropColumn('nama_pemilik');
            }

            // Tambah kolom baru sesuai spesifikasi DI-302
            if (!Schema::hasColumn('dokumen', 'nomor_di302')) {
                $table->string('nomor_di302', 20)->unique();
            }
            if (!Schema::hasColumn('dokumen', 'nomor_album')) {
                $table->integer('nomor_album');
            }
            if (!Schema::hasColumn('dokumen', 'nomor_urut')) {
                $table->integer('nomor_urut');
            }
            if (!Schema::hasColumn('dokumen', 'tanggal_masuk')) {
                $table->date('tanggal_masuk');
            }
            if (!Schema::hasColumn('dokumen', 'nama_pemohon')) {
                $table->string('nama_pemohon', 100);
            }
            if (!Schema::hasColumn('dokumen', 'jenis_permohonan')) {
                $table->string('jenis_permohonan', 60);
            }
            if (!Schema::hasColumn('dokumen', 'kecamatan_id')) {
                $table->foreignId('kecamatan_id')->nullable()->constrained('kecamatan');
            }
            if (!Schema::hasColumn('dokumen', 'rak_id')) {
                $table->foreignId('rak_id')->nullable()->constrained('rak');
            }
            if (!Schema::hasColumn('dokumen', 'tingkat')) {
                $table->string('tingkat', 10)->nullable();
            }
            if (!Schema::hasColumn('dokumen', 'posisi')) {
                $table->string('posisi', 10)->nullable();
            }
            if (!Schema::hasColumn('dokumen', 'keterangan')) {
                $table->text('keterangan')->nullable();
            }
            if (!Schema::hasColumn('dokumen', 'catatan')) {
                $table->text('catatan')->nullable();
            }
            if (!Schema::hasColumn('dokumen', 'status_fisik')) {
                $table->string('status_fisik', 15)->default('TERSEDIA');
            }
            if (!Schema::hasColumn('dokumen', 'status_berkas')) {
                $table->string('status_berkas', 15)->default('TERSEDIA');
            }

            $table->unique(['nomor_album', 'nomor_urut'], 'uq_dokumen_album_urut');
        });

        DB::statement("ALTER TABLE dokumen ADD CONSTRAINT chk_dokumen_status_fisik CHECK (status_fisik IN ('TERSEDIA', 'DIPINJAM', 'RUSAK', 'HILANG'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE dokumen DROP CONSTRAINT IF EXISTS chk_dokumen_status_berkas");
        Schema::table('dokumen', function (Blueprint $table) {
            $table->dropUnique('uq_dokumen_album_urut');
            $table->dropColumn([
                'nomor_di302', 'nomor_album', 'nomor_urut', 'tanggal_masuk',
                'nama_pemohon', 'jenis_permohonan', 'kecamatan_id', 'rak_id',
                'tingkat', 'posisi', 'keterangan', 'catatan', 'status_berkas'
            ]);
        });
    }
};
