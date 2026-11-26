<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Dokumen extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'dokumen';

    protected $fillable = [
        'nomor_di302',
        'nomor_album',
        'nomor_urut',
        'tanggal_masuk',
        'tahun',
        'nama_pemohon',
        'jenis_permohonan',
        'desa_id',
        'kecamatan_id',
        'rak_id',
        'tingkat',
        'posisi',
        'keterangan',
        'catatan',
        'status_fisik',
        'status_berkas',
    ];

    protected $casts = [
        'nomor_album'   => 'integer',
        'nomor_urut'    => 'integer',
        'tahun'         => 'integer',
        'tanggal_masuk' => 'date',
        'desa_id'       => 'integer',
        'kecamatan_id'  => 'integer',
        'rak_id'        => 'integer',
        'created_by'    => 'integer',
    ];

    /**
     * Appends accessors to array form.
     */
    protected $appends = [
        'lokasi_lengkap',
        'status_label',
    ];

    /**
     * Accessor untuk string lokasi lengkap dokumen fisik.
     * Format: "Rak E → Tingkat 1 → Album 1 (Urut #1)"
     */
    protected function lokasiLengkap(): Attribute
    {
        return Attribute::make(
            get: function () {
                $rakKode = $this->rak ? $this->rak->kode : ($this->album && $this->album->rak ? $this->album->rak->kode : '-');
                $tingkat = $this->tingkat ?: ($this->album ? $this->album->tingkat : null);
                $nomorAlbum = $this->nomor_album ?: '-';

                $lokasi = "Rak {$rakKode}";
                if ($tingkat) {
                    $lokasi .= " → Tingkat {$tingkat}";
                }
                $lokasi .= " → Album {$nomorAlbum}";

                if ($this->nomor_urut) {
                    $lokasi .= " (Urut #{$this->nomor_urut})";
                }

                return $lokasi;
            }
        );
    }

    /**
     * Accessor status label bahasa Indonesia.
     */
    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: function () {
                $status = $this->status_fisik ?: $this->status_berkas;
                return match ($status) {
                    'TERSEDIA' => 'Tersedia di Album',
                    'HILANG'   => 'Fisik Belum Ditemukan',
                    'DIPINJAM' => 'Sedang Dipinjam',
                    'RUSAK'    => 'Dalam Perbaikan Fisik',
                    default    => 'Tersedia di Album',
                };
            }
        );
    }

    /**
     * Relasi ke Album fisik.
     */
    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class, 'nomor_album', 'nomor_album');
    }

    /**
     * Relasi ke Rak penyimpanan.
     */
    public function rak(): BelongsTo
    {
        return $this->belongsTo(Rak::class, 'rak_id');
    }

    /**
     * Relasi ke Desa tempat objek tanah berada.
     */
    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class, 'desa_id');
    }

    /**
     * Relasi ke Kecamatan.
     */
    public function kecamatan(): BelongsTo
    {
        return $this->belongsTo(Kecamatan::class, 'kecamatan_id');
    }

    /**
     * Relasi ke User yang menginput dokumen ini.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relasi ke seluruh riwayat mutasi dan aktivitas dokumen.
     */
    public function logAktivitas(): HasMany
    {
        return $this->hasMany(LogAktivitas::class, 'dokumen_id')->orderBy('created_at', 'desc');
    }
}
