<?php

use App\Models\News;
use App\Models\NewsCategory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('requires a verified user to access news management', function () {
    $this->get(route('admin.news.index'))
        ->assertRedirect(route('login'));
});

it('requires email verification before accessing news management', function () {
    $this->actingAs(User::factory()->unverified()->create())
        ->get(route('admin.news.index'))
        ->assertRedirect(route('verification.notice'));
});

it('renders the news management pages', function () {
    $user = superAdminUser();
    $news = News::query()->create([
        'title' => 'Admin news',
        'slug' => 'admin-news',
        'content' => 'News content',
        'news_category_id' => NewsCategory::query()->where('name', 'news')->value('id'),
        'status' => 'draft',
    ]);

    $this->actingAs($user)
        ->get(route('admin.news.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/news/index')
            ->where('news.data.0.title', 'Admin news'));

    $this->get(route('admin.news.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/news/create'));

    $this->get(route('admin.news.edit', $news))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/news/edit')
            ->where('news.title', 'Admin news'));
});

it('creates, replaces, and deletes a news image with its record', function () {
    Storage::fake('public');
    $user = superAdminUser();
    $this->actingAs($user);

    $this->post(route('admin.news.store'), [
        'title' => 'Community Update',
        'excerpt' => 'A short update',
        'content' => 'Full news content',
        'news_category_id' => NewsCategory::query()->where('name', 'news')->value('id'),
        'status' => 'draft',
        'published_at' => '2026-10-30',
        'is_featured' => true,
        'image' => UploadedFile::fake()->image('community.png'),
    ])->assertRedirect(route('admin.news.index'));

    $news = News::query()->firstOrFail();
    $originalImage = $news->image;
    Storage::disk('public')->assertExists($originalImage);
    expect($news->user_id)->toBe($user->id);
    expect($news->is_featured)->toBeTrue();

    $this->put(route('admin.news.update', $news), [
        'title' => 'Updated Community Update',
        'excerpt' => 'Updated excerpt',
        'content' => 'Updated content',
        'news_category_id' => NewsCategory::query()->where('name', 'announcement')->value('id'),
        'status' => 'published',
        'published_at' => '2026-11-01',
        'image' => UploadedFile::fake()->image('replacement.png'),
    ])->assertRedirect(route('admin.news.index'));

    $news->refresh();
    Storage::disk('public')->assertMissing($originalImage);
    Storage::disk('public')->assertExists($news->image);
    expect($news->title)->toBe('Updated Community Update');
    expect($news->newsCategory?->name)->toBe('announcement');
    expect($news->is_featured)->toBeFalse();

    $replacementImage = $news->image;
    $this->delete(route('admin.news.destroy', $news))
        ->assertRedirect(route('admin.news.index'));

    $this->assertDatabaseMissing('news', ['id' => $news->id]);
    Storage::disk('public')->assertMissing($replacementImage);
});

it('rejects news with an unsupported category', function () {
    $this->actingAs(superAdminUser())
        ->post(route('admin.news.store'), [
            'title' => 'Invalid news',
            'content' => 'News content',
            'news_category_id' => 999999,
            'status' => 'draft',
        ])
        ->assertSessionHasErrors([
            'news_category_id' => 'The selected news category id is invalid.',
        ]);

    $this->assertDatabaseCount('news', 0);
});

it('rejects a featured value that is not boolean', function () {
    $this->actingAs(superAdminUser())
        ->post(route('admin.news.store'), [
            'title' => 'Invalid featured value',
            'content' => 'News content',
            'news_category_id' => NewsCategory::query()->where('name', 'news')->value('id'),
            'status' => 'draft',
            'is_featured' => 'invalid',
        ])
        ->assertSessionHasErrors([
            'is_featured' => 'The is featured field must be true or false.',
        ]);

    $this->assertDatabaseCount('news', 0);
});
