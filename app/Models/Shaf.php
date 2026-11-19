<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shaf extends Model
{
    use HasFactory;

    protected $table = 'shaf';

    protected $fillable = [
        'rak_id',
        'kode',
    ];

    protected $casts = [
        'rak_id' => 'integer',
    ];

    /**
     * Relasi ke Rak tempat shaf ini berada.
     */
    public function rak(): BelongsTo
    {
        return $this->belongsTo(Rak::class, 'rak_id');
    }

    /**
     * Relasi ke seluruh Boks yang terletak pada Shaf ini.
     */
    public function bokses(): HasMany
    {
        return $this->hasMany(Boks::class, 'shaf_id');
    }

    /**
     * Alias singular relasi boks.
     */
    public function boks(): HasMany
    {
        return $this->hasMany(Boks::class, 'shaf_id');
    }
}
