<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Dokumen;
use App\Models\LogAktivitas;
use App\Models\Desa;
use App\Models\Boks;
use App\Models\User;

class DokumenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $desas = Desa::all();
        $bokses = Boks::with('shaf.rak.ruang')->get();
        $users = User::all();

        if ($desas->isEmpty() || $bokses->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Pastikan Desa, Boks, dan User sudah terisi sebelum menjalankan DokumenSeeder.');
            return;
        }

        $admin = $users->firstWhere('username', 'admin') ?? $users->first();
        $petugas1 = $users->firstWhere('username', 'hendra') ?? $users->first();
        $petugas2 = $users->firstWhere('username', 'siti') ?? $users->first();

        // 20 Data Dokumen Realistis Kabupaten Banyumas
        $dokumenData = [
            // 1-15: TERSEDIA (15 dokumen)
            ['nomor_gu' => 'GU-0101/2021', 'tahun' => 2021, 'nib' => '33020101001', 'jenis' => 'Sertipikat', 'pemilik' => 'Budi Santoso',      'status' => 'TERSEDIA', 'user' => $petugas1],
            ['nomor_gu' => 'GU-0102/2021', 'tahun' => 2021, 'nib' => '33020101002', 'jenis' => 'Warkah',     'pemilik' => 'Sri Wahyuni',        'status' => 'TERSEDIA', 'user' => $petugas2],
            ['nomor_gu' => 'GU-0203/2022', 'tahun' => 2022, 'nib' => '33020202003', 'jenis' => 'GU',         'pemilik' => 'Ahmad Fauzi',        'status' => 'TERSEDIA', 'user' => $admin],
            ['nomor_gu' => 'GU-0204/2022', 'tahun' => 2022, 'nib' => '33020202004', 'jenis' => 'SU',         'pemilik' => 'Dewi Rahayu',        'status' => 'TERSEDIA', 'user' => $petugas1],
            ['nomor_gu' => 'GU-0305/2022', 'tahun' => 2022, 'nib' => '33020303005', 'jenis' => 'Sertipikat', 'pemilik' => 'Hendra Kusuma',      'status' => 'TERSEDIA', 'user' => $petugas2],
            ['nomor_gu' => 'GU-0306/2023', 'tahun' => 2023, 'nib' => '33020303006', 'jenis' => 'Warkah',     'pemilik' => 'Slamet Riyadi',      'status' => 'TERSEDIA', 'user' => $petugas1],
            ['nomor_gu' => 'GU-0407/2023', 'tahun' => 2023, 'nib' => '33020404007', 'jenis' => 'Sertipikat', 'pemilik' => 'Siti Aminah',        'status' => 'TERSEDIA', 'user' => $admin],
            ['nomor_gu' => 'GU-0408/2023', 'tahun' => 2023, 'nib' => '33020404008', 'jenis' => 'GU',         'pemilik' => 'Joko Widodo',        'status' => 'TERSEDIA', 'user' => $petugas2],
            ['nomor_gu' => 'GU-0509/2023', 'tahun' => 2023, 'nib' => '33020505009', 'jenis' => 'SU',         'pemilik' => 'Tri Maryati',        'status' => 'TERSEDIA', 'user' => $petugas1],
            ['nomor_gu' => 'GU-0510/2024', 'tahun' => 2024, 'nib' => '33020505010', 'jenis' => 'Sertipikat', 'pemilik' => 'Bambang Sugiarto',   'status' => 'TERSEDIA', 'user' => $admin],
            ['nomor_gu' => 'GU-0611/2024', 'tahun' => 2024, 'nib' => '33020102011', 'jenis' => 'Warkah',     'pemilik' => 'Endang Susilowati',  'status' => 'TERSEDIA', 'user' => $petugas2],
            ['nomor_gu' => 'GU-0612/2024', 'tahun' => 2024, 'nib' => '33020203012', 'jenis' => 'GU',         'pemilik' => 'Agus Prasetyo',      'status' => 'TERSEDIA', 'user' => $petugas1],
            ['nomor_gu' => 'GU-0713/2024', 'tahun' => 2024, 'nib' => '33020304013', 'jenis' => 'SU',         'pemilik' => 'Supriyanto',         'status' => 'TERSEDIA', 'user' => $admin],
            ['nomor_gu' => 'GU-0714/2024', 'tahun' => 2024, 'nib' => '33020405014', 'jenis' => 'Sertipikat', 'pemilik' => 'Ratna Sari',         'status' => 'TERSEDIA', 'user' => $petugas2],
            ['nomor_gu' => 'GU-0815/2024', 'tahun' => 2024, 'nib' => '33020501015', 'jenis' => 'Warkah',     'pemilik' => 'Dwi Haryanto',       'status' => 'TERSEDIA', 'user' => $petugas1],

            // 16-18: DIPINJAM (3 dokumen)
            ['nomor_gu' => 'GU-0816/2023', 'tahun' => 2023, 'nib' => '33020103016', 'jenis' => 'Sertipikat', 'pemilik' => 'Nanang Kosim',       'status' => 'DIPINJAM', 'user' => $petugas2],
            ['nomor_gu' => 'GU-0917/2023', 'tahun' => 2023, 'nib' => '33020204017', 'jenis' => 'GU',         'pemilik' => 'Wahyu Hidayat',      'status' => 'DIPINJAM', 'user' => $admin],
            ['nomor_gu' => 'GU-0918/2024', 'tahun' => 2024, 'nib' => '33020301018', 'jenis' => 'Warkah',     'pemilik' => 'Ani Wijayanti',      'status' => 'DIPINJAM', 'user' => $petugas1],

            // 19-20: RUSAK (2 dokumen)
            ['nomor_gu' => 'GU-1019/2020', 'tahun' => 2020, 'nib' => '33020402019', 'jenis' => 'Sertipikat', 'pemilik' => 'Sugeng Rawuh',       'status' => 'RUSAK',    'user' => $admin],
            ['nomor_gu' => 'GU-1020/2020', 'tahun' => 2020, 'nib' => '33020503020', 'jenis' => 'Warkah',     'pemilik' => 'Mulyono',            'status' => 'RUSAK',    'user' => $petugas2],
        ];

        foreach ($dokumenData as $index => $item) {
            $desa = $desas[$index % $desas->count()];
            $boks = $bokses[$index % $bokses->count()];
            $creator = $item['user'];

            $dokumen = Dokumen::updateOrCreate(
                ['nomor_gu' => $item['nomor_gu']],
                [
                    'tahun'         => $item['tahun'],
                    'nib'           => $item['nib'],
                    'jenis_dokumen' => $item['jenis'],
                    'nama_pemilik'  => $item['pemilik'],
                    'desa_id'       => $desa->id,
                    'boks_id'       => $boks->id,
                    'status_fisik'  => $item['status'],
                    'created_by'    => $creator->id,
                    'created_at'    => now()->subDays(60 - ($index * 2)),
                    'updated_at'    => now()->subDays(30 - ($index)),
                ]
            );

            // Log Aktivitas 1: Penambahan Dokumen
            LogAktivitas::firstOrCreate(
                [
                    'dokumen_id' => $dokumen->id,
                    'aksi'       => 'TAMBAH_DOKUMEN',
                ],
                [
                    'user_id'    => $creator->id,
                    'detail'     => "Dokumen {$dokumen->nomor_gu} atas nama {$dokumen->nama_pemilik} ditambahkan ke {$dokumen->lokasi_lengkap}",
                    'created_at' => $dokumen->created_at,
                ]
            );

            // Log Aktivitas 2: Mutasi atau Pemindahan
            if ($index % 2 === 0) {
                $boksTujuan = $bokses[($index + 2) % $bokses->count()];
                $shafTujuan = $boksTujuan->shaf;
                $rakTujuan = $shafTujuan ? $shafTujuan->rak : null;
                $ruangTujuan = $rakTujuan ? $rakTujuan->ruang : null;
                $lokasiBaruStr = "Ruang " . ($ruangTujuan->nama ?? '-') . " → Rak " . ($rakTujuan->kode ?? '-') . " → Shaf " . ($shafTujuan->kode ?? '-') . " → Boks " . ($boksTujuan->nomor ?? '-');

                LogAktivitas::firstOrCreate(
                    [
                        'dokumen_id' => $dokumen->id,
                        'aksi'       => 'PINDAH_RAK',
                    ],
                    [
                        'user_id'    => $admin->id,
                        'detail'     => "Dipindah dari {$dokumen->lokasi_lengkap} ke {$lokasiBaruStr}. Alasan: Penyesuaian zonasi warkah berkala",
                        'created_at' => $dokumen->created_at->addDays(5),
                    ]
                );
            }

            // Log Aktivitas 3: Update Status Fisik (untuk Dipinjam / Rusak)
            if ($item['status'] === 'DIPINJAM') {
                LogAktivitas::firstOrCreate(
                    [
                        'dokumen_id' => $dokumen->id,
                        'aksi'       => 'UPDATE_STATUS',
                    ],
                    [
                        'user_id'    => $creator->id,
                        'detail'     => "Status diubah dari TERSEDIA ke DIPINJAM. Keterangan: Dipinjam oleh Seksi Survei dan Pemetaan untuk validasi batas bidang tanah",
                        'created_at' => $dokumen->created_at->addDays(10),
                    ]
                );
            } elseif ($item['status'] === 'RUSAK') {
                LogAktivitas::firstOrCreate(
                    [
                        'dokumen_id' => $dokumen->id,
                        'aksi'       => 'UPDATE_STATUS',
                    ],
                    [
                        'user_id'    => $creator->id,
                        'detail'     => "Status diubah dari TERSEDIA ke RUSAK. Keterangan: Lembar warkah robek pada sisi lipatan peta, perlu proses laminasi dan perbaikan fisik",
                        'created_at' => $dokumen->created_at->addDays(12),
                    ]
                );
            }
        }
    }
}
