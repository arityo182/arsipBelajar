# Struktur Folder Proyek SIPLOK
## Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
Peta arsitektur monorepo terpadu: Backend Laravel 13, Frontend Next.js 16, Lingkungan Kontainer Docker, dan Dokumentasi Teknis.

---

```text
siplok/                                      ← Direktori utama (root) repositori monorepo SIPLOK
├── docker-compose.yml                       ← Konfigurasi orkestrasi kontainer (pgsql, backend, frontend, pgadmin)
├── Makefile                                 ← Kumpulan shortcut perintah CLI (setup, up, fresh, migrate, logs)
├── README.md                                ← Ringkasan instruksi cepat, katalog port, dan troubleshooting ringkas
├── artisan                                  ← Skrip command line CLI Laravel (eksekusi migrasi & artisan commands)
├── composer.json                            ← Konfigurasi dependensi backend PHP (Laravel, JWT Auth, Sail)
├── package.json                             ← Konfigurasi dependensi frontend (Next.js 16, React 18, Zustand, Zod)
├── tsconfig.json                            ← Konfigurasi kompilasi TypeScript strict mode dan path alias @/*
├── tailwind.config.ts                       ← Konfigurasi tema warna resmi ATR/BPN (#003580, #FFD700) & tipografi
├── middleware.ts                            ← Next.js Edge Runtime Route Protection (proteksi route /admin & /login)
├── .env.example                             ← Template variabel lingkungan backend lokal
├── .env.docker.example                      ← Template variabel lingkungan kontainer Docker multi-service
├── .env.local.example                       ← Template variabel lingkungan frontend Next.js (URL API backend)
├── .gitignore                               ← Daftar pengecualian pelacakan Git (vendor, node_modules, cache)
│
├── scripts/                                 ← Kumpulan skrip otomasi sistem dan pemulihan
│   ├── check-and-install.sh                 ← Skrip instalasi otomatis dependensi Ubuntu 22.04 LTS
│   └── init.sql                             ← Cadangan DDL & DML SQL murni PostgreSQL 16 (alternatif seeder)
│
├── docker/                                  ← Konfigurasi spesifik citra dan lingkungan Docker
│   ├── backend/                             ← Lingkungan runtime backend
│   │   ├── Dockerfile                       ← Image Alpine Linux PHP 8.3-FPM + ekstensi pdo_pgsql & zip
│   │   ├── nginx.conf                       ← Konfigurasi Nginx reverse proxy internal ke PHP-FPM:9000
│   │   └── entrypoint.sh                    ← Skrip startup kontainer backend (wait database + auto-migrate)
│   └── frontend/                            ← Lingkungan runtime frontend
│       └── Dockerfile                       ← Multi-stage build Node 20 Alpine untuk standalone Next.js
│
├── config/                                  ← Konfigurasi modul Laravel
│   └── auth.php                             ← Konfigurasi guard API berbasis JWT (tymon/jwt-auth)
│
├── bootstrap/                               ← Titik masuk inisialisasi aplikasi Laravel
│   └── app.php                              ← Registrasi middleware alias (auth.jwt, role) dan exception JSON
│
├── routes/                                  ← Rute antarmuka sistem
│   ├── api.php                              ← Pemetaan 20 rute endpoint RESTful API ber-prefix /api
│   └── console.php                          ← Definisi perintah CLI artisan internal
│
├── database/                                ← Migrasi skema dan pembenihan data awal basis data
│   ├── migrations/                          ← Berkas migrasi skema tabel PostgreSQL 16
│   │   ├── 2024_01_01_000001_create_users_table.php          ← Migrasi tabel users (role ADMIN/USER)
│   │   ├── 2024_01_01_000002_create_wilayah_tables.php        ← Migrasi tabel kecamatan dan desa
│   │   ├── 2024_01_01_000003_create_lokasi_tables.php         ← Migrasi tabel ruang, rak, shaf, dan boks
│   │   ├── 2024_01_01_000004_create_dokumen_table.php        ← Migrasi tabel dokumen warkah (SoftDeletes)
│   │   └── 2024_01_01_000005_create_log_aktivitas_table.php   ← Migrasi tabel riwayat mutasi log aktivitas
│   └── seeders/                             ← Pembenihan data dummy realistis Kabupaten Banyumas
│       ├── DatabaseSeeder.php               ← Master seeder pemanggil seluruh sub-seeder
│       ├── UserSeeder.php                   ← Seeder akun staf (admin, hendra, siti)
│       ├── KecamatanDesaSeeder.php          ← Seeder 5 kecamatan & 24 desa riil Banyumas
│       ├── LokasiSeeder.php                 ← Seeder 2 Ruang, 8 Rak, 24 Shaf, dan 120 Boks
│       └── DokumenSeeder.php                ← Seeder 20 warkah (NIB 3302..., 15 Tersedia, 3 Dipinjam, 2 Rusak)
│
├── app/                                     ← Logika inti backend Laravel
│   ├── Models/                              ← Model representasi entitas basis data (Eloquent ORM)
│   │   ├── User.php                         ← Model User implementasi JWTSubject
│   │   ├── Dokumen.php                      ← Model Dokumen dengan accessor lokasi_lengkap & SoftDeletes
│   │   ├── LogAktivitas.php                 ← Model pencatat aksi audit mutasi berkas
│   │   ├── Ruang.php                        ← Model Ruang penyimpanan berkas
│   │   ├── Rak.php                          ← Model Lemari Rak arsip
│   │   ├── Shaf.php                         ← Model Shaf / ambalan rak
│   │   ├── Boks.php                         ← Model Boks arsip (accessor terisi & sisa kapasitas)
│   │   ├── Kecamatan.php                    ← Model wilayah Kecamatan Banyumas
│   │   └── Desa.php                         ← Model wilayah Desa / Kelurahan
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php               ← Base abstract controller Laravel
│   │   │   └── Api/                         ← Controller penangan permintaan API RESTful
│   │   │       ├── AuthController.php       ← Logika login, logout, dan ambil profil me
│   │   │       ├── DokumenController.php    ← Logika pencarian, simpan, cek GU, dan mutasi pindah rak
│   │   │       ├── LokasiController.php     ← Logika katalog ruang, rak, shaf, dan kapasitas boks
│   │   │       ├── WilayahController.php    ← Logika katalog kecamatan dan desa Banyumas
│   │   │       └── AdminController.php      ← Logika kelola staf, anti-self deactivation, dan audit log
│   │   ├── Middleware/                      ← Lapisan keamanan HTTP
│   │   │   ├── JwtMiddleware.php            ← Validasi Bearer JWT token & status aktif user
│   │   │   └── RoleMiddleware.php           ← Otorisasi peran pengguna (role ADMIN / USER)
│   │   ├── Requests/                        ← Validasi formulir HTTP FormRequest
│   │   │   ├── StoreDokumenRequest.php      ← Validasi pendaftaran dokumen warkah baru
│   │   │   ├── PindahRakRequest.php         ← Validasi alasan dan boks tujuan baru
│   │   │   ├── UpdateStatusRequest.php      ← Validasi pembaruan kondisi status fisik dokumen
│   │   │   └── StoreUserRequest.php         ← Validasi penambahan staf baru oleh administrator
│   │   └── Resources/                       ← Transformasi respons JSON terstandar
│   │       ├── DokumenResource.php          ← Resource daftar dokumen terpaginasi + lokasi_lengkap
│   │       └── DokumenDetailResource.php    ← Resource detail komprehensif + 20 riwayat log aktivitas
│
├── src/                                     ← Kode sumber antarmuka frontend Next.js 16 (App Router)
│   ├── types/
│   │   └── index.ts                         ← Kontrak antarmuka TypeScript lengkap (User, Dokumen, Lokasi, API)
│   ├── lib/                                 ← Pustaka utilitas dan konfigurasi klien
│   │   ├── api.ts                           ← Klien HTTP Axios dengan interceptor Bearer JWT & penanganan 401/422
│   │   ├── validations.ts                   ← Skema validasi Zod (login, dokumen, pindah rak, user)
│   │   └── utils.ts                         ← Helper fungsi (cn Tailwind, formatDate WIB, print generator)
│   ├── store/
│   │   └── authStore.ts                     ← State management otentikasi Zustand (sessionStorage + cookie)
│   ├── hooks/                               ← Custom React Hooks
│   │   ├── useDebounce.ts                   ← Hook generic debouncing input pencarian real-time
│   │   ├── useDokumen.ts                    ← Hook fetching data dokumen terpaginasi dengan AbortController
│   │   └── useCascadingLokasi.ts            ← Hook dropdown bertingkat (Ruang → Rak → Shaf → Boks)
│   ├── components/                          ← Komponen antarmuka pengguna
│   │   ├── ui/                              ← Komponen UI atomik dasar
│   │   │   ├── Badge.tsx                    ← Badge status fisik dan peran pengguna
│   │   │   ├── Pagination.tsx               ← Kontrol navigasi halaman pintar (ellipsis)
│   │   │   ├── Skeleton.tsx                 ← Animasi loading shimmer baris, tabel, kartu, formulir
│   │   │   ├── EmptyState.tsx               ← Tampilan informatif saat data kosong / tidak ditemukan
│   │   │   ├── LoadingSpinner.tsx           ← SVG animasi putar tiga variasi ukuran
│   │   │   └── ConfirmModal.tsx             ← Dialog konfirmasi aksi penting dengan tombol ESC listener
│   │   ├── layout/                          ← Komponen tata letak struktur halaman
│   │   │   ├── Sidebar.tsx                  ← Navigasi samping biru tua #002147 dengan logo ATR/BPN
│   │   │   └── Header.tsx                   ← Navigasi atas biru #003580 dengan jam digital live WIB
│   │   ├── form/                            ← Komponen penginputan formulir
│   │   │   ├── CascadingLokasiSelect.tsx    ← Dropdown 2x2 bertingkat dengan indikator kapasitas boks
│   │   │   └── PinLokasiCheckbox.tsx        ← Toggle kunci lokasi di sessionStorage untuk input massal
│   │   └── dokumen/                         ← Komponen khusus ranah warkah pertanahan
│   │       ├── LokasiDisplay.tsx            ← Visualisasi breadcrumb vertikal lokasi fisik + tombol salin
│   │       ├── DokumenTable.tsx             ← Tabel berkas warkah dengan badge dan tombol aksi
│   │       ├── DokumenDetailModal.tsx       ← Drawer samping kanan (480px) detail objek & riwayat mutasi
│   │       ├── PindahRakModal.tsx           ← Dialog modal pemindahan boks dengan counter karakter alasan
│   │       └── PrintLabel.tsx               ← Template cetak kartu kendali fisik (@media print)
│   └── app/                                 ← Struktur rute Next.js App Router
│       ├── layout.tsx                       ← Root layout (Google Fonts Plus Jakarta Sans/Inter, Toaster)
│       ├── globals.css                      ← Variabel CSS, aturan tipografi, dan gaya cetak
│       ├── ClientInitializer.tsx            ← Komponen inisialisasi sesi Zustand pada saat mount
│       ├── page.tsx                         ← Landing page resmi ATR/BPN dengan lambang Garuda Pancasila
│       ├── login/
│       │   └── page.tsx                     ← Halaman login pengguna terpusat dengan ikon ATR/BPN
│       ├── dashboard/
│       │   ├── layout.tsx                   ← Layout operasional dengan integrasi Sidebar dan Header
│       │   └── page.tsx                     ← Dashboard pencarian real-time + 4 kartu metrik statistik
│       ├── dokumen/tambah/
│       │   └── page.tsx                     ← Formulir tambah warkah 2 kolom (data berkas + lokasi fisik)
│       └── admin/
│           ├── layout.tsx                   ← Route guard khusus verifikasi peran ADMINISTRATOR
│           ├── users/page.tsx               ← Panel kelola akun staf & fitur reset kata sandi acak
│           ├── logs/page.tsx                ← Panel audit trail log aktivitas dengan filter mutasi
│           └── lokasi/page.tsx              ← Panel inventarisasi sarana fisik (Ruang, Rak, Shaf, Boks)
│
├── siplok-api.postman_collection.json       ← Koleksi Postman v2.1.0 (20 Endpoint REST API siap pakai)
│
└── docs/                                    ← Dokumentasi teknis & operasional komprehensif
    ├── SRS.md                               ← Software Requirements Specification (FR-01 s.d. FR-16 & NF)
    ├── ERD.md                               ← Entity Relationship Diagram 9 entitas PostgreSQL 16 & indeks
    ├── FLOWCHART.md                         ← 6 Diagram alir logika sistem format Mermaid
    ├── API.md                               ← Spesifikasi lengkap 20 endpoint REST API & contoh cURL
    ├── SETUP.md                             ← Panduan instalasi dan deployment Ubuntu 22.04 LTS
    ├── USER_MANUAL.md                       ← Panduan operasional Petugas & Administrator + 10 FAQ
    └── STRUKTUR_FOLDER.md                   ← Peta arsitektur direktori proyek ini
```
