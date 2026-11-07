<?php

namespace App\Http\Requests\Admin\Rules;

use Illuminate\Contracts\Validation\Rule;

class CtaLinkRule implements Rule
{
    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        // Reject dangerous schemes
        if (str_starts_with($value, 'javascript:') || str_starts_with($value, 'data:')) {
            return false;
        }

        // Accept external URLs starting with http:// or https://
        if (preg_match('|^https?://|i', $value)) {
            return true;
        }

        // Accept internal paths starting with / (but reject //)
        if (preg_match('|^/[^/]|i', $value)) {
            return true;
        }

        return false;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'The :attribute field must be a valid external URL (http/https) or internal path starting with /.';
    }
}
