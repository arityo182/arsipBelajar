<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PindahAlbumRequest extends FormRequest
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
        return [
            'nomor_album_baru' => ['required', 'integer', 'exists:album,nomor_album'],
            'rak_id_baru'      => ['nullable', 'integer', 'exists:rak,id'],
            'nomor_urut_baru'  => ['nullable', 'integer', 'min:1'],
            'tingkat_baru'     => ['nullable', 'string', 'max:10'],
            'posisi_baru'      => ['nullable', 'string', 'max:10'],
            'alasan'           => ['required', 'string', 'min:5', 'max:255'],
        ];
    }

    /**
     * Custom messages.
     */
    public function messages(): array
    {
        return [
            'nomor_album_baru.required' => 'Nomor album tujuan pemindahan wajib dipilih.',
            'nomor_album_baru.exists'   => 'Nomor album tujuan tidak ditemukan.',
            'alasan.required'           => 'Alasan pemindahan wajib dicantumkan.',
            'alasan.min'                => 'Alasan pemindahan minimal 5 karakter.',
            'alasan.max'                => 'Alasan pemindahan maksimal 255 karakter.',
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
