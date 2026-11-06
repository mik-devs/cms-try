<?php

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RolePermissionSeeder::class);
});

it('requires authentication and the internal chat permission', function () {
    $this->get(route('admin.chat.index'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->get(route('admin.chat.index'))
        ->assertForbidden();
});

it('renders the chat interface with staff and the active conversation', function () {
    $currentUser = User::query()->where('email', 'dept@kiblawan.gov.ph')->firstOrFail();
    $activeUser = User::query()->where('email', 'hr@kiblawan.gov.ph')->firstOrFail();

    Message::factory()->create([
        'sender_id' => $currentUser->id,
        'receiver_id' => $activeUser->id,
        'message' => 'Good morning, HR.',
    ]);

    Message::factory()->create([
        'sender_id' => $activeUser->id,
        'receiver_id' => $currentUser->id,
        'message' => 'Good morning, Department.',
    ]);

    Message::factory()->create([
        'sender_id' => User::query()->where('email', 'sb@kiblawan.gov.ph')->firstOrFail()->id,
        'receiver_id' => $currentUser->id,
        'message' => 'This message belongs to another conversation.',
    ]);

    $this->actingAs($currentUser)
        ->get(route('admin.chat.index', ['user_id' => $activeUser->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/chat/index')
            ->where('activeUserId', $activeUser->id)
            ->has('users', 6)
            ->has('messages', 2)
            ->where('messages.0.message', 'Good morning, HR.')
            ->where('messages.1.message', 'Good morning, Department.'));
});

it('stores a message and broadcasts it to the receiver', function () {
    Event::fake([MessageSent::class]);

    $sender = User::query()->where('email', 'dept@kiblawan.gov.ph')->firstOrFail();
    $receiver = User::query()->where('email', 'hr@kiblawan.gov.ph')->firstOrFail();

    $this->actingAs($sender)
        ->post(route('admin.chat.store'), [
            'receiver_id' => $receiver->id,
            'message' => 'Please review the new job posting.',
        ])
        ->assertOk()
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('messages', [
        'sender_id' => $sender->id,
        'receiver_id' => $receiver->id,
        'message' => 'Please review the new job posting.',
    ]);

    Event::assertDispatched(
        MessageSent::class,
        fn (MessageSent $event): bool => $event->message->receiver_id === $receiver->id
            && $event->message->sender_id === $sender->id
            && $event->message->message === 'Please review the new job posting.',
    );
});

it('validates the receiver and message before storing', function () {
    $sender = User::query()->where('email', 'dept@kiblawan.gov.ph')->firstOrFail();

    $this->actingAs($sender)
        ->post(route('admin.chat.store'), [
            'receiver_id' => 999999,
            'message' => '',
        ])
        ->assertSessionHasErrors(['receiver_id', 'message']);

    $this->assertDatabaseCount('messages', 0);
});

it('stores a message with an attachment and broadcasts it', function () {
    Storage::fake('public');
    Event::fake([MessageSent::class]);

    $sender = User::query()->where('email', 'dept@kiblawan.gov.ph')->firstOrFail();
    $receiver = User::query()->where('email', 'hr@kiblawan.gov.ph')->firstOrFail();

    $this->actingAs($sender)
        ->post(route('admin.chat.store'), [
            'receiver_id' => $receiver->id,
            'message' => 'Here is the document',
            'attachment' => UploadedFile::fake()->create('report.pdf', 1024, 'application/pdf'),
        ])
        ->assertOk()
        ->assertJson(['success' => true]);

    $message = Message::query()->firstOrFail();
    expect($message->attachment_name)->toBe('report.pdf')
        ->and($message->attachment_path)->not->toBeNull();

    Storage::disk('public')->assertExists($message->attachment_path);

    Event::assertDispatched(
        MessageSent::class,
        fn (MessageSent $event): bool => $event->message->attachment_name === 'report.pdf'
            && filled($event->message->attachment_path),
    );
});
