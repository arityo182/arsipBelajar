# ================================================================
# SIPLOK — KREDENSIAL, AKUN & REFERENSI DATA SISTEM
# Kantor Pertanahan Kabupaten Banyumas — Kementerian ATR/BPN
# ================================================================

Dokumen ini memuat seluruh informasi akses, kredensial akun pengguna, konfigurasi layanan, data master wilayah & lokasi fisik, serta daftar lengkap 20 data dokumen pertanahan realistis yang tersedia di dalam sistem SIPLOK.

---

## 🌐 1. Tautan & Port Akses Layanan

| Layanan | URL Akses (Lokal) | URL Akses (VPS Production) | Keterangan |
| :--- | :--- | :--- | :--- |
| **Frontend SIPLOK** | [http://localhost:3000](http://localhost:3000) | [https://arsip.arityodev.my.id](https://arsip.arityodev.my.id) | Landing page & portal resmi BPN |
| **Pencarian Publik** | [http://localhost:3000/cek-dokumen](http://localhost:3000/cek-dokumen) | [https://arsip.arityodev.my.id/cek-dokumen](https://arsip.arityodev.my.id/cek-dokumen) | Pengecekan status warkah/GU tanpa login |
| **Login Petugas/Admin** | [http://localhost:3000/login](http://localhost:3000/login) | [https://arsip.arityodev.my.id/login](https://arsip.arityodev.my.id/login) | Pintu masuk operasional dinas |
| **Backend REST API** | [http://localhost:8000/api](http://localhost:8000/api) | [https://arsip.arityodev.my.id/api](https://arsip.arityodev.my.id/api) | Endpoint REST API (Laravel 13) |
| **Nginx Host Proxy** | — | Port 80/443 (Certbot SSL ECDSA) | Reverse proxy ke port 3002 (FE) & 8002 (BE) |
| **pgAdmin 4 GUI** | [http://localhost:5050](http://localhost:5050) | — (Dinonaktifkan di VPS demi efisiensi RAM) | Manajemen basis data PostgreSQL via Web |
| **PostgreSQL Database** | `localhost:5434` / `5432` | Internal Docker Network (`siplok-network`) | Database engine PostgreSQL 16 Alpine |

---

## 👤 2. Kredensial Akun Pengguna Aplikasi

Semua akun ini telah terdaftar melalui database seeder dan siap digunakan langsung:

| Role | Nama Pengguna | Username | Password | Hak Akses & Wewenang |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Administrator SIPLOK | `admin` | `admin123` | • Akses Dashboard & semua menu<br>• Manajemen Pengguna (Tambah, Nonaktifkan, Reset Password)<br>• Manajemen Ruang, Rak, Shaf, Boks<br>• Audit Log Jejak Aktivitas Lengkap |
| **USER (Petugas)** | Petugas Arsip Hendra | `hendra` | `petugas123` | • Pencarian & Filter Dokumen<br>• Input Warkah/GU Baru<br>• Mutasi / Pemindahan Lokasi Rak<br>• Pembaruan Status Fisik Dokumen<br>• Cetak Label Barcode Dokumen |
| **USER (Petugas)** | Petugas Arsip Siti | `siti` | `petugas123` | • Akses operasional loket dan ruang arsip dinas |

---

## 🗄️ 3. Kredensial Database & Infrastruktur Docker

### A. PostgreSQL 16
* **Host:** `localhost` (dari host) / `pgsql` (antar container)
* **Port:** `5434` (Port host dipetakan ke container `5432` untuk menghindari bentrokan dengan service PostgreSQL lokal)
* **Database Name:** `siplok_db`
* **Username:** `siplok_user`
* **Password:** `siplok_pass123`

### B. pgAdmin 4 Web GUI
* **URL:** [http://localhost:5050](http://localhost:5050)
* **Email:** `admin@siplok.lan`
* **Password:** `admin123`
* **Koneksi Server Baru di pgAdmin:**
  * Host name/address: `pgsql`
  * Port: `5432`
  * Maintenance database: `siplok_db`
  * Username: `siplok_user`
  * Password: `siplok_pass123`

### C. JWT Authentication
* **Driver:** `tymon/jwt-auth`
* **Secret Key:** `d1fe5e81d89849d41d1a938c82b7c617b7b049d5843a88c75e2b34a41334c2ab`
* **TTL Token:** `480 menit` (8 jam jam kerja dinas)

---

## 🗺️ 4. Data Master Wilayah Administratif (Banyumas)

Sistem mencakup 5 Kecamatan dan 24 Desa di Kabupaten Banyumas:

| ID Kec | Nama Kecamatan | Daftar Desa (ID Desa) |
| :---: | :--- | :--- |
| **1** | Purwokerto Utara | Purwanegara (1), Bancarkembar (2), Bobosan (3), Grendeng (4), Sumampir (5) |
| **2** | Purwokerto Selatan | Teluk (6), Tanjung (7), Karangklesem (8), Berkoh (9), Purwokerto Kidul (10) |
| **3** | Purwokerto Timur | Arcawinangun (11), Purwokerto Lor (12), Purwokerto Wetan (13), Sokanegara (14) |
| **4** | Sokaraja | Sokaraja Lor (15), Sokaraja Kidul (16), Wiradadi (17), Kalikidang (18), Jompo (19) |
| **5** | Banyumas | Banyumas (20), Pasinggangan (21), Sudagaran (22), Kejawar (23), Papringan (24) |

---

## 🏛️ 5. Data Master Hierarki Fisik Ruang Arsip

Struktur penataan arsip fisik ATR/BPN berjenjang 4 tingkat:  
**Ruang Arsip → Rak → Shaf (Tingkat) → Boks Arsip**

* **Ruang Arsip A (`RA-A`)**: Khusus arsip dokumen tahun 2020–2024 (ID: 1).
  * Rak `RA-A-01` s/d `RA-A-04` (ID: 1–4, masing-masing 3 Shaf: `SH-01`, `SH-02`, `SH-03`)
  * Tiap shaf memuat 5 boks (`001`, `002`, `003`, `004`, `005`), kapasitas default 50 berkas/boks.
* **Ruang Arsip B (`RA-B`)**: Khusus arsip dokumen tahun 2015–2019 (ID: 2).
  * Rak `RA-B-01` s/d `RA-B-04` (ID: 5–8, masing-masing 3 Shaf: `SH-01`, `SH-02`, `SH-03`)
  * Tiap shaf memuat 5 boks (`001`, `002`, `003`, `004`, `005`), kapasitas default 50 berkas/boks.
* **Total Kapasitas Penyimpanan:** 2 Ruang × 4 Rak × 3 Shaf × 5 Boks = **120 Boks** (Kapasitas total 6.000 dokumen fisik).
* **Fitur Manajemen Master Lokasi (Admin):**
  * Penambahan Rak wajib memilih **Ruang Induk**.
  * Penambahan Shaf wajib memilih **Rak Induk** (cascading dari Ruang).
  * Penambahan Boks wajib memilih **Shaf Induk** (cascading 3 tingkat: Ruang → Rak → Shaf).
  * Kapasitas boks dapat diatur secara **kustom** (rentang 1 – 500 dokumen).
  * Sistem memproteksi data: Ruang/Rak/Shaf/Boks yang masih berisi dokumen tidak dapat dihapus (*Deletion Guard*).

---

## 📑 6. Daftar Lengkap 20 Data Dokumen Pertanahan (Dummy Seeder)

Data ini telah terisi di database dan dapat dicari melalui nomor GU atau NIB:

| ID | Nomor GU | NIB | Jenis | Tahun | Nama Pemilik | Wilayah | Lokasi Fisik Rak | Status Fisik |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **1** | `GU-0101/2021` | `33020101001` | Sertipikat | 2021 | Budi Santoso | Purwanegara, Pwt Utara | Ruang A → Rak 01 → Shaf 01 → Boks 001 | `TERSEDIA` |
| **2** | `GU-0102/2021` | `33020101002` | Warkah | 2021 | Sri Wahyuni | Bancarkembar, Pwt Utara | Ruang A → Rak 01 → Shaf 01 → Boks 002 | `TERSEDIA` |
| **3** | `GU-0203/2022` | `33020202003` | GU | 2022 | Ahmad Fauzi | Bobosan, Pwt Utara | Ruang A → Rak 01 → Shaf 01 → Boks 003 | `TERSEDIA` |
| **4** | `GU-0204/2022` | `33020202004` | SU | 2022 | Dewi Rahayu | Grendeng, Pwt Utara | Ruang A → Rak 01 → Shaf 01 → Boks 004 | `TERSEDIA` |
| **5** | `GU-0305/2022` | `33020303005` | Sertipikat | 2022 | Hendra Kusuma | Sumampir, Pwt Utara | Ruang A → Rak 01 → Shaf 01 → Boks 005 | `TERSEDIA` |
| **6** | `GU-0306/2023` | `33020303006` | Warkah | 2023 | Slamet Riyadi | Teluk, Pwt Selatan | Ruang A → Rak 01 → Shaf 02 → Boks 001 | `TERSEDIA` |
| **7** | `GU-0407/2023` | `33020404007` | Sertipikat | 2023 | Siti Aminah | Tanjung, Pwt Selatan | Ruang A → Rak 01 → Shaf 02 → Boks 002 | `TERSEDIA` |
| **8** | `GU-0408/2023` | `33020404008` | GU | 2023 | Joko Widodo | Karangklesem, Pwt Selatan | Ruang A → Rak 01 → Shaf 02 → Boks 003 | `TERSEDIA` |
| **9** | `GU-0509/2023` | `33020505009` | SU | 2023 | Tri Maryati | Berkoh, Pwt Selatan | Ruang A → Rak 01 → Shaf 02 → Boks 004 | `TERSEDIA` |
| **10** | `GU-0510/2024` | `33020505010` | Sertipikat | 2024 | Bambang Sugiarto | Pwt Kidul, Pwt Selatan | Ruang A → Rak 01 → Shaf 02 → Boks 005 | `TERSEDIA` |
| **11** | `GU-0611/2024` | `33020102011` | Warkah | 2024 | Endang Susilowati | Arcawinangun, Pwt Timur | Ruang A → Rak 01 → Shaf 03 → Boks 001 | `TERSEDIA` |
| **12** | `GU-0612/2024` | `33020203012` | GU | 2024 | Agus Prasetyo | Pwt Lor, Pwt Timur | Ruang A → Rak 01 → Shaf 03 → Boks 002 | `TERSEDIA` |
| **13** | `GU-0713/2024` | `33020304013` | SU | 2024 | Supriyanto | Pwt Wetan, Pwt Timur | Ruang A → Rak 01 → Shaf 03 → Boks 003 | `TERSEDIA` |
| **14** | `GU-0714/2024` | `33020405014` | Sertipikat | 2024 | Ratna Sari | Sokanegara, Pwt Timur | Ruang A → Rak 01 → Shaf 03 → Boks 004 | `TERSEDIA` |
| **15** | `GU-0815/2024` | `33020501015` | Warkah | 2024 | Dwi Haryanto | Sokaraja Lor, Sokaraja | Ruang A → Rak 01 → Shaf 03 → Boks 005 | `TERSEDIA` |
| **16** | `GU-0816/2023` | `33020103016` | Sertipikat | 2023 | Nanang Kosim | Sokaraja Kidul, Sokaraja | Ruang A → Rak 02 → Shaf 01 → Boks 001 | `DIPINJAM` |
| **17** | `GU-0917/2023` | `33020204017` | GU | 2023 | Wahyu Hidayat | Wiradadi, Sokaraja | Ruang A → Rak 02 → Shaf 01 → Boks 002 | `DIPINJAM` |
| **18** | `GU-0918/2024` | `33020301018` | Warkah | 2024 | Ani Wijayanti | Kalikidang, Sokaraja | Ruang A → Rak 02 → Shaf 01 → Boks 003 | `DIPINJAM` |
| **19** | `GU-1019/2020` | `33020402019` | Sertipikat | 2020 | Sugeng Rawuh | Jompo, Sokaraja | Ruang A → Rak 02 → Shaf 01 → Boks 004 | `RUSAK` |
| **20** | `GU-1020/2020` | `33020503020` | Warkah | 2020 | Mulyono | Desa Banyumas, Banyumas | Ruang A → Rak 02 → Shaf 01 → Boks 005 | `RUSAK` |

---

## 🎯 7. Skenario Pengujian Siap Pakai

### A. Uji Coba Pencarian Publik (Masyarakat Tanpa Login)
Buka [http://localhost:3000/cek-dokumen](http://localhost:3000/cek-dokumen):
1. **Status Tersedia (Kotak Hijau):** Masukkan NIB `33020101001` atau Nomor GU `GU-0101/2021`.
2. **Status Sedang Diproses (Kotak Kuning):** Masukkan NIB `33020103016` atau Nomor GU `GU-0816/2023`.
3. **Status Dalam Perbaikan (Kotak Oranye):** Masukkan NIB `33020402019` atau Nomor GU `GU-1019/2020`.
4. **Dokumen Tidak Ditemukan:** Masukkan NIB acak `3302099999999` (akan muncul opsi kontak loket).
5. **Verifikasi Privasi:** Amati bahwa pada halaman publik, **nama pemilik** dan **lokasi fisik rak** sama sekali tidak ditampilkan.

### B. Uji Coba Operasional Petugas (Login sebagai `hendra`)
Buka [http://localhost:3000/login](http://localhost:3000/login) dengan `hendra` / `petugas123`:
1. Masuk ke menu **Dashboard** untuk melihat rekap statistik status fisik dokumen.
2. Cari dokumen `GU-0816/2023`, lalu klik tombol **Pindah Rak** untuk memindahkan lokasi fisik boks.
3. Ubah status dokumen dari `DIPINJAM` kembali menjadi `TERSEDIA`.
4. Klik tombol **Cetak Label** untuk menguji tampilan print label barcode dokumen pertanahan (format 70mm x 35mm).

### C. Uji Coba Wewenang Administrator (Login sebagai `admin`)
Buka [http://localhost:3000/login](http://localhost:3000/login) dengan `admin` / `admin123`:
1. Masuk ke menu **Kelola Pengguna** di `/admin/users` untuk menambah atau menonaktifkan akun petugas.
2. Masuk ke menu **Audit Log** di `/admin/logs` untuk melihat rekam jejak mutasi dokumen dan pencatatan riwayat aktivitas secara transparan.
3. Masuk ke menu **Master Lokasi** di `/admin/lokasi` untuk memantau kapasitas boks arsip.

---

## 🚀 8. Otomasi CI/CD GitHub Actions

Aplikasi SIPLOK telah dilengkapi konfigurasi Continuous Integration & Continuous Deployment (CI/CD) yang mengadopsi standar arsitektur profesional:

### A. Berkas Alur Kerja (*Workflows*)
1. **`.github/workflows/ci.yml`**:
   * Dipicu pada setiap **Pull Request** atau *push* ke cabang `main` dan `develop`.
   * **`backend-check`**: Validasi PHP 8.3, pemeriksaan integritas `composer.json`, dan *syntax linting* seluruh berkas PHP di `app/`, `config/`, dan `routes/`.
   * **`frontend-check`**: Validasi Node.js 20, *static type-checking* (`npm run type-check`), serta verifikasi *Next.js production build*.
   * **`compose-check`**: Validasi sintaks berkas `docker-compose.yml` terhadap template `.env.example`.

2. **`.github/workflows/deploy.yml`**:
   * Menjalankan gerbang `ci.yml` sebagai prasyarat wajib sebelum proses pembangunan citra kontainer.
   * **`build-push`**: Membangun citra Docker `siplok-backend` dan `siplok-frontend` secara paralel menggunakan Docker Buildx dan cache GitHub Actions (`type=gha`), lalu mengunggahnya ke Docker Hub dengan tag `channel` (`latest` / `staging`) serta tag `sha-<commit>`.
   * **`deploy-staging`**: Otomasi pembaruan ke server staging via SSH saat ada *push* ke cabang `develop`.
   * **`deploy-production`**: Otomasi pembaruan ke server produksi via SSH saat ada *push* ke cabang `main`.

### B. Konfigurasi GitHub Repository Secrets
Untuk mengaktifkan alur CD ke Docker Hub dan VPS EC2 secara otomatis setiap kali Anda melakukan `git push`, daftarkan secrets berikut pada menu **Settings → Secrets and variables → Actions** di repositori GitHub SIPLOK:

| Nama Secret | Deskripsi & Nilai Rekomendasi | Status |
| :--- | :--- | :--- |
| `DOCKERHUB_USERNAME` | Username Docker Hub: `arityo182` | **Wajib** |
| `DOCKERHUB_TOKEN` | Personal Access Token dari Docker Hub (*Read, Write, Delete*) | **Wajib** |
| `EC2_HOST` (atau `VPS_HOST`) | IP Publik EC2: `13.218.77.9` (atau `ec2-13-218-77-9.compute-1.amazonaws.com`) | **Wajib** |
| `EC2_USER` (atau `VPS_USER`) | Username SSH: `ubuntu` | **Wajib** |
| `EC2_SSH_KEY` (atau `VPS_SSH_KEY`) | Isi teks lengkap berkas private key `docker-ec2-key.pem` | **Wajib** |
| `VPS_PORT` | Port SSH server (default: `22`) | Opsional |

---

## ☁️ 9. Konfigurasi VPS & Nginx Reverse Proxy Live

VPS AWS EC2 telah dikonfigurasi dengan arsitektur isolasi port multi-proyek agar tidak saling bertabrakan dengan portofolio RS Medika Sentosa maupun Koperasi Digital:

* **Domain Resmi:** `https://arsip.arityodev.my.id`
* **Direktori Aplikasi di VPS:** `/home/ubuntu/siplok`
* **Sertifikat SSL:** Let's Encrypt ECDSA aktif (otomatis diperbarui oleh Certbot)
* **Pemetaan Port & Alur Nginx Host (`/etc/nginx/sites-available/siplok`):**
  * `https://arsip.arityodev.my.id/` ➔ Proxy Pass ke `127.0.0.1:3002` (Kontainer `siplok-prod-frontend`)
  * `https://arsip.arityodev.my.id/api` ➔ Proxy Pass ke `127.0.0.1:8002` (Kontainer `siplok-prod-backend`)
  * `https://arsip.arityodev.my.id/storage` ➔ Proxy Pass ke `127.0.0.1:8002` (Berkas unggahan warkah)
  * Port `80` otomatis dialihkan (*HTTP 301 Redirect*) ke `443 HTTPS`.
* **Alokasi Sumber Daya (RAM Guard):**
  * Kontainer `pgsql`: 256 MiB
  * Kontainer `backend`: 384 MiB
  * Kontainer `frontend`: 256 MiB
  * Total memori aman dalam sisa RAM ~862 MiB VPS tanpa mengganggu service Medika.
