<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DokumenResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $rak = $this->relationLoaded('rak') ? $this->rak : ($this->album && $this->album->relationLoaded('rak') ? $this->album->rak : null);
        $album = $this->relationLoaded('album') ? $this->album : null;

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
            'desa'             => $this->whenLoaded('desa', function () {
                return [
                    'id'        => $this->desa->id,
                    'nama'      => $this->desa->nama,
                    'kecamatan' => $this->desa->kecamatan ? [
                        'id'   => $this->desa->kecamatan->id,
                        'nama' => $this->desa->kecamatan->nama,
                    ] : null,
                ];
            }),
            'kecamatan'        => $this->whenLoaded('kecamatan', function () {
                return [
                    'id'   => $this->kecamatan->id,
                    'nama' => $this->kecamatan->nama,
                ];
            }),
            'rak'              => $rak ? [
                'id'   => $rak->id,
                'kode' => $rak->kode,
            ] : null,
            'album'            => $album ? [
                'id'          => $album->id,
                'nomor_album' => $album->nomor_album,
                'kapasitas'   => $album->kapasitas,
                'terisi'      => $album->terisi,
                'sisa'        => $album->sisa,
            ] : null,
            'created_by'       => $this->created_by,
            'created_at'       => $this->created_at?->toISOString(),
            'updated_at'       => $this->updated_at?->toISOString(),
        ];
    }
}
