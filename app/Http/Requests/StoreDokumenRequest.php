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
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $currentYear = (int) date('Y');

        return [
            'nomor_gu'      => ['required', 'string', 'max:30', 'unique:dokumen,nomor_gu'],
            'tahun'         => ['required', 'integer', 'min:1945', "max:{$currentYear}"],
            'nib'           => ['required', 'string', 'regex:/^[0-9]+$/', 'max:20'],
            'jenis_dokumen' => ['required', 'string', 'in:Sertipikat,GU,SU,Warkah,IPT,Lainnya'],
            'nama_pemilik'  => ['required', 'string', 'min:3', 'max:100'],
            'desa_id'       => ['required', 'integer', 'exists:desa,id'],
            'boks_id'       => ['required', 'integer', 'exists:boks,id'],
        ];
    }

    /**
     * Pesan kesalahan khusus bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'nomor_gu.required'      => 'Nomor GU wajib diisi.',
            'nomor_gu.unique'        => 'Nomor GU sudah terdaftar di sistem.',
            'tahun.required'         => 'Tahun dokumen wajib diisi.',
            'tahun.min'              => 'Tahun minimal adalah 1945.',
            'tahun.max'              => 'Tahun tidak boleh melebihi tahun saat ini.',
            'nib.required'           => 'NIB wajib diisi.',
            'nib.regex'              => 'NIB harus berupa digit angka.',
            'jenis_dokumen.required' => 'Jenis dokumen wajib dipilih.',
            'jenis_dokumen.in'       => 'Jenis dokumen harus salah satu dari: Sertipikat, GU, SU, Warkah, IPT, Lainnya.',
            'nama_pemilik.required'  => 'Nama pemilik wajib diisi.',
            'nama_pemilik.min'       => 'Nama pemilik minimal 3 karakter.',
            'desa_id.required'       => 'Desa wajib dipilih.',
            'desa_id.exists'         => 'Desa yang dipilih tidak valid.',
            'boks_id.required'       => 'Boks penyimpanan wajib dipilih.',
            'boks_id.exists'         => 'Boks penyimpanan yang dipilih tidak valid.',
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
