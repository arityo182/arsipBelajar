<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Album extends Model
{
    use HasFactory;

    protected $table = 'album';

    protected $fillable = [
        'nomor_album',
        'rak_id',
        'tingkat',
        'posisi',
        'kapasitas',
    ];

    protected $casts = [
        'nomor_album' => 'integer',
        'rak_id'      => 'integer',
        'kapasitas'   => 'integer',
    ];

    protected $appends = [
        'terisi',
        'sisa',
    ];

    /**
     * Hitung jumlah dokumen aktif di dalam album ini.
     */
    protected function terisi(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (array_key_exists('dokumens_count', $this->attributes)) {
                    return (int) $this->attributes['dokumens_count'];
                }
                return (int) $this->dokumens()->count();
            }
        );
    }

    /**
     * Hitung sisa slot kapasitas dokumen di dalam album ini.
     */
    protected function sisa(): Attribute
    {
        return Attribute::make(
            get: function () {
                $terisi = $this->terisi;
                $kapasitas = (int) ($this->kapasitas ?: 30);
                $sisa = $kapasitas - $terisi;
                return $sisa > 0 ? $sisa : 0;
            }
        );
    }

    /**
     * Relasi ke Rak tempat album ini disimpan.
     */
    public function rak(): BelongsTo
    {
        return $this->belongsTo(Rak::class, 'rak_id');
    }

    /**
     * Relasi ke seluruh Dokumen di dalam Album ini.
     */
    public function dokumens(): HasMany
    {
        return $this->hasMany(Dokumen::class, 'nomor_album', 'nomor_album');
    }

    /**
     * Alias relasi ke seluruh Dokumen (singular/plural compatibility).
     */
    public function dokumen(): HasMany
    {
        return $this->dokumens();
    }
}
