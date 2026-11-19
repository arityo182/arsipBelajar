# Alur Logika Sistem (Flowchart) — SIPLOK
## Kantor Pertanahan Kabupaten Banyumas, ATR/BPN
Dokumen ini memetakan 6 diagram alur kerja utama aplikasi SIPLOK menggunakan standar notasi Mermaid (*flowchart*).

---

## 1. Alur Login & Autentikasi Pengguna

Diagram ini menjelaskan alur otentikasi petugas ke dalam sistem menggunakan enkripsi JWT, validasi form Zod, dan penyimpanan sesi ganda (*sessionStorage* + *cookie*).

```mermaid
flowchart TD
    Start(["Mulai"]) --> BukaLogin["Buka Halaman /login"]
    BukaLogin --> InputKredensial["Input Username & Password"]
    InputKredensial --> KlikMasuk["Klik Tombol 'Masuk ke Sistem'"]
    KlikMasuk --> ValidasiZod{"Validasi Format Frontend (Zod)?"}

    ValidasiZod -- "Gagal" --> TampilErrorZod["Tampilkan Pesan Error di Bawah Field Input"]
    TampilErrorZod --> InputKredensial

    ValidasiZod -- "Lolos" --> PostLogin["POST /api/auth/login<br>(Payload: username, password)"]
    PostLogin --> LoadingLogin["Tampilkan Loading Spinner<br>& Disable Tombol"]
    LoadingLogin --> ResponseAuth{"Respons Server 200 OK?"}

    ResponseAuth -- "Tidak (401)" --> TampilErrorAuth["Tampilkan Pesan:<br>'Username atau password salah'"]
    TampilErrorAuth --> InputKredensial

    ResponseAuth -- "Ya (200)" --> SimpanToken["Simpan token ke sessionStorage['siplok_token']<br>& Simpan user ke sessionStorage['siplok_user']"]
    SimpanToken --> SimpanCookie["Sinkronkan Cookie 'siplok_token' & 'siplok_role'<br>(Untuk Next.js Edge Middleware)"]
    SimpanCookie --> ToastSukses["Toast: 'Login berhasil!'"]
    ToastSukses --> RedirectDashboard["Redirect ke Halaman /dashboard"]
    RedirectDashboard --> EndLogin(["Selesai"])
```

---

## 2. Alur Pencarian Dokumen Real-Time

Diagram ini menjelaskan alur pencarian berkas pertanahan dengan proteksi *debounce*, pembatalan request lama via *AbortController*, dan penanganan data kosong.

```mermaid
flowchart TD
    StartSearch(["Mulai"]) --> BukaDashboard["Buka Halaman /dashboard"]
    BukaDashboard --> KetikKataKunci["Petugas Mengetik Kata Kunci<br>(Nomor GU, NIB, atau Nama Pemilik)"]
    KetikKataKunci --> DebounceTimer["Debounce Jeda 300ms<br>(Tunggu Pengguna Selesai Mengetik)"]
    DebounceTimer --> CekPerubahan{"Apakah Kata Kunci Berubah?"}

    CekPerubahan -- "Ya" --> ResetPage["Reset Halaman ke Page 1"]
    CekPerubahan -- "Tidak" --> AbortReq["Batalkan Request Sebelumnya<br>(AbortController.abort)"]

    ResetPage --> AbortReq
    AbortReq --> FetchDokumen["GET /api/dokumen?search={q}&page={p}"]
    FetchDokumen --> TampilSkeleton["Tampilkan Animasi SkeletonTable"]
    TampilSkeleton --> CekStatusResponse{"Respons Server 200 OK?"}

    CekStatusResponse -- "Gagal (500)" --> ToastError["Toast: 'Gagal memuat data dokumen'"]
    ToastError --> EndSearch(["Selesai"])

    CekStatusResponse -- "Sukses (200)" --> CekAdaData{"Apakah Data Ditemukan?"}
    CekAdaData -- "Kosong (0 item)" --> RenderEmptyState["Tampilkan Komponen EmptyState<br>'Dokumen Tidak Ditemukan'"]
    RenderEmptyState --> EndSearch

    CekAdaData -- "Ada Data" --> RenderTabel["Render Baris Tabel Dokumen<br>+ LokasiDisplay Compact<br>+ Pagination di Bawah"]
    RenderTabel --> InteraksiPengguna{"Aksi Pengguna?"}

    InteraksiPengguna -- "Klik Ganti Halaman" --> GantiHalaman["Pilih Halaman Baru"]
    GantiHalaman --> FetchDokumen

    InteraksiPengguna -- "Klik Icon Mata" --> BukaDetail["Buka DokumenDetailModal<br>(Slide-in Right Drawer)"]
    BukaDetail --> EndSearch

    InteraksiPengguna -- "Klik Icon Panah" --> BukaPindah["Buka PindahRakModal"]
    BukaPindah --> EndSearch
```

---

## 3. Alur Tambah Dokumen Baru & Pin Lokasi

Diagram ini menjelaskan proses penambahan berkas baru, verifikasi keunikan nomor GU secara real-time, seleksi lokasi bertingkat, dan fungsi *Pin Lokasi*.

```mermaid
flowchart TD
    StartAdd(["Mulai"]) --> KlikTambah["Klik Menu 'Tambah Dokumen' (/dokumen/tambah)"]
    KlikTambah --> IsiForm["Petugas Mengisi Formulir Dokumen"]
    IsiForm --> KetikGU["Input Nomor GU (Contoh: GU-0124/2024)"]
    KetikGU --> DebounceGU["Debounce 500ms"]
    DebounceGU --> CekGUAjax["GET /dokumen/check-gu?nomor_gu={val}"]

    CekGUAjax --> ResponseCekGU{"Nomor GU Sudah Ada?"}
    ResponseCekGU -- "Ya (exists=true)" --> WarningMerah["Tampilkan Indikator Merah:<br>'Nomor GU ini sudah terdaftar!'"]
    ResponseCekGU -- "Tidak (exists=false)" --> KonfirmHijau["Tampilkan Indikator Hijau:<br>'✓ Nomor GU tersedia'"]

    WarningMerah --> IsiForm
    KonfirmHijau --> PilihWilayah["Pilih Kecamatan & Desa"]
    PilihWilayah --> CascadingLokasi["Pilih Lokasi Bertingkat:<br>Ruang → Rak → Shaf → Boks"]
    CascadingLokasi --> CekKapasitasBoks{"Kapasitas Boks Tujuan?"}

    CekKapasitasBoks -- "Penuh (50/50)" --> BoksPenuh["Kunci Pilihan (Disabled)<br>+ Label Merah: PENUH"]
    BoksPenuh --> CascadingLokasi

    CekKapasitasBoks -- "Tersedia" --> InfoSlot["Tampilkan Progress Bar Kapasitas<br>& Sisa Slot Dokumen"]
    InfoSlot --> TogglePin{"Centang Kunci/Pin Lokasi?"}

    TogglePin -- "Ya" --> SimpanPinSession["Simpan ke sessionStorage['siplok_pin_lokasi'] = true"]
    TogglePin -- "Tidak" --> UnpinSession["Simpan ke sessionStorage['siplok_pin_lokasi'] = false"]

    SimpanPinSession --> KlikSimpan["Klik Tombol 'Simpan Dokumen ke Lokasi'"]
    UnpinSession --> KlikSimpan

    KlikSimpan --> ValidasiForm{"Validasi Zod Lolos?"}
    ValidasiForm -- "Ada Error" --> TampilErrorField["Tampilkan Error Merah per Field"]
    TampilErrorField --> IsiForm

    ValidasiForm -- "Lolos" --> PostDokumen["POST /api/dokumen<br>(Dalam Transaksi DB ACID)"]
    PostDokumen --> HasilPost{"Status Simpan?"}

    HasilPost -- "Gagal (422/500)" --> ToastGagal["Toast Error Server"]
    ToastGagal --> IsiForm

    HasilPost -- "Sukses (201)" --> CatatLog["Backend Otomatis Catat Log:<br>'TAMBAH_DOKUMEN'"]
    CatatLog --> ToastSukses["Toast: 'Dokumen berhasil disimpan!'"]
    ToastSukses --> EvaluasiPin{"Apakah Pin Lokasi Aktif?"}

    EvaluasiPin -- "Ya" --> ResetParsial["Reset Field Dokumen Saja<br>(Pertahankan Ruang, Rak, Shaf, Boks)"]
    ResetParsial --> IsiForm

    EvaluasiPin -- "Tidak" --> RedirectDash["Redirect ke /dashboard"]
    RedirectDash --> EndAdd(["Selesai"])
```

---

## 4. Alur Pindah Rak Dokumen

Diagram ini menggambarkan mutasi pemindahan dokumen ke boks baru yang disertai validasi kapasitas dan pencatatan alasan pemindahan.

```mermaid
flowchart TD
    StartPindah(["Mulai"]) --> BukaModal["Buka PindahRakModal dari Tabel atau Drawer"]
    BukaModal --> TampilLokasiLama["Tampilkan Lokasi Fisik Saat Ini<br>(Kotak Abu Read-Only)"]
    TampilLokasiLama --> PilihLokasiBaru["Pilih Lokasi Tujuan Baru via<br>CascadingLokasiSelect"]
    PilihLokasiBaru --> ValidasiKapasitas{"Boks Tujuan Penuh?"}

    ValidasiKapasitas -- "Ya (sisa=0)" --> KunciTombol["Nonaktifkan Tombol Simpan<br>& Tampilkan Pesan Boks Penuh"]
    KunciTombol --> PilihLokasiBaru

    ValidasiKapasitas -- "Tersedia" --> IsiAlasan["Isi Alasan Pemindahan di Textarea<br>(Contoh: Reorganisasi rak warkah)"]
    IsiAlasan --> ValidasiAlasan{"Panjang Alasan ≥ 10 Karakter?"}

    ValidasiAlasan -- "Kurang" --> WarningKarakter["Tampilkan Pesan:<br>'Alasan minimal 10 karakter'"]
    WarningKarakter --> IsiAlasan

    ValidasiAlasan -- "Cukup" --> KlikSimpanPindah["Klik Tombol 'Simpan Pemindahan'"]
    KlikSimpanPindah --> PatchPindah["PATCH /api/dokumen/{id}/pindah<br>(Payload: boks_id_baru, alasan)"]
    PatchPindah --> LoadingPindah["Loading Spinner Transaksi"]

    LoadingPindah --> ResponsePindah{"Respons Server 200 OK?"}
    ResponsePindah -- "Gagal" --> ToastErrorPindah["Toast: Pesan Kesalahan API"]
    ToastErrorPindah --> IsiAlasan

    ResponsePindah -- "Sukses (200)" --> CatatLogPindah["Backend Catat Log Aktivitas:<br>'PINDAH_RAK'"]
    CatatLogPindah --> ToastSuksesPindah["Toast: 'Dokumen berhasil dipindah'"]
    ToastSuksesPindah --> TutupModal["Tutup PindahRakModal & Refresh Data Tabel"]
    TutupModal --> EndPindah(["Selesai"])
```

---

## 5. Alur Update Status Fisik Dokumen

Diagram ini menjelaskan alur pengubahan status fisik warkah (*TERSEDIA*, *DIPINJAM*, *RUSAK*, *HILANG*) saat dokumen dipinjam antar seksi dinas.

```mermaid
flowchart TD
    StartStatus(["Mulai"]) --> BukaDrawer["Buka DokumenDetailModal"]
    BukaDrawer --> KlikStatus["Klik Tombol 'Status'"]
    KlikStatus --> TampilDialogStatus["Tampilkan Dialog Pilihan Status Fisik"]
    TampilDialogStatus --> PilihStatus["Pilih Status Baru:<br>(TERSEDIA / DIPINJAM / RUSAK / HILANG)"]
    PilihStatus --> InputKeterangan["Isi Keterangan Tambahan (Opsional)<br>Misal: 'Dipinjam Seksi Survei untuk validasi batas'"]
    InputKeterangan --> KlikSimpanStatus["Klik Tombol 'Simpan Status'"]

    KlikSimpanStatus --> PatchStatus["PATCH /api/dokumen/{id}/status<br>(Payload: status_fisik, keterangan)"]
    PatchStatus --> ResponseStatus{"Respons Server 200 OK?"}

    ResponseStatus -- "Gagal" --> ToastGagalStatus["Toast: Gagal Memperbarui Status"]
    ToastGagalStatus --> TampilDialogStatus

    ResponseStatus -- "Sukses (200)" --> CatatLogStatus["Backend Catat Log Aktivitas:<br>'UPDATE_STATUS'"]
    CatatLogStatus --> UpdateBadge["Perbarui Badge Warna Status di Drawer & Tabel"]
    UpdateBadge --> ToastSuksesStatus["Toast: 'Status berhasil diperbarui'"]
    ToastSuksesStatus --> EndStatus(["Selesai"])
```

---

## 6. Alur Administrator Kelola Pengguna

Diagram ini menjelaskan tata cara Administrator dalam menambah petugas baru, menonaktifkan akun staf dengan konfirmasi modal, dan mereset kata sandi acak.

```mermaid
flowchart TD
    StartAdmin(["Mulai"]) --> AksesAdmin["Admin Mengakses Menu /admin/users"]
    AksesAdmin --> CekRoleAdmin{"Apakah Role Pengguna === 'ADMIN'?"}

    CekRoleAdmin -- "Bukan ADMIN" --> TolakAkses["Next.js Edge Middleware Tolak Rute<br>Redirect ke /dashboard?error=forbidden"]
    TolakAkses --> EndAdmin(["Selesai"])

    CekRoleAdmin -- "ADMIN" --> TampilTabelUser["Tampilkan Tabel Daftar Staf Kantor Pertanahan"]
    TampilTabelUser --> PilihanAksi{"Pilihan Aksi Admin?"}

    %% Cabang 1: Tambah Pengguna
    PilihanAksi -- "Tambah Pengguna" --> KlikBtnTambah["Klik 'Tambah Pengguna Baru'"]
    KlikBtnTambah --> IsiModalUser["Isi Formulir: Nama, Username, Password, Role"]
    IsiModalUser --> PostUser["POST /api/admin/users"]
    PostUser --> HasilUser{"Respons 201?"}
    HasilUser -- "Gagal" --> ErrorFormUser["Tampilkan Error Validasi di Modal"]
    ErrorFormUser --> IsiModalUser
    HasilUser -- "Sukses" --> ToastUser["Toast: 'User berhasil ditambahkan'"]
    ToastUser --> RefreshTabel["Tutup Modal & Refresh Tabel Pengguna"]

    %% Cabang 2: Toggle Status Aktif
    PilihanAksi -- "Ubah Status Aktif" --> KlikToggle["Klik Tombol Nonaktifkan/Aktifkan"]
    KlikToggle --> CekSelfToggle{"Apakah Akun Sendiri?"}
    CekSelfToggle -- "Ya (Self)" --> DisabledBtn["Tombol Disabled (Anti-Self-Deactivation)"]
    DisabledBtn --> TampilTabelUser
    CekSelfToggle -- "Bukan Diri Sendiri" --> MunculModalConfirm["Tampilkan ConfirmModal:<br>'Apakah Anda yakin ingin menonaktifkan staf ini?'"]
    MunculModalConfirm --> KonfirmasiToggle{"Admin Klik Konfirmasi?"}
    KonfirmasiToggle -- "Batal" --> TutupConfirm["Tutup Modal Tanpa Aksi"]
    KonfirmasiToggle -- "Ya" --> PatchToggle["PATCH /api/admin/users/{id}<br>{ aktif: false/true }"]
    PatchToggle --> ToastToggle["Toast: 'Status akun berhasil diubah'"]
    ToastToggle --> RefreshTabel

    %% Cabang 3: Reset Kata Sandi
    PilihanAksi -- "Reset Kata Sandi" --> KlikKunci["Klik Icon Kunci pada Baris Staf"]
    KlikKunci --> PostReset["POST /api/admin/users/{id}/reset-password"]
    PostReset --> GenerateRandom["Backend Generate 8 Karakter Acak & Hash"]
    GenerateRandom --> TampilModalPassword["Tampilkan Modal Hasil Reset:<br>'Password Baru: aB3xK9mZ'"]
    TampilModalPassword --> SalinPassword["Admin Menyalin Password & Menyerahkan ke Staf"]
    SalinPassword --> RefreshTabel

    RefreshTabel --> EndAdmin
```
