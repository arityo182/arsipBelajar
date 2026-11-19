<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Desa extends Model
{
    use HasFactory;

    protected $table = 'desa';

    protected $fillable = [
        'kecamatan_id',
        'nama',
    ];

    protected $casts = [
        'kecamatan_id' => 'integer',
    ];

    /**
     * Relasi ke Kecamatan induk.
     */
    public function kecamatan(): BelongsTo
    {
        return $this->belongsTo(Kecamatan::class, 'kecamatan_id');
    }

    /**
     * Relasi ke seluruh Dokumen pertanahan di desa ini.
     */
    public function dokumens(): HasMany
    {
        return $this->hasMany(Dokumen::class, 'desa_id');
    }
}
