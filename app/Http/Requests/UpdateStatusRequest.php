<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('keterangan')) {
            $this->merge([
                'keterangan' => trim(strip_tags((string) $this->input('keterangan'))),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status_fisik'  => ['nullable', 'string', 'in:TERSEDIA,DIPINJAM,RUSAK,HILANG,SELESAI,PROSES'],
            'status_berkas' => ['nullable', 'string', 'in:TERSEDIA,DIPINJAM,RUSAK,HILANG,SELESAI,PROSES'],
            'keterangan'    => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Custom messages.
     */
    public function messages(): array
    {
        return [
            'status_fisik.required' => 'Status fisik dokumen wajib dipilih.',
            'status_fisik.in'       => 'Status fisik harus salah satu dari: TERSEDIA, DIPINJAM, RUSAK, HILANG.',
            'keterangan.max'        => 'Keterangan maksimal 255 karakter.',
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
