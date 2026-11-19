<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogAktivitas extends Model
{
    use HasFactory;

    protected $table = 'log_aktivitas';

    /**
     * Tabel ini hanya memiliki created_at tanpa updated_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'dokumen_id',
        'user_id',
        'aksi',
        'detail',
        'created_at',
    ];

    protected $casts = [
        'dokumen_id' => 'integer',
        'user_id' => 'integer',
        'created_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->created_at)) {
                $model->created_at = now();
            }
        });
    }

    /**
     * Relasi ke Dokumen terkait.
     */
    public function dokumen(): BelongsTo
    {
        return $this->belongsTo(Dokumen::class, 'dokumen_id');
    }

    /**
     * Relasi ke User pembuat aksi log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
