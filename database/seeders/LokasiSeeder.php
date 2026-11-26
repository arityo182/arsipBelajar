<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ruang;
use App\Models\Rak;
use App\Models\Shaf;
use App\Models\Album;

class LokasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ruang = Ruang::firstOrCreate(
            ['kode' => 'RA-DI302'],
            [
                'nama'      => 'Ruang Arsip DI-302',
                'deskripsi' => 'Ruang penyimpanan fisik Album Register DI-302 Kantah Banyumas',
            ]
        );

        // 1. Rak Bagian Kanan (Rak E)
        $rakE = Rak::firstOrCreate(
            ['kode' => 'E'],
            ['ruang_id' => $ruang->id]
        );

        // 2. Rak Bagian Kiri
        $rakKiri = Rak::firstOrCreate(
            ['kode' => 'KIRI'],
            ['ruang_id' => $ruang->id]
        );

        // Tingkatan pada Rak E (Tingkat 1 - 4)
        foreach (['1', '2', '3', '4'] as $t) {
            Shaf::firstOrCreate(
                ['rak_id' => $rakE->id, 'kode' => $t]
            );
        }

        // Tingkatan pada Rak Kiri (Tingkat 1 - 2)
        foreach (['1', '2'] as $t) {
            Shaf::firstOrCreate(
                ['rak_id' => $rakKiri->id, 'kode' => $t]
            );
        }

        // Album 1 s/d 4 di Rak E berada di Tingkat 1 (Sesuai denah: Tingkat 1 memuat Album 1 s.d. 16)
        $albums = [
            ['nomor_album' => 1, 'rak_id' => $rakE->id, 'tingkat' => '1', 'posisi' => null, 'kapasitas' => 30],
            ['nomor_album' => 2, 'rak_id' => $rakE->id, 'tingkat' => '1', 'posisi' => null, 'kapasitas' => 30],
            ['nomor_album' => 3, 'rak_id' => $rakE->id, 'tingkat' => '1', 'posisi' => null, 'kapasitas' => 30],
            ['nomor_album' => 4, 'rak_id' => $rakE->id, 'tingkat' => '1', 'posisi' => null, 'kapasitas' => 30],
        ];

        foreach ($albums as $alb) {
            Album::firstOrCreate(
                [
                    'nomor_album' => $alb['nomor_album'],
                    'rak_id'      => $alb['rak_id'],
                ],
                [
                    'tingkat'     => $alb['tingkat'],
                    'posisi'      => $alb['posisi'],
                    'kapasitas'   => $alb['kapasitas'],
                ]
            );
        }
    }
}
