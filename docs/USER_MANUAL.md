# Panduan Pengguna Aplikasi (User Manual) — SIPLOK
## Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
Petunjuk Operasional Standar (SOP) Digitalisasi & Pelacakan Lokasi Fisik Dokumen Pertanahan

---

## BAGIAN A: Panduan untuk Petugas Arsip (Role USER)

### A.1 Masuk ke Sistem (Login)
1. Buka peramban web (Google Chrome atau Mozilla Firefox) pada komputer meja kerja Anda.
2. Akses alamat web SIPLOK: `http://localhost:3000` (atau tautan intranet dinas).
3. Pada halaman beranda, klik tombol **"Masuk ke Sistem"**.
4. Masukkan **Username** dan **Kata Sandi** resmi Anda.
5. Klik tombol **"Masuk ke SIPLOK"**.
6. Sistem akan memverifikasi akun Anda dan mengarahkan Anda langsung ke halaman utama Dashboard Pencarian.
> *Catatan Keamanan:* Jangan membagikan kata sandi Anda kepada orang lain. Jika Anda lupa kata sandi, hubungi Administrator Subbagian Tata Usaha untuk meminta reset kata sandi.

---

### A.2 Mencari Dokumen Fisik Secara Cepat
Pada halaman Dashboard, kotak pencarian utama berada di bagian atas:
1. Klik pada bilah pencarian: *"Ketik Nomor GU, NIB, atau Nama Pemilik..."*.
2. Anda dapat mencari berdasarkan salah satu dari tiga kata kunci:
   * **Nomor Gambar Ukur (GU):** Ketik misalnya `GU-0101` atau `0101/2021`.
   * **Nomor Induk Bidang (NIB):** Ketik 11 digit angka bidang tanah (contoh: `33020101001`).
   * **Nama Pemilik Hak:** Ketik nama warga pemilik tanah (contoh: `Budi Santoso` atau `Siti`).
3. **Pencarian Real-Time Otomatis:** Anda **tidak perlu menekan tombol Enter**. Cukup berhenti mengetik selama sekejap (300 milidetik), sistem akan langsung menampilkan daftar berkas yang cocok di tabel bawah.
4. Kolom **"Lokasi Fisik"** pada tabel akan langsung menunjukkan posisi penyimpanan (contoh: `📍 Ruang Arsip A → Rak RA-A-01 → Shaf SH-01 → Boks 001`).

---

### A.3 Melihat Detail Lengkap Dokumen & Kapasitas Boks
1. Temukan dokumen yang dicari pada tabel daftar dokumen.
2. Pada kolom paling kanan (Aksi), klik **icon Mata (👁)**.
3. Sebuah panel drawer informatif akan meluncur dari sisi kanan layar:
   * **Seksi 1 (Informasi Dokumen):** Memuat NIB, Tahun terbit, Jenis Dokumen, Nama Pemegang Hak, serta Desa dan Kecamatan objek tanah.
   * **Seksi 2 (Kotak Lokasi Fisik):** Menampilkan kotak kuning emas mencolok dengan hierarki vertikal Ruang $\rightarrow$ Rak $\rightarrow$ Shaf $\rightarrow$ Boks, lengkap dengan tombol **"Salin"** untuk menyalin koordinat lokasi ke papan klip.
   * **Progress Bar Kapasitas Boks:** Menunjukkan tingkat keterisian boks penyimpanan dokumen tersebut (misal: *32 dari 50 dokumen terisi*).
   * **Seksi 3 (Riwayat Mutasi):** Garis waktu riwayat pemindahan berkas dan perubahan status yang pernah terjadi pada dokumen tersebut.

---

### A.4 Mendaftarkan Dokumen Fisik Baru
Saat berkas warkah atau Gambar Ukur baru selesai divalidasi dan siap dimasukkan ke lemari arsip:
1. Klik menu **"Tambah Dokumen"** pada bilah navigasi kiri.
2. **Isi Data Dokumen (Kolom Kiri):**
   * **Nomor GU:** Masukkan nomor Gambar Ukur. Sistem akan memvalidasi secara otomatis:
     * *Indikator Hijau (✓ Nomor GU tersedia):* Nomor dapat digunakan.
     * *Indikator Merah (Nomor GU sudah terdaftar!):* Nomor sudah ada di sistem, cegah duplikasi.
   * **Tahun:** Masukkan tahun penerbitan dokumen (default tahun saat ini).
   * **NIB:** Masukkan 11 digit nomor identifikasi bidang tanah (hanya digit angka).
   * **Jenis Dokumen:** Pilih salah satu (*Sertipikat, GU, SU, Warkah, IPT, atau Lainnya*).
   * **Nama Pemilik:** Masukkan nama lengkap pemegang hak tanah.
   * **Kecamatan & Desa:** Pilih kecamatan di Kabupaten Banyumas terlebih dahulu, lalu pilih nama desa/kelurahan.
3. **Pilih Koordinat Lokasi Fisik (Kolom Kanan):**
   * Pilih **Ruang Arsip** $\rightarrow$ Pilih **Rak** $\rightarrow$ Pilih **Shaf** $\rightarrow$ Pilih **Boks Arsip**.
   * Perhatikan label pada boks: Boks yang bertuliskan *PENUH (50/50)* tidak dapat dipilih. Pilih boks yang masih memiliki sisa slot kosong.
4. **Fitur Kunci Lokasi (Pin Lokasi):**
   * Jika Anda sedang menata atau memasukkan puluhan warkah ke dalam satu boks yang sama secara beruntun, **centang kotak "Kunci lokasi ini untuk input berikutnya"**.
   * Dengan fitur ini aktif, setelah Anda menekan tombol simpan, formulir identitas dokumen akan bersih kembali, namun pilihan Ruang, Rak, Shaf, dan Boks tetap terkunci sehingga Anda tidak perlu memilih ulang berkali-kali.
5. Klik tombol **"Simpan Dokumen ke Lokasi"**.

---

### A.5 Memindahkan Dokumen ke Rak atau Boks Lain (Mutasi)
Jika berkas ditata ulang, dipindahkan karena boks lama penuh, atau dipindahkan ke ruang arsip inaktif:
1. Pada tabel dokumen atau pada drawer detail dokumen, klik tombol **"Pindah Rak" (icon panah ➡️)**.
2. Jendela dialog pemindahan akan muncul:
   * Bagian atas menampilkan **Lokasi Saat Ini**.
   * Bagian bawah meminta Anda memilih **Lokasi Tujuan Baru** menggunakan dropdown bertingkat.
3. **Alasan Pemindahan (Wajib Diisi):**
   * Tuliskan alasan resmi pemindahan pada kotak teks minimal 10 karakter (contoh: *Penataan ulang lemari warkah tahun 2021* atau *Pemisahan berkas sengketa perdata*).
4. Klik tombol **"Simpan Pemindahan"**.
5. Sistem akan memperbarui lokasi fisik dokumen dan secara otomatis mencatat peristiwa ini ke dalam riwayat audit aktivitas.

---

### A.6 Mencetak Label Kartu Kendali Fisik
1. Buka drawer detail dokumen yang bersangkutan (klik icon Mata).
2. Klik tombol **"Label" (icon Printer 🖨️)**.
3. Jendela pratinjau cetak peramban (*Print Preview*) akan terbuka secara otomatis:
   * Format cetak telah disesuaikan berukuran A5/kartu kendali bergaris tebal hitam putih.
   * Menampilkan kop resmi Kantor Pertanahan Banyumas, QR Code, dan kotak lokasi fisik berhuruf ekstra besar.
4. Pilih printer label atau printer kantor Anda, lalu klik **Cetak (Print)**.
5. Gunting dan tempelkan label pada map warkah atau gantungkan pada sekat boks arsip.

---

## BAGIAN B: Panduan untuk Administrator (Role ADMIN)

### B.1 Mengelola Akun Staf Petugas (`/admin/users`)
1. Klik menu **"Kelola Pengguna"** pada bilah navigasi kiri.
2. **Menambah Petugas Baru:**
   * Klik tombol **"Tambah Pengguna Baru"** di sudut kanan atas.
   * Masukkan Nama Lengkap, Username unik staf, Kata Sandi Awal (minimal 8 karakter), serta Peran (*USER* untuk petugas loket/arsip, atau *ADMIN* untuk supervisor TU).
   * Klik **"Simpan Pengguna"**.
3. **Menonaktifkan / Mengaktifkan Kembali Akun Staf:**
   * Pada tabel pengguna, klik tombol **"Nonaktifkan"** pada baris staf yang telah mutasi atau purnatugas.
   * Konfirmasi pada jendela dialog. Akun yang dinonaktifkan tidak akan dapat login kembali.
   * *Proteksi Anti-Kunci Diri:* Administrator **tidak dapat** menonaktifkan akunnya sendiri demi mencegah terkuncinya sistem secara permanen.
4. **Mereset Kata Sandi Petugas yang Lupa:**
   * Klik **icon Kunci (🔑)** pada baris staf yang bersangkutan.
   * Sistem akan menghasilkan kata sandi acak baru (contoh: `k8XmB3pQ`).
   * Salin dan serahkan kata sandi tersebut secara langsung kepada petugas. Kata sandi ini hanya ditampilkan sekali demi keamanan.

---

### B.2 Meninjau Audit Trail Log Aktivitas (`/admin/logs`)
1. Klik menu **"Log Aktivitas"** pada bilah navigasi kiri.
2. Administrator dapat memantau seluruh peristiwa operasional:
   * Siapa petugas yang menambahkan dokumen baru.
   * Kapan suatu berkas dipindahkan beserta alasan pemindahannya.
   * Kapan status fisik berkas diubah menjadi *DIPINJAM* beserta nama seksi peminjam.
3. Gunakan bilah pencarian untuk mencari Nomor GU tertentu atau nama petugas tertentu.
4. Gunakan tab filter (*Semua Aksi*, *Tambah Dokumen*, *Pindah Rak*, *Update Status*) untuk memfilter kategori tertentu.
5. Klik tautan **"Selengkapnya"** pada kolom rincian untuk membaca catatan mutasi secara lengkap.

---

### B.3 Memantau Master Tata Letak Lokasi Fisik (`/admin/lokasi`)
1. Klik menu **"Master Lokasi"** pada bilah navigasi kiri.
2. Gunakan 4 tab navigasi untuk meninjau sarana ruang penyimpanan:
   * **Tab 1 (Ruang Arsip):** Menampilkan daftar ruangan (Ruang Arsip A, B) beserta kode dan deskripsi peruntukan tahun warkah.
   * **Tab 2 (Rak Lemari):** Menampilkan inventarisasi lemari rak besi.
   * **Tab 3 (Shaf / Ambalan):** Menampilkan baris ambalan pada masing-masing lemari.
   * **Tab 4 (Boks Arsip):** Menampilkan kapasitas boks, status keterisian dokumen, dan tanda visual merah jika boks telah penuh (*50/50*).

---

## BAGIAN C: FAQ (Pertanyaan yang Sering Diajukan)

**Q1: Mengapa nomor GU yang saya input ditandai merah dan muncul tulisan "Nomor GU sudah terdaftar"?**  
*Jawaban:* Sistem SIPLOK mencegah adanya duplikasi nomor berkas. Nomor GU tersebut sudah pernah diinput sebelumnya ke dalam sistem. Silakan periksa kembali berkas fisik Anda atau cari nomor GU tersebut di Dashboard untuk memastikan lokasinya.

**Q2: Bagaimana jika boks arsip yang saya tuju berstatus disabled (tidak bisa diklik)?**  
*Jawaban:* Hal ini menandakan boks tersebut telah terisi penuh sebanyak 50 dokumen (standar kapasitas boks arsip BPN). Silakan pilih nomor boks berikutnya pada shaf yang sama atau buat boks baru.

**Q3: Kapan saya harus menggunakan tombol "Pin Lokasi"?**  
*Jawaban:* Gunakan tombol Pin Lokasi ketika Anda menerima satu bundel warkah dalam jumlah banyak (misalnya 20 berkas dari satu desa hasil program PTSL) yang seluruhnya akan dimasukkan ke dalam boks arsip yang sama. Ini menghemat waktu Anda memilih Ruang, Rak, dan Boks berulang kali.

**Q4: Apakah saya bisa menghapus dokumen yang salah diinput?**  
*Jawaban:* Dokumen yang telah diinput dilindungi oleh sistem audit trail dan *soft delete*. Hubungi Administrator jika ada kesalahan fatal agar dapat diverifikasi secara fisik sebelum dilakukan pembatalan.

**Q5: Apa yang harus saya lakukan saat Seksi Survei meminjam warkah untuk keperluan pengukuran ulang?**  
*Jawaban:* Buka detail dokumen yang bersangkutan, klik tombol **"Status"**, ubah status fisik menjadi **DIPINJAM**, dan tuliskan keterangan: *"Dipinjam Seksi Survei untuk peninjauan batas bidang tanah (Petugas: Bapak Hendra)"*. Dengan demikian, juru arsip lain mengetahui keberadaan fisik berkas tersebut.

**Q6: Apakah aplikasi SIPLOK membutuhkan koneksi internet?**  
*Jawaban:* Tidak. Aplikasi ini terpasang pada jaringan lokal (*LAN intranet*) Kantor Pertanahan Kabupaten Banyumas. Selama komputer Anda terhubung ke jaringan kabel atau Wi-Fi kantor pertanahan, aplikasi dapat diakses tanpa kuota internet.

**Q7: Berapa lama sesi login saya bertahan jika komputer ditinggal istirahat siang?**  
*Jawaban:* Token login Anda berlaku selama 8 jam kerja (480 menit). Jika sesi telah berakhir, sistem akan mengarahkan Anda kembali ke halaman login secara aman.

**Q8: Mengapa tombol "Nonaktifkan" tidak dapat diklik pada akun saya sendiri di menu Kelola Pengguna?**  
*Jawaban:* Sistem memiliki proteksi *anti-self-deactivation*. Administrator tidak diizinkan menonaktifkan akunnya sendiri agar sistem tidak kehilangan administrator aktif.

**Q9: Apakah kartu kendali fisik hasil cetak harus menggunakan kertas khusus?**  
*Jawaban:* Tidak harus. Anda dapat mencetak pada kertas HVS standar ukuran A5 atau memotong kertas A4 menjadi dua bagian, kemudian menyematkannya pada map warkah menggunakan klip kertas.

**Q10: Siapa yang harus saya hubungi jika server SIPLOK tidak dapat dibuka di peramban?**  
*Jawaban:* Hubungi Petugas Pengelola TI / Subbagian Tata Usaha Kantor Pertanahan Kabupaten Banyumas melalui ekstensi telepon internal dinas untuk memeriksa status server kontainer Docker.
