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
        $boks = $this->relationLoaded('boks') ? $this->boks : null;
        $shaf = ($boks && $boks->relationLoaded('shaf')) ? $boks->shaf : null;
        $rak = ($shaf && $shaf->relationLoaded('rak')) ? $shaf->rak : null;
        $ruang = ($rak && $rak->relationLoaded('ruang')) ? $rak->ruang : null;

        return [
            'id'             => $this->id,
            'nomor_gu'       => $this->nomor_gu,
            'tahun'          => $this->tahun,
            'nib'            => $this->nib,
            'jenis_dokumen'  => $this->jenis_dokumen,
            'nama_pemilik'   => $this->nama_pemilik,
            'status_fisik'   => $this->status_fisik,
            'lokasi_lengkap' => $this->lokasi_lengkap,
            'lokasi'         => [
                'ruang_id'       => $ruang?->id,
                'ruang_nama'     => $ruang?->nama,
                'ruang_kode'     => $ruang?->kode,
                'rak_id'         => $rak?->id,
                'rak_kode'       => $rak?->kode,
                'shaf_id'        => $shaf?->id,
                'shaf_kode'      => $shaf?->kode,
                'boks_id'        => $boks?->id,
                'boks_nomor'     => $boks?->nomor,
                'lokasi_lengkap' => $this->lokasi_lengkap,
            ],
            'desa'           => $this->whenLoaded('desa', function () {
                return [
                    'id'        => $this->desa->id,
                    'nama'      => $this->desa->nama,
                    'kecamatan' => $this->desa->kecamatan ? [
                        'id'   => $this->desa->kecamatan->id,
                        'nama' => $this->desa->kecamatan->nama,
                    ] : null,
                ];
            }),
            'boks'           => $this->whenLoaded('boks', function () {
                return [
                    'id'        => $this->boks->id,
                    'nomor'     => $this->boks->nomor,
                    'kapasitas' => $this->boks->kapasitas,
                ];
            }),
            'created_by'     => $this->created_by,
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}
