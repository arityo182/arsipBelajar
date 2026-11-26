<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DokumenDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $rak = $this->rak ?: ($this->album ? $this->album->rak : null);
        $album = $this->album;

        return [
            'id'               => $this->id,
            'nomor_di302'      => $this->nomor_di302,
            'nomor_album'      => $this->nomor_album,
            'nomor_urut'       => $this->nomor_urut,
            'tanggal_masuk'    => $this->tanggal_masuk ? (is_string($this->tanggal_masuk) ? $this->tanggal_masuk : $this->tanggal_masuk->format('Y-m-d')) : null,
            'tahun'            => $this->tahun,
            'nama_pemohon'     => $this->nama_pemohon,
            'jenis_permohonan' => $this->jenis_permohonan,
            'status_fisik'     => $this->status_fisik ?: $this->status_berkas,
            'status_berkas'    => $this->status_fisik ?: $this->status_berkas,
            'status_label'     => $this->status_label,
            'lokasi_lengkap'   => $this->lokasi_lengkap,
            'tingkat'          => $this->tingkat ?: ($album?->tingkat),
            'posisi'           => $this->posisi ?: ($album?->posisi),
            'keterangan'       => $this->keterangan,
            'catatan'          => $this->catatan,
            'desa_id'          => $this->desa_id,
            'desa_nama'        => $this->desa?->nama,
            'kecamatan_id'     => $this->kecamatan_id ?: $this->desa?->kecamatan_id,
            'kecamatan_nama'   => $this->kecamatan?->nama ?: $this->desa?->kecamatan?->nama,
            'rak_id'           => $this->rak_id ?: $rak?->id,
            'rak_kode'         => $rak?->kode ?: 'E',
            'desa'             => $this->desa ? [
                'id'        => $this->desa->id,
                'nama'      => $this->desa->nama,
                'kecamatan' => $this->desa->kecamatan ? [
                    'id'   => $this->desa->kecamatan->id,
                    'nama' => $this->desa->kecamatan->nama,
                ] : null,
            ] : null,
            'kecamatan'        => ($this->kecamatan ?: $this->desa?->kecamatan) ? [
                'id'   => ($this->kecamatan ?: $this->desa->kecamatan)->id,
                'nama' => ($this->kecamatan ?: $this->desa->kecamatan)->nama,
            ] : null,
            'rak'              => $rak ? [
                'id'   => $rak->id,
                'kode' => $rak->kode,
            ] : null,
            'album'            => $album ? [
                'id'          => $album->id,
                'nomor_album' => $album->nomor_album,
                'rak_id'      => $album->rak_id,
                'rak_kode'    => $rak?->kode ?: 'E',
                'tingkat'     => $album->tingkat,
                'posisi'      => $album->posisi,
                'kapasitas'   => $album->kapasitas,
                'terisi'      => $album->terisi,
                'sisa'        => $album->sisa,
            ] : null,
            'created_by'       => $this->createdBy ? [
                'id'   => $this->createdBy->id,
                'nama' => $this->createdBy->nama,
            ] : null,
            'created_at'       => $this->created_at?->toISOString(),
            'updated_at'       => $this->updated_at?->toISOString(),
            'log_aktivitas'    => $this->logAktivitas->take(20)->map(function ($log) {
                return [
                    'id'         => $log->id,
                    'aksi'       => $log->aksi,
                    'detail'     => $log->detail,
                    'created_at' => $log->created_at?->toISOString(),
                    'user'       => $log->user ? [
                        'id'   => $log->user->id,
                        'nama' => $log->user->nama,
                    ] : null,
                ];
            }),
        ];
    }
}
