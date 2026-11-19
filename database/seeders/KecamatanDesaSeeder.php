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
        $wilayah = [
            'Purwokerto Utara' => [
                'Purwanegara',
                'Bancarkembar',
                'Bobosan',
                'Grendeng',
                'Sumampir',
            ],
            'Purwokerto Selatan' => [
                'Teluk',
                'Tanjung',
                'Karangklesem',
                'Berkoh',
                'Purwokerto Kidul',
            ],
            'Purwokerto Timur' => [
                'Arcawinangun',
                'Purwokerto Lor',
                'Purwokerto Wetan',
                'Sokanegara',
            ],
            'Sokaraja' => [
                'Sokaraja Lor',
                'Sokaraja Kidul',
                'Wiradadi',
                'Kalikidang',
                'Jompo',
            ],
            'Banyumas' => [
                'Banyumas',
                'Pasinggangan',
                'Sudagaran',
                'Kejawar',
                'Papringan',
            ],
        ];

        foreach ($wilayah as $kecamatanNama => $daftarDesa) {
            $kecamatan = Kecamatan::firstOrCreate(['nama' => $kecamatanNama]);

            foreach ($daftarDesa as $desaNama) {
                Desa::firstOrCreate([
                    'kecamatan_id' => $kecamatan->id,
                    'nama'         => $desaNama,
                ]);
            }
        }
    }
}
