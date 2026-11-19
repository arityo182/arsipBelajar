<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ruang extends Model
{
    use HasFactory;

    protected $table = 'ruang';

    protected $fillable = [
        'nama',
        'kode',
        'deskripsi',
    ];

    /**
     * Relasi ke seluruh Rak yang berada di dalam Ruangan ini.
     */
    public function raks(): HasMany
    {
        return $this->hasMany(Rak::class, 'ruang_id');
    }
}
