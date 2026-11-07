<?php

use App\Models\User;
use App\Notifications\NewChatMessageNotification;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RolePermissionSeeder::class);
});

it('marks a single notification as read', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $user->notify(new NewChatMessageNotification('Sender', 'Test message', '/admin/chat?user_id=1'));

    expect($user->unreadNotifications()->count())->toBe(1);

    $notification = $user->unreadNotifications()->firstOrFail();

    $this->actingAs($user)
        ->postJson(route('admin.notifications.read', ['id' => $notification->id]))
        ->assertOk()
        ->assertJson(['success' => true]);

    expect($user->fresh()->unreadNotifications()->count())->toBe(0);
});

it('marks all notifications as read', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $user->notify(new NewChatMessageNotification('Sender 1', 'Message 1', '/admin/chat?user_id=1'));
    $user->notify(new NewChatMessageNotification('Sender 2', 'Message 2', '/admin/chat?user_id=2'));

    expect($user->unreadNotifications()->count())->toBe(2);

    $this->actingAs($user)
        ->postJson(route('admin.notifications.read-all'))
        ->assertOk()
        ->assertJson(['success' => true]);

    expect($user->fresh()->unreadNotifications()->count())->toBe(0);
});

it('generates notification pointing to sender when message is sent', function () {
    $sender = User::query()->where('email', 'dept@kiblawan.gov.ph')->firstOrFail();
    $receiver = User::query()->where('email', 'hr@kiblawan.gov.ph')->firstOrFail();

    $this->actingAs($sender)
        ->post(route('admin.chat.store'), [
            'receiver_id' => $receiver->id,
            'message' => 'Hello HR!',
        ])
        ->assertOk();

    $notification = $receiver->unreadNotifications()->firstOrFail();
    expect($notification->data['url'])->toBe(route('admin.chat.index', ['user_id' => $sender->id]));
});
