# API Reference — SIPLOK Backend RESTful API
## Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
Versi API: 1.0.0 | Arsitektur: Laravel 13 / 11 + JWT Authentication + PostgreSQL 16

---

## 1. Konvensi Dasar

### 1.1 Base URL
* **Development (Lokal):** `http://localhost:8000/api`
* **Staging / Docker Network:** `http://backend:80/api`
* **Production (Intranet Kantor):** `http://siplok.banyumas.atrbpn.lan/api`

### 1.2 Header Autentikasi
Kecuali rute login publik, seluruh pemanggilan endpoint **wajib** menyertakan header otentikasi JWT:
```http
Authorization: Bearer <token_jwt_anda>
Content-Type: application/json
Accept: application/json
X-Requested-With: XMLHttpRequest
```

### 1.3 Format Respons Standar

#### A. Respons Sukses Tunggal / Non-Paginasi
```json
{
  "data": {
    "id": 1,
    "nama": "Contoh Data"
  },
  "message": "Operasi berhasil dilakukan"
}
```

#### B. Respons Sukses Terpaginasi (*Paginated Response*)
```json
{
  "data": [
    { "id": 1, "nomor_gu": "GU-0101/2021" }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 73
  },
  "message": "Daftar data berhasil diambil"
}
```

#### C. Respons Kesalahan Validasi (*HTTP 422 Unprocessable Entity*)
```json
{
  "message": "Validasi gagal",
  "errors": {
    "nomor_gu": [
      "Nomor GU sudah terdaftar di sistem."
    ],
    "alasan": [
      "Alasan pemindahan minimal 10 karakter."
    ]
  }
}
```

#### D. Respons Kesalahan Otorisasi / Server (*HTTP 401, 403, 404, 500*)
```json
{
  "message": "Unauthorized"
}
```

### 1.4 Daftar Kode Status HTTP yang Digunakan

| Kode HTTP | Status Label | Penjelasan dalam SIPLOK |
| :---: | :--- | :--- |
| **200** | `OK` | Permintaan berhasil diproses dan mengembalikan data. |
| **201** | `Created` | Entitas baru berhasil disimpan ke basis data (dokumen baru/user baru). |
| **400** | `Bad Request` | Format parameter permintaan tidak lengkap atau rusak. |
| **401** | `Unauthorized` | Token JWT tidak disertakan, kedaluwarsa, atau akun dinonaktifkan. |
| **403** | `Forbidden` | Token valid, namun peran pengguna bukan `ADMIN` untuk rute khusus. |
| **404** | `Not Found` | Entitas ID dokumen, lokasi, atau rute tidak ditemukan. |
| **422** | `Unprocessable Entity` | Validasi aturan bisnis atau skema FormRequest ditolak. |
| **500** | `Internal Server Error` | Terjadi kendala internal koneksi basis data atau server. |

---

## 2. Katalog Endpoint Terinci

### GRUP 1: AUTHENTICATION (Autentikasi & Profil)

#### 1. POST `/api/auth/login`
* **Deskripsi:** Masuk ke dalam sistem dan terbitkan token JWT aktif (berlaku 8 jam).
* **Autentikasi:** Tidak perlu (Publik).
* **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
* **Contoh cURL:**
  ```bash
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}'
  ```
* **Response 200 OK:**
  ```json
  {
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "nama": "Administrator SIPLOK",
        "role": "ADMIN"
      }
    },
    "message": "Login berhasil"
  }
  ```
* **Response 401 Unauthorized:**
  ```json
  {
    "message": "Username atau password salah"
  }
  ```

---

#### 2. POST `/api/auth/logout`
* **Deskripsi:** Mengakhiri sesi aktif dan mencabut (*blacklist*) token JWT.
* **Autentikasi:** Wajib (`Bearer Token`).
* **Response 200 OK:**
  ```json
  {
    "message": "Logout berhasil"
  }
  ```

---

#### 3. GET `/api/auth/me`
* **Deskripsi:** Mengambil data profil lengkap pengguna yang sedang login.
* **Autentikasi:** Wajib (`Bearer Token`).
* **Response 200 OK:**
  ```json
  {
    "data": {
      "id": 1,
      "nama": "Administrator SIPLOK",
      "username": "admin",
      "role": "ADMIN",
      "aktif": true,
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    },
    "message": "Data user berhasil diambil"
  }
  ```

---

### GRUP 2: DOKUMEN PERTANAHAN

#### 4. GET `/api/dokumen`
* **Deskripsi:** Mengambil daftar berkas dokumen pertanahan terpaginasi dengan pencarian real-time dan eager loading lokasi lengkap.
* **Autentikasi:** Wajib (`Bearer Token`).
* **Query Parameters:**
  * `search` (opsional): Kata kunci pencarian pada Nomor GU, NIB, atau Nama Pemilik.
  * `page` (opsional, default: 1): Halaman data aktif.
  * `per_page` (opsional, default: 15, max: 100): Jumlah baris per halaman.
* **Response 200 OK:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "nomor_gu": "GU-0101/2021",
        "tahun": 2021,
        "nib": "33020101001",
        "jenis_dokumen": "Sertipikat",
        "nama_pemilik": "Budi Santoso",
        "status_fisik": "TERSEDIA",
        "lokasi_lengkap": "Ruang Ruang Arsip A → Rak RA-A-01 → Shaf SH-01 → Boks 001",
        "desa": {
          "id": 1,
          "nama": "Purwanegara",
          "kecamatan": {
            "id": 1,
            "nama": "Purwokerto Utara"
          }
        },
        "boks": {
          "id": 1,
          "nomor": "001",
          "kapasitas": 50
        },
        "created_by": 2,
        "created_at": "2024-10-20T08:30:00.000000Z",
        "updated_at": "2024-11-05T09:15:00.000000Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 2,
      "per_page": 15,
      "total": 20
    },
    "message": "Daftar dokumen berhasil diambil"
  }
  ```

---

#### 5. POST `/api/dokumen`
* **Deskripsi:** Mendaftarkan arsip warkah fisik baru ke dalam boks dan mencatat log penambahan.
* **Autentikasi:** Wajib (`Bearer Token`).
* **Request Body:**
  ```json
  {
    "nomor_gu": "GU-0124/2024",
    "tahun": 2024,
    "nib": "33020123456789",
    "jenis_dokumen": "Sertipikat",
    "nama_pemilik": "Bambang Sugiarto",
    "desa_id": 1,
    "boks_id": 5
  }
  ```
* **Response 201 Created:**
  ```json
  {
    "data": {
      "id": 21,
      "nomor_gu": "GU-0124/2024",
      "tahun": 2024,
      "nib": "33020123456789",
      "jenis_dokumen": "Sertipikat",
      "nama_pemilik": "Bambang Sugiarto",
      "status_fisik": "TERSEDIA",
      "lokasi_lengkap": "Ruang Ruang Arsip A → Rak RA-A-01 → Shaf SH-01 → Boks 005",
      "created_at": "2024-12-01T10:00:00.000000Z"
    },
    "message": "Dokumen berhasil disimpan"
  }
  ```
* **Response 422 Unprocessable Entity:**
  ```json
  {
    "message": "Validasi gagal",
    "errors": {
      "nomor_gu": ["Nomor GU sudah terdaftar di sistem."]
    }
  }
  ```

---

#### 6. GET `/api/dokumen/{id}`
* **Deskripsi:** Mendapatkan informasi detail dokumen, koordinat hierarki lokasi lengkap, dan 20 log mutasi terakhir.
* **Autentikasi:** Wajib (`Bearer Token`).
* **Response 200 OK:**
  ```json
  {
    "data": {
      "id": 1,
      "nomor_gu": "GU-0101/2021",
      "tahun": 2021,
      "nib": "33020101001",
      "jenis_dokumen": "Sertipikat",
      "nama_pemilik": "Budi Santoso",
      "status_fisik": "TERSEDIA",
      "lokasi_lengkap": "Ruang Ruang Arsip A → Rak RA-A-01 → Shaf SH-01 → Boks 001",
      "desa": {
        "id": 1,
        "nama": "Purwanegara",
        "kecamatan": {
          "id": 1,
          "nama": "Purwokerto Utara"
        }
      },
      "lokasi_detail": {
        "ruang": { "id": 1, "nama": "Ruang Arsip A", "kode": "RA-A" },
        "rak": { "id": 1, "kode": "RA-A-01" },
        "shaf": { "id": 1, "kode": "SH-01" },
        "boks": { "id": 1, "nomor": "001", "kapasitas": 50 }
      },
      "log_aktivitas": [
        {
          "id": 1,
          "aksi": "TAMBAH_DOKUMEN",
          "detail": "Dokumen GU-0101/2021 atas nama Budi Santoso ditambahkan...",
          "created_at": "2024-10-20T08:30:00.000000Z",
          "user": { "id": 2, "nama": "Petugas Arsip Hendra" }
        }
      ]
    },
    "message": "Detail dokumen berhasil diambil"
  }
  ```

---

#### 7. GET `/api/dokumen/check-gu`
* **Deskripsi:** Pengecekan real-time ketersediaan atau duplikasi Nomor GU.
* **Autentikasi:** Wajib (`Bearer Token`).
* **Query Parameters:** `nomor_gu` (string).
* **Response 200 OK (Jika Sudah Ada):**
  ```json
  {
    "data": { "exists": true },
    "message": "Pengecekan nomor GU berhasil"
  }
  ```
* **Response 200 OK (Jika Belum Ada / Tersedia):**
  ```json
  {
    "data": { "exists": false },
    "message": "Pengecekan nomor GU berhasil"
  }
  ```

---

#### 8. PATCH `/api/dokumen/{id}/pindah`
* **Deskripsi:** Memindahkan dokumen ke boks lain dan mencatat riwayat pemindahan secara atomik.
* **Autentikasi:** Wajib (`Bearer Token`).
* **Request Body:**
  ```json
  {
    "boks_id_baru": 12,
    "alasan": "Reorganisasi lemari rak bulan Desember untuk warkah kadastral"
  }
  ```
* **Response 200 OK:**
  ```json
  {
    "data": {
      "id": 1,
      "nomor_gu": "GU-0101/2021",
      "lokasi_lengkap": "Ruang Ruang Arsip A → Rak RA-A-03 → Shaf SH-01 → Boks 002"
    },
    "message": "Dokumen berhasil dipindah"
  }
  ```

---

#### 9. PATCH `/api/dokumen/{id}/status`
* **Deskripsi:** Memperbarui kondisi fisik dokumen (Tersedia, Dipinjam, Rusak, Hilang).
* **Autentikasi:** Wajib (`Bearer Token`).
* **Request Body:**
  ```json
  {
    "status_fisik": "DIPINJAM",
    "keterangan": "Dipinjam oleh Seksi Survei untuk peninjauan batas sengketa bidang"
  }
  ```
* **Response 200 OK:**
  ```json
  {
    "data": {
      "id": 1,
      "status_fisik": "DIPINJAM"
    },
    "message": "Status berhasil diperbarui"
  }
  ```

---

### GRUP 3: LOKASI FISIK ARSIP

#### 10. GET `/api/lokasi/ruang`
* **Deskripsi:** Mendapatkan daftar seluruh ruangan arsip.
* **Autentikasi:** Wajib (`Bearer Token`).
* **Response 200 OK:**
  ```json
  {
    "data": [
      { "id": 1, "nama": "Ruang Arsip A", "kode": "RA-A" },
      { "id": 2, "nama": "Ruang Arsip B", "kode": "RA-B" }
    ],
    "message": "Daftar ruangan berhasil diambil"
  }
  ```

---

#### 11. GET `/api/lokasi/rak`
* **Deskripsi:** Mendapatkan daftar rak dalam suatu ruangan.
* **Query Parameters:** `ruang_id` (opsional).
* **Response 200 OK:**
  ```json
  {
    "data": [
      { "id": 1, "kode": "RA-A-01", "ruang_id": 1 },
      { "id": 2, "kode": "RA-A-02", "ruang_id": 1 }
    ],
    "message": "Daftar rak berhasil diambil"
  }
  ```

---

#### 12. GET `/api/lokasi/shaf`
* **Deskripsi:** Mendapatkan daftar shaf/ambalan dalam rak tertentu.
* **Query Parameters:** `rak_id` (opsional).
* **Response 200 OK:**
  ```json
  {
    "data": [
      { "id": 1, "kode": "SH-01", "rak_id": 1 },
      { "id": 2, "kode": "SH-02", "rak_id": 1 }
    ],
    "message": "Daftar shaf berhasil diambil"
  }
  ```

---

#### 13. GET `/api/lokasi/boks`
* **Deskripsi:** Mendapatkan daftar boks beserta jumlah dokumen yang terisi dan sisa slot kapasitas.
* **Query Parameters:** `shaf_id` (opsional).
* **Response 200 OK:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "nomor": "001",
        "shaf_id": 1,
        "kapasitas": 50,
        "terisi": 32,
        "sisa": 18
      }
    ],
    "message": "Daftar boks berhasil diambil"
  }
  ```

---

### GRUP 4: WILAYAH ADMINISTRATIF BANYUMAS

#### 14. GET `/api/wilayah/kecamatan`
* **Deskripsi:** Mendapatkan master data kecamatan di Kabupaten Banyumas.
* **Autentikasi:** Wajib (`Bearer Token`).
* **Response 200 OK:**
  ```json
  {
    "data": [
      { "id": 1, "nama": "Purwokerto Utara" },
      { "id": 2, "nama": "Purwokerto Selatan" },
      { "id": 3, "nama": "Purwokerto Timur" },
      { "id": 4, "nama": "Sokaraja" },
      { "id": 5, "nama": "Banyumas" }
    ],
    "message": "Daftar kecamatan berhasil diambil"
  }
  ```

---

#### 15. GET `/api/wilayah/desa`
* **Deskripsi:** Mendapatkan daftar desa/kelurahan dalam kecamatan tertentu.
* **Query Parameters:** `kecamatan_id` (opsional).
* **Response 200 OK:**
  ```json
  {
    "data": [
      { "id": 1, "nama": "Purwanegara", "kecamatan_id": 1 },
      { "id": 2, "nama": "Bancarkembar", "kecamatan_id": 1 }
    ],
    "message": "Daftar desa berhasil diambil"
  }
  ```

---

### GRUP 5: ADMINISTRATOR (Middleware: `auth.jwt` + `role:ADMIN`)

#### 16. GET `/api/admin/users`
* **Deskripsi:** Mengambil daftar seluruh staf pengguna sistem (paginated).
* **Autentikasi:** Wajib (`Bearer Token` + Role `ADMIN`).
* **Response 200 OK:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "nama": "Administrator SIPLOK",
        "username": "admin",
        "role": "ADMIN",
        "aktif": true,
        "created_at": "2024-01-01T00:00:00.000000Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 15,
      "total": 3
    },
    "message": "Daftar pengguna berhasil diambil"
  }
  ```

---

#### 17. POST `/api/admin/users`
* **Deskripsi:** Mendaftarkan akun staf baru.
* **Request Body:**
  ```json
  {
    "nama": "Petugas Baru",
    "username": "petugas_baru",
    "password": "password123",
    "role": "USER"
  }
  ```
* **Response 201 Created:**
  ```json
  {
    "data": {
      "id": 4,
      "nama": "Petugas Baru",
      "username": "petugas_baru",
      "role": "USER",
      "aktif": true
    },
    "message": "User berhasil ditambahkan"
  }
  ```

---

#### 18. PATCH `/api/admin/users/{id}`
* **Deskripsi:** Mengubah status aktif atau peran pengguna (dengan proteksi *self-deactivation*).
* **Request Body:**
  ```json
  {
    "aktif": false
  }
  ```
* **Response 200 OK:**
  ```json
  {
    "data": {
      "id": 4,
      "aktif": false
    },
    "message": "User berhasil diperbarui"
  }
  ```
* **Response 422 Error (Jika Mencoba Nonaktifkan Akun Sendiri):**
  ```json
  {
    "message": "Anda tidak dapat menonaktifkan akun Anda sendiri",
    "errors": {
      "aktif": ["Akun administrator yang sedang aktif tidak dapat dinonaktifkan oleh diri sendiri."]
    }
  }
  ```

---

#### 19. POST `/api/admin/users/{id}/reset-password`
* **Deskripsi:** Menghasilkan kata sandi acak baru 8 karakter alfanumerik.
* **Autentikasi:** Wajib (`Bearer Token` + Role `ADMIN`).
* **Response 200 OK:**
  ```json
  {
    "data": {
      "password_baru": "aB3xK9mZ"
    },
    "message": "Password berhasil direset"
  }
  ```

---

#### 20. GET `/api/admin/logs`
* **Deskripsi:** Memantau rekaman log aktivitas mutasi seluruh arsip dokumen.
* **Query Parameters:** `search` (opsional), `page` (opsional).
* **Response 200 OK:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "aksi": "TAMBAH_DOKUMEN",
        "detail": "Dokumen GU-0101/2021 atas nama Budi Santoso ditambahkan...",
        "created_at": "2024-10-20T08:30:00.000000Z",
        "user": {
          "id": 2,
          "nama": "Petugas Arsip Hendra",
          "username": "hendra",
          "role": "USER"
        },
        "dokumen": {
          "id": 1,
          "nomor_gu": "GU-0101/2021",
          "nib": "33020101001",
          "nama_pemilik": "Budi Santoso"
        }
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 20,
      "total": 13
    },
    "message": "Daftar log aktivitas berhasil diambil"
  }
  ```
