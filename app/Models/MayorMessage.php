<?php

namespace App\Models;

use App\Models\Concerns\HasImageUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MayorMessage extends Model
{
    use HasImageUrl;

    protected $fillable = [
        'title',
        'content',
        'image',
        'message_type_id',
        'published_at',
    ];

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    /**
     * @param  Builder<static>  $query
     * @return static
     */
    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where(function (Builder $query): void {
                $query->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            });
    }

    /**
     * @return BelongsTo<MessageType, $this>
     */
    public function messageType(): BelongsTo
    {
        return $this->belongsTo(MessageType::class);
    }
}
