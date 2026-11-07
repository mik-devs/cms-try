<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

class Official extends Model
{
    protected $fillable = [
        'name',
        'position',
        'photo',
        'facebook_url',
        'instagram_url',
        'order',
    ];

    protected $appends = ['photo_url'];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    public function getPhotoUrlAttribute(): ?string
    {
        $photo = $this->getAttribute('photo');

        if (blank($photo)) {
            return null;
        }

        if (str_starts_with($photo, '/') || str_starts_with($photo, 'http')) {
            return $photo;
        }

        return Storage::url($photo);
    }

    /**
     * @return BelongsToMany<Committee, $this>
     */
    public function committees(): BelongsToMany
    {
        return $this->belongsToMany(Committee::class);
    }
}
