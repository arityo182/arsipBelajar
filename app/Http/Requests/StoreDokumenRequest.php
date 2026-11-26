<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreDokumenRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Sanitasi dan normalisasi input sebelum validasi.
     */
    protected function prepareForValidation(): void
    {
        $mapStatus = static function (?string $val): ?string {
            if ($val === null || $val === '') {
                return null;
            }
            $upper = strtoupper(trim($val));
            return match ($upper) {
                'SELESAI' => 'TERSEDIA',
                'PROSES'  => 'HILANG',
                default   => $upper,
            };
        };

        $statusNormalized = $mapStatus($this->input('status_fisik') ?: $this->input('status_berkas'));

        $this->merge([
            'nomor_di302'  => trim((string) $this->input('nomor_di302', '')),
            'nama_pemohon' => trim(strip_tags((string) $this->input('nama_pemohon', ''))),
            'tingkat'      => $this->filled('tingkat') ? trim(strip_tags((string) $this->input('tingkat'))) : null,
            'posisi'       => $this->filled('posisi') ? trim(strip_tags((string) $this->input('posisi'))) : null,
            'keterangan'   => $this->filled('keterangan') ? trim(strip_tags((string) $this->input('keterangan'))) : null,
            'catatan'      => $this->filled('catatan') ? trim(strip_tags((string) $this->input('catatan'))) : null,
            'status_fisik' => $statusNormalized ?? 'TERSEDIA',
            'status_berkas'=> $statusNormalized ?? 'TERSEDIA',
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nomor_di302'     => ['required', 'string', 'regex:/^[1-9][0-9]*$/', 'max:20', 'unique:dokumen,nomor_di302'],
            'nomor_album'     => ['required', 'integer', 'exists:album,nomor_album'],
            'nomor_urut'      => ['required', 'integer', 'min:1'],
            'tanggal_masuk'   => ['required', 'date'],
            'nama_pemohon'    => ['required', 'string', 'min:3', 'max:100'],
            'jenis_permohonan'=> [
                'required',
                'string',
                'in:Pengukuran Dan Pemetaan,Pengukuran Ulang Dan Pemetaan,Pemecahan Bidang,Pendaftaran Tanah Pertama Kali'
            ],
            'desa_id'         => ['required', 'integer', 'exists:desa,id'],
            'kecamatan_id'    => ['nullable', 'integer', 'exists:kecamatan,id'],
            'rak_id'          => ['required', 'integer', 'exists:rak,id'],
            'tingkat'         => ['nullable', 'string', 'max:10'],
            'posisi'          => ['nullable', 'string', 'max:10'],
            'keterangan'      => ['nullable', 'string', 'max:500'],
            'catatan'         => ['nullable', 'string', 'max:500'],
            'status_fisik'    => ['nullable', 'string', 'in:TERSEDIA,DIPINJAM,RUSAK,HILANG'],
            'status_berkas'   => ['nullable', 'string', 'in:TERSEDIA,DIPINJAM,RUSAK,HILANG'],
        ];
    }

    /**
     * Pesan kesalahan khusus bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'nomor_di302.required'      => 'Nomor DI-302 wajib diisi.',
            'nomor_di302.regex'         => 'Nomor DI-302 hanya boleh berupa angka murni (tanpa huruf/prefix).',
            'nomor_di302.unique'        => 'Nomor DI-302 sudah terdaftar di sistem.',
            'nomor_album.required'      => 'Nomor album wajib dipilih.',
            'nomor_album.exists'        => 'Nomor album tidak ditemukan dalam database.',
            'nomor_urut.required'       => 'Nomor urut dalam album wajib diisi.',
            'nomor_urut.min'            => 'Nomor urut minimal adalah 1.',
            'tanggal_masuk.required'    => 'Tanggal masuk berkas wajib diisi.',
            'tanggal_masuk.date'        => 'Format tanggal masuk tidak valid.',
            'nama_pemohon.required'     => 'Nama pemohon wajib diisi.',
            'nama_pemohon.min'          => 'Nama pemohon minimal 3 karakter.',
            'jenis_permohonan.required' => 'Jenis permohonan wajib dipilih.',
            'jenis_permohonan.in'       => 'Jenis permohonan harus salah satu dari: Pengukuran Dan Pemetaan, Pengukuran Ulang Dan Pemetaan, Pemecahan Bidang, atau Pendaftaran Tanah Pertama Kali.',
            'desa_id.required'          => 'Desa/Kelurahan wajib dipilih.',
            'desa_id.exists'            => 'Desa/Kelurahan yang dipilih tidak valid.',
            'rak_id.required'           => 'Rak penyimpanan wajib dipilih.',
            'rak_id.exists'             => 'Rak penyimpanan yang dipilih tidak valid.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
