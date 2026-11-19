<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Boks extends Model
{
    use HasFactory;

    protected $table = 'boks';

    protected $fillable = [
        'shaf_id',
        'nomor',
        'kapasitas',
    ];

    protected $casts = [
        'shaf_id' => 'integer',
        'kapasitas' => 'integer',
    ];

    protected $appends = [
        'terisi',
        'sisa',
    ];

    /**
     * Hitung jumlah dokumen aktif di dalam boks ini.
     */
    protected function terisi(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Gunakan relasi count jika sudah di-eager load withCount, jika tidak query langsung
                if (array_key_exists('dokumens_count', $this->attributes)) {
                    return (int) $this->attributes['dokumens_count'];
                }
                return (int) $this->dokumens()->count();
            }
        );
    }

    /**
     * Hitung sisa slot kapasitas dokumen di dalam boks ini.
     */
    protected function sisa(): Attribute
    {
        return Attribute::make(
            get: function () {
                $terisi = $this->terisi;
                $kapasitas = (int) $this->kapasitas;
                $sisa = $kapasitas - $terisi;
                return $sisa > 0 ? $sisa : 0;
            }
        );
    }

    /**
     * Relasi ke Shaf tempat boks ini disimpan.
     */
    public function shaf(): BelongsTo
    {
        return $this->belongsTo(Shaf::class, 'shaf_id');
    }

    /**
     * Relasi ke seluruh Dokumen yang tersimpan di dalam Boks ini.
     */
    public function dokumens(): HasMany
    {
        return $this->hasMany(Dokumen::class, 'boks_id');
    }
}
