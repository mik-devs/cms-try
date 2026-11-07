<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class TourismSpotImage extends Model
{
    protected $fillable = [
        'tourism_spot_id',
        'image_path',
        'order',
    ];

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<TourismSpot, $this>
     */
    public function tourismSpot(): BelongsTo
    {
        return $this->belongsTo(TourismSpot::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        $imagePath = $this->image_path;

        if (blank($imagePath)) {
            return null;
        }

        if (str_starts_with($imagePath, '/') || str_starts_with($imagePath, 'http')) {
            return $imagePath;
        }

        return Storage::url($imagePath);
    }
}
