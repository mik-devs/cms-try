<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barangay extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'population',
        'captain',
        'contact',
        'latitude',
        'longitude',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'population' => 'integer',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'order' => 'integer',
        ];
    }

    /**
     * @return HasMany<TourismSpot, $this>
     */
    public function tourismSpots(): HasMany
    {
        return $this->hasMany(TourismSpot::class);
    }
}
