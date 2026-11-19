<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rak extends Model
{
    use HasFactory;

    protected $table = 'rak';

    protected $fillable = [
        'ruang_id',
        'kode',
    ];

    protected $casts = [
        'ruang_id' => 'integer',
    ];

    /**
     * Relasi ke Ruang penyimpanan induk.
     */
    public function ruang(): BelongsTo
    {
        return $this->belongsTo(Ruang::class, 'ruang_id');
    }

    /**
     * Relasi ke seluruh Shaf di dalam Rak ini.
     */
    public function shafs(): HasMany
    {
        return $this->hasMany(Shaf::class, 'rak_id');
    }
}
