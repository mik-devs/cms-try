<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MessageType extends Model
{
    protected $fillable = [
        'name',
    ];

    /**
     * @return HasMany<MayorMessage, $this>
     */
    public function mayorMessages(): HasMany
    {
        return $this->hasMany(MayorMessage::class);
    }
}
