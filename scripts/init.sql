-- ================================================================
-- scripts/init.sql
-- SIPLOK Database Initializer & Raw Data Backup (PostgreSQL 16)
-- Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
-- ================================================================

-- Bersihkan tabel jika ada (CASCADE)
DROP TABLE IF EXISTS log_aktivitas CASCADE;
DROP TABLE IF EXISTS dokumen CASCADE;
DROP TABLE IF EXISTS boks CASCADE;
DROP TABLE IF EXISTS shaf CASCADE;
DROP TABLE IF EXISTS rak CASCADE;
DROP TABLE IF EXISTS ruang CASCADE;
DROP TABLE IF EXISTS desa CASCADE;
DROP TABLE IF EXISTS kecamatan CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------
-- 1. TABEL: users
-- ----------------------------------------------------------------
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('ADMIN', 'USER')),
    aktif BOOLEAN NOT NULL DEFAULT true,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- 2. TABEL: kecamatan & desa
-- ----------------------------------------------------------------
CREATE TABLE kecamatan (
    id BIGSERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE desa (
    id BIGSERIAL PRIMARY KEY,
    kecamatan_id BIGINT NOT NULL REFERENCES kecamatan(id) ON DELETE CASCADE,
    nama VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- 3. TABEL: ruang, rak, shaf, boks
-- ----------------------------------------------------------------
CREATE TABLE ruang (
    id BIGSERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kode VARCHAR(20) NOT NULL UNIQUE,
    deskripsi TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rak (
    id BIGSERIAL PRIMARY KEY,
    ruang_id BIGINT NOT NULL REFERENCES ruang(id) ON DELETE CASCADE,
    kode VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shaf (
    id BIGSERIAL PRIMARY KEY,
    rak_id BIGINT NOT NULL REFERENCES rak(id) ON DELETE CASCADE,
    kode VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_shaf_rak_kode UNIQUE (rak_id, kode)
);

CREATE TABLE boks (
    id BIGSERIAL PRIMARY KEY,
    shaf_id BIGINT NOT NULL REFERENCES shaf(id) ON DELETE CASCADE,
    nomor VARCHAR(10) NOT NULL,
    kapasitas INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_boks_shaf_nomor UNIQUE (shaf_id, nomor)
);

-- ----------------------------------------------------------------
-- 4. TABEL: dokumen
-- ----------------------------------------------------------------
CREATE TABLE dokumen (
    id BIGSERIAL PRIMARY KEY,
    nomor_gu VARCHAR(30) NOT NULL UNIQUE,
    tahun INT NOT NULL,
    nib VARCHAR(20) NOT NULL,
    jenis_dokumen VARCHAR(50) NOT NULL,
    nama_pemilik VARCHAR(100) NOT NULL,
    desa_id BIGINT NOT NULL REFERENCES desa(id),
    boks_id BIGINT NOT NULL REFERENCES boks(id),
    status_fisik VARCHAR(10) NOT NULL DEFAULT 'TERSEDIA'
        CHECK (status_fisik IN ('TERSEDIA', 'DIPINJAM', 'RUSAK', 'HILANG')),
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ----------------------------------------------------------------
-- 5. TABEL: log_aktivitas
-- ----------------------------------------------------------------
CREATE TABLE log_aktivitas (
    id BIGSERIAL PRIMARY KEY,
    dokumen_id BIGINT NOT NULL REFERENCES dokumen(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    aksi VARCHAR(50) NOT NULL,
    detail TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SEEDING DATA MURNI POSTGRESQL (DUMMY REALISTIS BANYUMAS)
-- ================================================================

-- USERS (Password default: admin123 / petugas123 bcrypt)
INSERT INTO users (id, nama, username, password, role, aktif) VALUES
(1, 'Administrator SIPLOK', 'admin', '$2y$12$Dfg0f9pfnqj3Rk4m2wz2uO1Hl43Y0qR0Z/0eM5ZcT0kLgS.Pj5t1e', 'ADMIN', true),
(2, 'Petugas Arsip Hendra', 'hendra', '$2y$12$eY5G9pfnqj3Rk4m2wz2uO1Hl43Y0qR0Z/0eM5ZcT0kLgS.Pj5t1e', 'USER', true),
(3, 'Petugas Arsip Siti', 'siti', '$2y$12$eY5G9pfnqj3Rk4m2wz2uO1Hl43Y0qR0Z/0eM5ZcT0kLgS.Pj5t1e', 'USER', true);

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- KECAMATAN
INSERT INTO kecamatan (id, nama) VALUES
(1, 'Purwokerto Utara'),
(2, 'Purwokerto Selatan'),
(3, 'Purwokerto Timur'),
(4, 'Sokaraja'),
(5, 'Banyumas');

SELECT setval('kecamatan_id_seq', (SELECT MAX(id) FROM kecamatan));

-- DESA
INSERT INTO desa (id, kecamatan_id, nama) VALUES
(1, 1, 'Purwanegara'),
(2, 1, 'Bancarkembar'),
(3, 1, 'Bobosan'),
(4, 1, 'Grendeng'),
(5, 1, 'Sumampir'),
(6, 2, 'Teluk'),
(7, 2, 'Tanjung'),
(8, 2, 'Karangklesem'),
(9, 2, 'Berkoh'),
(10, 2, 'Purwokerto Kidul'),
(11, 3, 'Arcawinangun'),
(12, 3, 'Purwokerto Lor'),
(13, 3, 'Purwokerto Wetan'),
(14, 3, 'Sokanegara'),
(15, 4, 'Sokaraja Lor'),
(16, 4, 'Sokaraja Kidul'),
(17, 4, 'Wiradadi'),
(18, 4, 'Kalikidang'),
(19, 4, 'Jompo'),
(20, 5, 'Banyumas'),
(21, 5, 'Pasinggangan'),
(22, 5, 'Sudagaran'),
(23, 5, 'Kejawar'),
(24, 5, 'Papringan');

SELECT setval('desa_id_seq', (SELECT MAX(id) FROM desa));

-- RUANG ARSIP
INSERT INTO ruang (id, nama, kode, deskripsi) VALUES
(1, 'Ruang Arsip A', 'RA-A', 'Ruang penyimpanan dokumen tahun 2020-2024'),
(2, 'Ruang Arsip B', 'RA-B', 'Ruang penyimpanan dokumen tahun 2015-2019');

SELECT setval('ruang_id_seq', (SELECT MAX(id) FROM ruang));

-- RAK (4 rak per ruang)
INSERT INTO rak (id, ruang_id, kode) VALUES
(1, 1, 'RA-A-01'), (2, 1, 'RA-A-02'), (3, 1, 'RA-A-03'), (4, 1, 'RA-A-04'),
(5, 2, 'RA-B-01'), (6, 2, 'RA-B-02'), (7, 2, 'RA-B-03'), (8, 2, 'RA-B-04');

SELECT setval('rak_id_seq', (SELECT MAX(id) FROM rak));

-- SHAF (3 shaf per rak = 24 shaf)
INSERT INTO shaf (id, rak_id, kode) VALUES
(1, 1, 'SH-01'), (2, 1, 'SH-02'), (3, 1, 'SH-03'),
(4, 2, 'SH-01'), (5, 2, 'SH-02'), (6, 2, 'SH-03'),
(7, 3, 'SH-01'), (8, 3, 'SH-02'), (9, 3, 'SH-03'),
(10, 4, 'SH-01'), (11, 4, 'SH-02'), (12, 4, 'SH-03'),
(13, 5, 'SH-01'), (14, 5, 'SH-02'), (15, 5, 'SH-03'),
(16, 6, 'SH-01'), (17, 6, 'SH-02'), (18, 6, 'SH-03'),
(19, 7, 'SH-01'), (20, 7, 'SH-02'), (21, 7, 'SH-03'),
(22, 8, 'SH-01'), (23, 8, 'SH-02'), (24, 8, 'SH-03');

SELECT setval('shaf_id_seq', (SELECT MAX(id) FROM shaf));

-- BOKS (5 boks per shaf = 120 boks)
DO $$
DECLARE
    s_id INT;
    b_num TEXT;
BEGIN
    FOR s_id IN 1..24 LOOP
        FOR b_idx IN 1..5 LOOP
            b_num := LPAD(b_idx::TEXT, 3, '0');
            INSERT INTO boks (shaf_id, nomor, kapasitas) VALUES (s_id, b_num, 50);
        END LOOP;
    END LOOP;
END $$;

-- DOKUMEN (20 Data Realistis)
INSERT INTO dokumen (id, nomor_gu, tahun, nib, jenis_dokumen, nama_pemilik, desa_id, boks_id, status_fisik, created_by) VALUES
(1,  'GU-0101/2021', 2021, '33020101001', 'Sertipikat', 'Budi Santoso',     1,  1,  'TERSEDIA', 2),
(2,  'GU-0102/2021', 2021, '33020101002', 'Warkah',     'Sri Wahyuni',     2,  2,  'TERSEDIA', 3),
(3,  'GU-0203/2022', 2022, '33020202003', 'GU',         'Ahmad Fauzi',     3,  3,  'TERSEDIA', 1),
(4,  'GU-0204/2022', 2022, '33020202004', 'SU',         'Dewi Rahayu',     4,  4,  'TERSEDIA', 2),
(5,  'GU-0305/2022', 2022, '33020303005', 'Sertipikat', 'Hendra Kusuma',   5,  5,  'TERSEDIA', 3),
(6,  'GU-0306/2023', 2023, '33020303006', 'Warkah',     'Slamet Riyadi',   6,  6,  'TERSEDIA', 2),
(7,  'GU-0407/2023', 2023, '33020404007', 'Sertipikat', 'Siti Aminah',     7,  7,  'TERSEDIA', 1),
(8,  'GU-0408/2023', 2023, '33020404008', 'GU',         'Joko Widodo',     8,  8,  'TERSEDIA', 3),
(9,  'GU-0509/2023', 2023, '33020505009', 'SU',         'Tri Maryati',     9,  9,  'TERSEDIA', 2),
(10, 'GU-0510/2024', 2024, '33020505010', 'Sertipikat', 'Bambang Sugiarto',10, 10, 'TERSEDIA', 1),
(11, 'GU-0611/2024', 2024, '33020102011', 'Warkah',     'Endang Susilowati',11, 11, 'TERSEDIA', 3),
(12, 'GU-0612/2024', 2024, '33020203012', 'GU',         'Agus Prasetyo',   12, 12, 'TERSEDIA', 2),
(13, 'GU-0713/2024', 2024, '33020304013', 'SU',         'Supriyanto',      13, 13, 'TERSEDIA', 1),
(14, 'GU-0714/2024', 2024, '33020405014', 'Sertipikat', 'Ratna Sari',      14, 14, 'TERSEDIA', 3),
(15, 'GU-0815/2024', 2024, '33020501015', 'Warkah',     'Dwi Haryanto',    15, 15, 'TERSEDIA', 2),
(16, 'GU-0816/2023', 2023, '33020103016', 'Sertipikat', 'Nanang Kosim',    16, 16, 'DIPINJAM', 3),
(17, 'GU-0917/2023', 2023, '33020204017', 'GU',         'Wahyu Hidayat',   17, 17, 'DIPINJAM', 1),
(18, 'GU-0918/2024', 2024, '33020301018', 'Warkah',     'Ani Wijayanti',   18, 18, 'DIPINJAM', 2),
(19, 'GU-1019/2020', 2020, '33020402019', 'Sertipikat', 'Sugeng Rawuh',    19, 19, 'RUSAK',    1),
(20, 'GU-1020/2020', 2020, '33020503020', 'Warkah',     'Mulyono',         20, 20, 'RUSAK',    3);

SELECT setval('dokumen_id_seq', (SELECT MAX(id) FROM dokumen));

-- LOG AKTIVITAS (Mutasi & Jejak Audit)
INSERT INTO log_aktivitas (dokumen_id, user_id, aksi, detail, created_at) VALUES
(1, 2, 'TAMBAH_DOKUMEN', 'Dokumen GU-0101/2021 atas nama Budi Santoso ditambahkan ke Ruang Ruang Arsip A → Rak RA-A-01 → Shaf SH-01 → Boks 001', CURRENT_TIMESTAMP - INTERVAL '60 days'),
(2, 3, 'TAMBAH_DOKUMEN', 'Dokumen GU-0102/2021 atas nama Sri Wahyuni ditambahkan ke Ruang Ruang Arsip A → Rak RA-A-01 → Shaf SH-01 → Boks 002', CURRENT_TIMESTAMP - INTERVAL '58 days'),
(3, 1, 'TAMBAH_DOKUMEN', 'Dokumen GU-0203/2022 atas nama Ahmad Fauzi ditambahkan ke Ruang Ruang Arsip A → Rak RA-A-01 → Shaf SH-01 → Boks 003', CURRENT_TIMESTAMP - INTERVAL '56 days'),
(16, 3, 'TAMBAH_DOKUMEN', 'Dokumen GU-0816/2023 atas nama Nanang Kosim ditambahkan ke Ruang Ruang Arsip A → Rak RA-A-04 → Shaf SH-01 → Boks 001', CURRENT_TIMESTAMP - INTERVAL '30 days'),
(16, 3, 'UPDATE_STATUS', 'Status diubah dari TERSEDIA ke DIPINJAM. Keterangan: Dipinjam oleh Seksi Survei untuk pematokan batas', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(17, 1, 'TAMBAH_DOKUMEN', 'Dokumen GU-0917/2023 atas nama Wahyu Hidayat ditambahkan ke Ruang Ruang Arsip A → Rak RA-A-04 → Shaf SH-01 → Boks 002', CURRENT_TIMESTAMP - INTERVAL '28 days'),
(17, 1, 'UPDATE_STATUS', 'Status diubah dari TERSEDIA ke DIPINJAM. Keterangan: Dipinjam Seksi Penetapan Hak dan Pendaftaran', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(18, 2, 'TAMBAH_DOKUMEN', 'Dokumen GU-0918/2024 atas nama Ani Wijayanti ditambahkan ke Ruang Ruang Arsip A → Rak RA-A-04 → Shaf SH-01 → Boks 003', CURRENT_TIMESTAMP - INTERVAL '25 days'),
(18, 2, 'UPDATE_STATUS', 'Status diubah dari TERSEDIA ke DIPINJAM. Keterangan: Validasi warkah sengketa tanah', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(19, 1, 'TAMBAH_DOKUMEN', 'Dokumen GU-1019/2020 atas nama Sugeng Rawuh ditambahkan ke Ruang Ruang Arsip A → Rak RA-A-04 → Shaf SH-01 → Boks 004', CURRENT_TIMESTAMP - INTERVAL '70 days'),
(19, 1, 'UPDATE_STATUS', 'Status diubah dari TERSEDIA ke RUSAK. Keterangan: Kertas rapuh dan robek termakan usia, proses alih media digital', CURRENT_TIMESTAMP - INTERVAL '15 days'),
(20, 3, 'TAMBAH_DOKUMEN', 'Dokumen GU-1020/2020 atas nama Mulyono ditambahkan ke Ruang Ruang Arsip A → Rak RA-A-04 → Shaf SH-01 → Boks 005', CURRENT_TIMESTAMP - INTERVAL '65 days'),
(20, 3, 'UPDATE_STATUS', 'Status diubah dari TERSEDIA ke RUSAK. Keterangan: Tinta warkah pudar akibat kelembaban udara ruang arsip lama', CURRENT_TIMESTAMP - INTERVAL '12 days');
