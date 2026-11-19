<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ruang;
use App\Models\Rak;
use App\Models\Shaf;
use App\Models\Boks;

class LokasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $strukturRuang = [
            [
                'nama'      => 'Ruang Arsip A',
                'kode'      => 'RA-A',
                'deskripsi' => 'Ruang penyimpanan dokumen tahun 2020-2024',
                'raks'      => ['RA-A-01', 'RA-A-02', 'RA-A-03', 'RA-A-04'],
            ],
            [
                'nama'      => 'Ruang Arsip B',
                'kode'      => 'RA-B',
                'deskripsi' => 'Ruang penyimpanan dokumen tahun 2015-2019',
                'raks'      => ['RA-B-01', 'RA-B-02', 'RA-B-03', 'RA-B-04'],
            ],
        ];

        $daftarShaf = ['SH-01', 'SH-02', 'SH-03'];
        $daftarBoks = ['001', '002', '003', '004', '005'];

        foreach ($strukturRuang as $dataRuang) {
            $ruang = Ruang::firstOrCreate(
                ['kode' => $dataRuang['kode']],
                [
                    'nama'      => $dataRuang['nama'],
                    'deskripsi' => $dataRuang['deskripsi'],
                ]
            );

            foreach ($dataRuang['raks'] as $kodeRak) {
                $rak = Rak::firstOrCreate(
                    ['kode' => $kodeRak],
                    ['ruang_id' => $ruang->id]
                );

                foreach ($daftarShaf as $kodeShaf) {
                    $shaf = Shaf::firstOrCreate(
                        [
                            'rak_id' => $rak->id,
                            'kode'   => $kodeShaf,
                        ]
                    );

                    foreach ($daftarBoks as $nomorBoks) {
                        Boks::firstOrCreate(
                            [
                                'shaf_id' => $shaf->id,
                                'nomor'   => $nomorBoks,
                            ],
                            [
                                'kapasitas' => 50,
                            ]
                        );
                    }
                }
            }
        }
    }
}
