# Panduan Instalasi & Deployment SIPLOK
## Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
**Sistem Operasi Target:** Ubuntu 22.04 LTS (Jammy Jellyfish)  
**Tumpukan Teknologi:** Docker Engine, Docker Compose, PostgreSQL 16, Laravel 13, Next.js 16  

---

## 1. Prasyarat Sistem & Perangkat Keras

Sebelum memulai proses instalasi, pastikan server atau mesin kerja memenuhi spesifikasi minimum:
* **Sistem Operasi:** Ubuntu 22.04 LTS (atau varian Linux berbasis Debian lainnya).
* **Prosesor (CPU):** Minimal 2 Core (Rekomendasi 4 Core).
* **Memori RAM:** Minimal 4 GB (Rekomendasi 8 GB untuk beban kontainer penuh).
* **Ruang Penyimpanan (Disk):** Minimal 20 GB ruang kosong (*free storage*).
* **Koneksi Jaringan:** Akses internet aktif saat instalasi awal untuk mengunduh image Docker dan dependensi paket.

---

## 2. Metode Instalasi

### 2.1 METODE A: Instalasi Otomatis (Sangat Direkomendasikan)

Metode ini menggunakan skrip bash pintar dan Makefile untuk mempersiapkan seluruh kebutuhan sistem dalam satu langkah.

#### Langkah 1: Masuk ke Ruang Kerja Proyek
```bash
cd "/home/arie/Downloads/Aplikasi Arsip"
```

#### Langkah 2: Jalankan Skrip Pemeriksa Kebutuhan Sistem
Skrip ini akan memeriksa Docker Engine, Node.js v20, PHP 8.3, Composer, dan Git. Jika ada tool yang belum ada, skrip akan menginstalnya secara otomatis:
```bash
bash scripts/check-and-install.sh
```

#### Langkah 3: Siapkan Berkas Konfigurasi Lingkungan
Salin berkas template environment Docker:
```bash
cp .env.docker.example .env
```

#### Langkah 4: Jalankan Setup Perdana (First-Run Setup)
Perintah ini akan membangun citra kontainer Docker, menyalakan service, menjalankan migrasi skema tabel, dan menyuntikkan data dummy realistis Banyumas:
```bash
make setup
```

#### Langkah 5: Verifikasi Akses Sistem
* **Frontend Web Application:** Buka peramban di [http://localhost:3000](http://localhost:3000)
* **Backend REST API:** Buka peramban di [http://localhost:8000/api](http://localhost:8000/api)
* **pgAdmin 4 (Basis Data GUI):** Buka peramban di [http://localhost:5050](http://localhost:5050)
  * Email: `admin@siplok.lan`
  * Password: `admin123`

#### Langkah 6: Masuk ke Aplikasi SIPLOK
* **Username:** `admin`
* **Password:** `admin123`

---

### 2.2 METODE B: Instalasi Manual Langkah demi Langkah

Jika server memiliki kebijakan restriksi akses root atau Anda ingin melakukan instalasi bertahap:

#### Langkah 1: Pasang Docker Engine Resmi (Ubuntu 22.04)
```bash
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

#### Langkah 2: Pasang Node.js v20 LTS via NodeSource
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Langkah 3: Pasang PHP 8.3 & Ekstensi Kadastral
```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt-get update -y
sudo apt-get install -y php8.3-cli php8.3-pgsql php8.3-xml php8.3-curl php8.3-zip php8.3-mbstring php8.3-bcmath php8.3-tokenizer unzip
```

#### Langkah 4: Pasang Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

#### Langkah 5: Bangun Kontainer & Jalankan Layanan
```bash
cp .env.docker.example .env
docker compose up -d --build
```

#### Langkah 6: Jalankan Migrasi & Seeder Database
```bash
# Tunggu hingga PostgreSQL siap (sekitar 10 detik)
docker exec siplok-backend php artisan migrate --force
docker exec siplok-backend php artisan db:seed --force
```

---

## 3. Daftar Pintasan Perintah Makefile

Tersedia pintasan `make` untuk mempermudah operasional harian:

| Perintah | Fungsi Operasional |
| :--- | :--- |
| `make check` | Memeriksa dan menginstal paket sistem Ubuntu yang belum ada. |
| `make setup` | Menjalankan alur instalasi awal penuh (check $\rightarrow$ up $\rightarrow$ fresh seed). |
| `make up` | Membangun (*build*) dan menyalakan seluruh service kontainer di latar belakang. |
| `make down` | Menghentikan seluruh kontainer Docker yang sedang berjalan. |
| `make restart` | Mematikan lalu menyalakan ulang seluruh kontainer (*down* lalu *up*). |
| `make logs` | Menampilkan live streaming log seluruh kontainer Docker secara bersamaan. |
| `make migrate` | Menjalankan migrasi berkas skema database baru di kontainer backend. |
| `make seed` | Menjalankan database seeder untuk mengisi data awal. |
| `make fresh` | Mereset database bersih (*drop tables*), migrasi ulang, dan seeder dari awal. |
| `make bash-be` | Masuk ke sesi terminal shell interaktif pada kontainer backend PHP-FPM. |
| `make bash-db` | Masuk langsung ke CLI PostgreSQL (`psql`) di kontainer database. |

---

## 4. Panduan Pemecahan Masalah (Troubleshooting)

### Kendala 1: Port Bentrok (Port 5432 / 8000 / 3000 Sudah Dipakai)
* **Gejala:** Muncul pesan kesalahan `Bind for 0.0.0.0:8000 failed: port is already allocated`.
* **Penyebab:** Terdapat service lokal (misal Apache, Nginx lokal, atau PostgreSQL lokal di host) yang sedang berjalan di port yang sama.
* **Solusi:**
  1. Identifikasi proses yang memegang port:
     ```bash
     sudo lsof -i :8000
     sudo lsof -i :5432
     ```
  2. Matikan service PostgreSQL lokal host jika ada:
     ```bash
     sudo systemctl stop postgresql
     ```
  3. Atau ubah port mapping pada `.env` (misal: `BACKEND_PORT=8081` atau `PGSQL_PORT=5433`).

---

### Kendala 2: Izin Akses Docker Ditolak (*Permission Denied*)
* **Gejala:** `Got permission denied while trying to connect to the Docker daemon socket`.
* **Penyebab:** Pengguna Linux aktif belum masuk ke dalam grup sistem `docker`.
* **Solusi:**
  1. Masukkan pengguna ke grup docker:
     ```bash
     sudo usermod -aG docker $USER
     ```
  2. Muat ulang sesi grup tanpa harus logout:
     ```bash
     newgrp docker
     ```

---

### Kendala 3: Migrasi Gagal (*Database Connection Refused*)
* **Gejala:** `SQLSTATE[08006] [7] could not connect to server: Connection refused`.
* **Penyebab:** Kontainer backend mencoba menjalankan migrasi sebelum service PostgreSQL selesai menginisialisasi cluster basis data.
* **Solusi:**
  1. Cek kesiapan PostgreSQL:
     ```bash
     docker compose logs -f pgsql
     ```
  2. Pastikan muncul baris `database system is ready to accept connections`.
  3. Jalankan ulang migrasi secara manual:
     ```bash
     make migrate
     ```

---

### Kendala 4: Cadangan Injeksi SQL Murni
* **Skenario:** Jika perintah `php artisan db:seed` mengalami kendala dependensi PHP lokal, data dummy realistis Banyumas dapat diinjeksi langsung menggunakan berkas SQL murni:
  ```bash
  cat scripts/init.sql | docker exec -i siplok-pgsql psql -U siplok_user -d siplok_db
  ```

---

### Kendala 5: Pembaruan Token JWT Secret
* **Skenario:** Jika token JWT menghasilkan error otentikasi signature pada instalasi mandiri, generate ulang secret key JWT:
  ```bash
  docker exec siplok-backend php artisan jwt:secret --force
  ```
