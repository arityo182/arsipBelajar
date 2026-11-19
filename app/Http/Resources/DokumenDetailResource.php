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
        $boks = $this->boks;
        $shaf = $boks ? $boks->shaf : null;
        $rak = $shaf ? $shaf->rak : null;
        $ruang = $rak ? $rak->ruang : null;

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
            'desa'           => $this->desa ? [
                'id'        => $this->desa->id,
                'nama'      => $this->desa->nama,
                'kecamatan' => $this->desa->kecamatan ? [
                    'id'   => $this->desa->kecamatan->id,
                    'nama' => $this->desa->kecamatan->nama,
                ] : null,
            ] : null,
            'boks'           => $boks ? [
                'id'        => $boks->id,
                'nomor'     => $boks->nomor,
                'kapasitas' => $boks->kapasitas,
                'terisi'    => $boks->terisi,
                'sisa'      => $boks->sisa,
                'shaf'      => $shaf ? [
                    'kode' => $shaf->kode,
                    'rak'  => $rak ? [
                        'kode'  => $rak->kode,
                        'ruang' => $ruang ? [
                            'nama' => $ruang->nama,
                            'kode' => $ruang->kode,
                        ] : null,
                    ] : null,
                ] : null,
            ] : null,
            'lokasi_detail'  => [
                'ruang' => $ruang ? [
                    'id'        => $ruang->id,
                    'nama'      => $ruang->nama,
                    'kode'      => $ruang->kode,
                    'deskripsi' => $ruang->deskripsi,
                ] : null,
                'rak'   => $rak ? [
                    'id'   => $rak->id,
                    'kode' => $rak->kode,
                ] : null,
                'shaf'  => $shaf ? [
                    'id'   => $shaf->id,
                    'kode' => $shaf->kode,
                ] : null,
                'boks'  => $boks ? [
                    'id'        => $boks->id,
                    'nomor'     => $boks->nomor,
                    'kapasitas' => $boks->kapasitas,
                ] : null,
            ],
            'created_by'     => $this->createdBy ? [
                'id'   => $this->createdBy->id,
                'nama' => $this->createdBy->nama,
            ] : null,
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
            'log_aktivitas'  => $this->logAktivitas->take(20)->map(function ($log) {
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
