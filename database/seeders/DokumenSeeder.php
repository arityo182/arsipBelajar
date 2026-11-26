<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Dokumen;
use App\Models\Desa;
use App\Models\Kecamatan;
use App\Models\Rak;
use App\Models\Album;
use App\Models\User;

class DokumenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        $userId = $user ? $user->id : 1;

        $rakE = Rak::where('kode', 'E')->first();
        $rakId = $rakE ? $rakE->id : 1;

        $desas = Desa::with('kecamatan')->get()->keyBy('nama');
        $kecamatans = Kecamatan::all()->keyBy('nama');

        $jsonPath = database_path('seeders/data/di302_data.json');
        if (!file_exists($jsonPath)) {
            $this->command?->warn("File data {$jsonPath} tidak ditemukan. Melewati seeding dokumen DI-302.");
            return;
        }

        $jsonData = json_decode(file_get_contents($jsonPath), true);
        $records = $jsonData['records'] ?? [];

        foreach ($records as $item) {
            $desa = $desas->get($item['desa']);
            $kecamatan = $desa ? $desa->kecamatan : $kecamatans->get($item['kecamatan']);

            Dokumen::updateOrCreate(
                ['nomor_di302' => (string) $item['nomor_di302']],
                [
                    'nomor_album'      => (int) $item['nomor_album'],
                    'nomor_urut'       => (int) $item['nomor_urut'],
                    'tanggal_masuk'    => $item['tanggal_masuk'],
                    'tahun'            => (int) $item['tahun'],
                    'nama_pemohon'     => $item['nama_pemohon'],
                    'jenis_permohonan' => $item['jenis_permohonan'],
                    'desa_id'          => $desa ? $desa->id : null,
                    'kecamatan_id'     => $kecamatan ? $kecamatan->id : null,
                    'rak_id'           => $rakId,
                    'tingkat'          => $item['tingkat'] ?? '1',
                    'posisi'           => $item['posisi'] ?? null,
                    'keterangan'       => $item['keterangan'] ?? null,
                    'catatan'          => $item['catatan'] ?? null,
                    'status_fisik'     => $item['status_fisik'] ?? 'TERSEDIA',
                    'status_berkas'    => $item['status_berkas'] ?? ($item['status_fisik'] ?? 'TERSEDIA'),
                    'created_by'       => $userId,
                ]
            );
        }
    }
}
