<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{userId}', function ($user, int $userId): bool {
    return (int) $user->getKey() === $userId;
});

Broadcast::channel('App.Models.User.{id}', function ($user, int $id): bool {
    return (int) $user->getKey() === $id;
});