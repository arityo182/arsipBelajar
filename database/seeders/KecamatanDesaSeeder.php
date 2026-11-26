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
        if (file_exists($jsonPath)) {
            $data = json_decode(file_get_contents($jsonPath), true);
            $desaMap = $data['desa_map'] ?? [];
            $kecamatans = $data['kecamatans'] ?? [];

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
}
