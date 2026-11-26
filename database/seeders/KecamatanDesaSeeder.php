<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kecamatan;
use App\Models\Desa;

class KecamatanDesaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('seeders/data/di302_data.json');
        if (!file_exists($jsonPath)) {
            $this->command?->warn("File data {$jsonPath} tidak ditemukan. Melewati seeding kecamatan & desa.");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);
        $desaMap = $data['desa_map'] ?? [];
        $kecamatans = $data['kecamatans'] ?? [];

        // Ekstrak otomatis dari records apabila kunci kecamatans/desa_map tidak tersedia
        if (empty($kecamatans) || empty($desaMap)) {
            foreach ($data['records'] ?? [] as $item) {
                $kec = trim((string) ($item['kecamatan'] ?? ''));
                $des = trim((string) ($item['desa'] ?? ''));
                if ($kec !== '' && !in_array($kec, $kecamatans, true)) {
                    $kecamatans[] = $kec;
                }
                if ($des !== '' && $kec !== '') {
                    $desaMap[$des] = $kec;
                }
            }
        }

        foreach ($kecamatans as $kecamatanNama) {
            Kecamatan::firstOrCreate(['nama' => $kecamatanNama]);
        }

        foreach ($desaMap as $desaNama => $kecamatanNama) {
            $kecamatan = Kecamatan::where('nama', $kecamatanNama)->first();
            if ($kecamatan) {
                Desa::firstOrCreate([
                    'kecamatan_id' => $kecamatan->id,
                    'nama'         => $desaNama,
                ]);
            }
        }
    }
}
