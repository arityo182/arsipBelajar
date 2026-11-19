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
        'nomor_gu',
        'tahun',
        'nib',
        'jenis_dokumen',
        'nama_pemilik',
        'desa_id',
        'boks_id',
        'status_fisik',
        'created_by',
    ];

    protected $casts = [
        'tahun' => 'integer',
        'desa_id' => 'integer',
        'boks_id' => 'integer',
        'created_by' => 'integer',
    ];

    /**
     * Appends accessors to array form.
     */
    protected $appends = [
        'lokasi_lengkap',
    ];

    /**
     * Accessor untuk string lokasi lengkap dokumen fisik.
     * Format: "Ruang {ruang.nama} → Rak {rak.kode} → Shaf {shaf.kode} → Boks {boks.nomor}"
     */
    protected function lokasiLengkap(): Attribute
    {
        return Attribute::make(
            get: function () {
                $boks = $this->boks;
                if (!$boks) {
                    return 'Lokasi Belum Ditentukan';
                }

                $shaf = $boks->shaf;
                $rak = $shaf ? $shaf->rak : null;
                $ruang = $rak ? $rak->ruang : null;

                $ruangNama = '-';
                if ($ruang) {
                    $ruangNama = str_starts_with($ruang->nama, 'Ruang')
                        ? $ruang->nama
                        : "Ruang {$ruang->nama}";
                }
                $rakKode   = $rak ? $rak->kode : '-';
                $shafKode  = $shaf ? $shaf->kode : '-';
                $boksNomor = $boks->nomor ?? '-';

                return "{$ruangNama} → Rak {$rakKode} → Shaf {$shafKode} → Boks {$boksNomor}";
            }
        );
    }

    /**
     * Relasi ke Desa tempat objek tanah berada.
     */
    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class, 'desa_id');
    }

    /**
     * Relasi ke Boks tempat dokumen fisik disimpan.
     */
    public function boks(): BelongsTo
    {
        return $this->belongsTo(Boks::class, 'boks_id');
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
