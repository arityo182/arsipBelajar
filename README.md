# SIPLOK — Sistem Informasi Pelacakan Lokasi Dokumen Fisik Pertanahan

**Kantor Pertanahan Kabupaten Banyumas, Kementerian Agraria dan Tata Ruang / Badan Pertanahan Nasional (ATR/BPN)**

SIPLOK adalah platform sistem informasi terintegrasi untuk digitalisasi pencarian, pemetaan, dan pelacakan lokasi fisik arsip dokumen pertanahan (Gambar Ukur / GU, Nomor Identifikasi Bidang / NIB, Sertipikat Hak Atas Tanah, Surat Ukur / SU, Warkah, dan Dokumen Terkait).

---

## 🛠️ Tech Stack & Arsitektur

* **Backend Framework:** Laravel 13 / 11 (Slim Skeleton, PHP 8.3+)
* **Database:** PostgreSQL 16 (Relational Database with Foreign Key Cascades & Check Constraints)
* **Authentication:** Stateless JWT (`tymon/jwt-auth`), TTL 480 Menit (8 Jam Kerja Dinas)
* **Containerization:** Docker Engine & Docker Compose Plugin (Alpine-based images: PHP-FPM, Nginx, PostgreSQL, Next.js, pgAdmin)
* **Target OS:** Ubuntu 22.04 LTS (Jammy Jellyfish)

---

## 📂 Struktur Hirarki Lokasi Fisik Arsip

Dokumen fisik dilacak secara presisi melalui hirarki berjenjang:
```
Ruang Penyimpanan (RA-A / RA-B)
  └── Lemari Rak (RA-A-01 .. 04)
        └── Shaf / Ambalan Rak (SH-01 .. 03)
              └── Boks Arsip (001 .. 005)
                    └── Dokumen Pertanahan (GU, NIB, Sertipikat, Warkah)
```

Accessor otomatis:
`Ruang {ruang.nama} → Rak {rak.kode} → Shaf {shaf.kode} → Boks {boks.nomor}`

---

## 🚀 Panduan Setup Cepat (Langkah demi Langkah)

### 1. Klon Repositori & Masuk Direktori
```bash
cd "/home/arie/Downloads/Aplikasi Arsip"
```

### 2. Cek & Install Kebutuhan Sistem (Prerequisites)
Pastikan seluruh perkakas (`Docker`, `Docker Compose`, `Node.js v20`, `PHP 8.3`, `Composer`, `Git`) siap tanpa interaksi manual:
```bash
make check
# atau secara manual: bash scripts/check-and-install.sh
```

### 3. Siapkan Konfigurasi Environment Docker
```bash
cp .env.docker.example .env
```

### 4. Build & Jalankan Seluruh Container Docker
```bash
make up
```
Tunggu hingga PostgreSQL dan backend berstatus sehat (*healthy* / sekitar 1–2 menit).

### 5. Jalankan Migrasi Database & Seeder Data Riil Banyumas
```bash
make fresh
```

### 6. Akses Layanan Aplikasi
* **Frontend Web:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:8000/api](http://localhost:8000/api)
* **pgAdmin GUI Database:** [http://localhost:5050](http://localhost:5050)
  * Email: `admin@siplok.lan`
  * Password: `admin123`

---

## 🔑 Kredensial Akun Default

| No | Nama Pengguna | Username | Password | Role | Hak Akses |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | Administrator SIPLOK | `admin` | `admin123` | `ADMIN` | Akses penuh (Manajemen User, Reset Password, Audit Log) |
| 2 | Petugas Arsip Hendra | `hendra` | `petugas123` | `USER` | Kelola Dokumen, Cek GU, Mutasi Pindah Rak & Status |
| 3 | Petugas Arsip Siti | `siti` | `petugas123` | `USER` | Kelola Dokumen, Cek GU, Mutasi Pindah Rak & Status |

---

## 📡 Daftar Endpoint API Utama

Format Response Standar:
* **Sukses:** `{ "data": ..., "message": "..." }`
* **Paginasi:** `{ "data": [...], "meta": { "current_page", "last_page", "per_page", "total" }, "message": "..." }`
* **Error:** `{ "message": "...", "errors": { "field": ["pesan error"] } }`

### Auth (Publik / JWT)
* `POST /api/auth/login` — Login pengguna & terbitkan JWT token
* `POST /api/auth/logout` — Cabut (*blacklist*) JWT token
* `GET  /api/auth/me` — Ambil profil pengguna aktif

### Dokumen (Middleware: `auth.jwt`)
* `GET   /api/dokumen` — Daftar dokumen terpaginasi (pencarian via `search`, filter nomor GU/NIB/nama pemilik)
* `POST  /api/dokumen` — Simpan dokumen baru & catat `log_aktivitas` `TAMBAH_DOKUMEN`
* `GET   /api/dokumen/check-gu?nomor_gu=GU-0101/2021` — Validasi duplikasi nomor GU secara real-time
* `GET   /api/dokumen/{id}` — Detail dokumen lengkap dengan jejak audit mutasi
* `PATCH /api/dokumen/{id}/pindah` — Pindahkan boks dokumen & catat `PINDAH_RAK`
* `PATCH /api/dokumen/{id}/status` — Update status fisik (`TERSEDIA`, `DIPINJAM`, `RUSAK`, `HILANG`)

### Lokasi & Wilayah (Middleware: `auth.jwt`)
* `GET /api/lokasi/ruang` — Daftar seluruh ruang arsip
* `GET /api/lokasi/rak?ruang_id=1` — Daftar rak di ruangan
* `GET /api/lokasi/shaf?rak_id=1` — Daftar shaf di rak
* `GET /api/lokasi/boks?shaf_id=1` — Daftar boks dengan kapasitas, jumlah `terisi`, dan `sisa`
* `GET /api/wilayah/kecamatan` — Daftar kecamatan Kabupaten Banyumas
* `GET /api/wilayah/desa?kecamatan_id=1` — Daftar desa berdasarkan kecamatan

### Admin (Middleware: `auth.jwt` + `role:ADMIN`)
* `GET   /api/admin/users` — Daftar pengguna terdaftar
* `POST  /api/admin/users` — Tambah staf/petugas baru
* `PATCH /api/admin/users/{id}` — Update status aktif/role (dengan proteksi *self-deactivation*)
* `POST  /api/admin/users/{id}/reset-password` — Reset password acak 8 karakter (plaintext dikembalikan sekali)
* `GET   /api/admin/logs` — Audit trail log aktivitas seluruh dokumen & pengguna

---

## 🛠️ Shortcut Perintah Makefile

| Perintah | Deskripsi |
| :--- | :--- |
| `make check` | Cek & pasang dependensi Ubuntu 22.04 otomatis |
| `make setup` | Setup perdana instan (check + build container + migrasi + seeder) |
| `make up` | Menjalankan seluruh container Docker di latar belakang (*detached*) |
| `make down` | Menghentikan seluruh container Docker |
| `make restart` | Nyalakan ulang (*down* lalu *up*) |
| `make migrate` | Menjalankan migrasi database di container backend |
| `make seed` | Menjalankan database seeder di container backend |
| `make fresh` | Reset bersih database, migrasi ulang & jalankan seeder |
| `make logs` | Menampilkan live streaming logs seluruh service |
| `make bash-be` | Masuk ke terminal shell Alpine di container backend |
| `make bash-db` | Masuk ke antarmuka PostgreSQL CLI (`psql`) di container database |

---

## 🔍 Panduan Pemecahan Masalah (Troubleshooting)

1. **Port Bentrok (Port 5432 / 8000 / 3000 / 5050 sudah digunakan):**
   * Periksa service yang berjalan: `sudo lsof -i :5432` atau `sudo lsof -i :8000`.
   * Jika ada PostgreSQL lokal di host yang berjalan: `sudo systemctl stop postgresql`.
   * Atau ubah port mapping pada `.env` (misal: `BACKEND_PORT=8080`, `PGSQL_PORT=5433`).

2. **Error Izin Akses Docker (`permission denied while trying to connect to the Docker daemon socket`):**
   * Masukkan user ke grup docker: `sudo usermod -aG docker $USER`.
   * Refresh sesi grup terminal: `newgrp docker` atau *logout* dan *login* ulang Ubuntu.

3. **Migrasi atau Seeder Gagal:**
   * Pastikan status kontainer database sehat: `docker ps`.
   * Gunakan alternatif script SQL langsung:
     ```bash
     cat scripts/init.sql | docker exec -i siplok-pgsql psql -U siplok_user -d siplok_db
     ```
