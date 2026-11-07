<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Rules\CtaLinkRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateHeroSlideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'kicker' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'title_emphasis' => ['nullable', 'string', 'max:255'],
            'cta_text' => ['nullable', 'string', 'max:255', 'required_with:cta_link'],
            'cta_link' => ['nullable', 'string', 'max:2048', 'required_with:cta_text', new CtaLinkRule],
            'image' => ['nullable', 'image', 'max:5120'],
            'order' => ['required', 'integer'],
            'is_active' => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('is_active')) {
            $this->merge(['is_active' => false]);
        }
    }
}
