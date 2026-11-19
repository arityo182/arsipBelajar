<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PindahRakRequest extends FormRequest
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
            'boks_id_baru' => ['required', 'integer', 'exists:boks,id'],
            'alasan'       => ['required', 'string', 'min:10', 'max:255'],
        ];
    }

    /**
     * Custom messages.
     */
    public function messages(): array
    {
        return [
            'boks_id_baru.required' => 'Boks tujuan pemindahan wajib dipilih.',
            'boks_id_baru.exists'   => 'Boks tujuan yang dipilih tidak ditemukan.',
            'alasan.required'       => 'Alasan pemindahan wajib dicantumkan.',
            'alasan.min'            => 'Alasan pemindahan minimal 10 karakter.',
            'alasan.max'            => 'Alasan pemindahan maksimal 255 karakter.',
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
