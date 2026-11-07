<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Committee extends Model
{
    protected $fillable = [
        'name',
    ];

    /**
     * @return BelongsToMany<Official, $this>
     */
    public function officials(): BelongsToMany
    {
        return $this->belongsToMany(Official::class);
    }
}
