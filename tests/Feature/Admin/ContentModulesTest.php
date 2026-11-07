<?php

use App\Models\Achievement;
use App\Models\JobPosting;
use App\Models\JobStatus;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('requires authentication and verification for each content module', function (string $path) {
    $this->get($path)->assertRedirect(route('login'));

    $this->actingAs(User::factory()->unverified()->create())
        ->get($path)
        ->assertRedirect(route('verification.notice'));
})->with([
    'services' => ['/admin/services'],
    'achievements' => ['/admin/achievements'],
    'jobs' => ['/admin/jobs'],
]);

it('renders each content module management page', function () {
    $this->actingAs(superAdminUser());

    $service = Service::query()->create([
        'title' => 'Permit Assistance',
        'description' => 'Help with permits',
        'icon' => 'Briefcase',
        'order' => 1,
        'is_active' => true,
    ]);
    $achievement = Achievement::query()->create([
        'title' => 'Regional Award',
        'description' => 'Recognized for public service',
        'badge_year' => '2026',
        'order' => 1,
        'is_active' => true,
    ]);
    $job = JobPosting::query()->create([
        'title' => 'Planning Officer',
        'description' => 'Support municipal planning',
        'department' => 'Planning',
        'job_status_id' => JobStatus::query()->where('name', 'open')->value('id'),
    ]);

    $this->get(route('admin.services.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/services/index'));
    $this->get(route('admin.services.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/services/create'));
    $this->get(route('admin.services.edit', $service))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/services/edit'));

    $this->get(route('admin.achievements.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/achievements/index'));
    $this->get(route('admin.achievements.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/achievements/create'));
    $this->get(route('admin.achievements.edit', $achievement))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/achievements/edit'));

    $this->get(route('admin.jobs.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/jobs/index'));
    $this->get(route('admin.jobs.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/jobs/create'));
    $this->get(route('admin.jobs.edit', $job))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/jobs/edit'));
});

it('creates and updates services that are reflected on the public page', function () {
    $this->actingAs(superAdminUser());

    $this->post(route('admin.services.store'), [
        'title' => 'Permit Assistance',
        'description' => 'Help residents with permits',
        'icon' => 'Briefcase',
        'link' => '/services/permits',
        'order' => 2,
        'is_active' => true,
    ])->assertRedirect(route('admin.services.index'));

    $service = Service::query()->firstOrFail();
    $this->assertModelExists($service);

    $this->get(route('services'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/services')
            ->where('services.0.title', 'Permit Assistance'));

    $this->put(route('admin.services.update', $service), [
        'title' => 'Updated Permit Assistance',
        'description' => 'Updated description',
        'icon' => 'FileText',
        'link' => '/services/updated',
        'order' => 0,
    ])->assertRedirect(route('admin.services.index'));

    $service->refresh();
    expect($service->title)->toBe('Updated Permit Assistance');
    expect($service->is_active)->toBeFalse();

    $this->get(route('services'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/services')
            ->has('services', 0));

    $this->delete(route('admin.services.destroy', $service))
        ->assertRedirect(route('admin.services.index'));

    $this->assertDatabaseMissing('services', ['id' => $service->id]);
});

it('stores achievement images and replaces or deletes uploaded images', function () {
    Storage::fake('public');
    $this->actingAs(superAdminUser());

    $this->post(route('admin.achievements.store'), [
        'title' => 'Regional Award',
        'description' => 'Recognized for public service',
        'badge_year' => '2026',
        'order' => 1,
        'is_active' => true,
        'facebook_url' => 'https://www.facebook.com/kiblawan/posts/1',
        'image' => UploadedFile::fake()->image('award.png'),
    ])->assertRedirect(route('admin.achievements.index'));

    $achievement = Achievement::query()->firstOrFail();
    expect($achievement->image)->not->toBeNull();
    expect($achievement->facebook_url)->toBe('https://www.facebook.com/kiblawan/posts/1');

    $this->put(route('admin.achievements.update', $achievement), [
        'title' => 'Regional Award',
        'description' => 'Recognized for public service',
        'badge_year' => '2026',
        'order' => 1,
        'is_active' => true,
        'image' => UploadedFile::fake()->image('award.png'),
    ])->assertRedirect(route('admin.achievements.index'));

    $achievement->refresh();
    $originalImage = $achievement->image;
    Storage::disk('public')->assertExists($originalImage);

    $this->put(route('admin.achievements.update', $achievement), [
        'title' => 'Updated Regional Award',
        'description' => 'Updated recognition',
        'badge_year' => '2027',
        'order' => 0,
        'is_active' => true,
        'image' => UploadedFile::fake()->image('updated-award.png'),
    ])->assertRedirect(route('admin.achievements.index'));

    $achievement->refresh();
    Storage::disk('public')->assertMissing($originalImage);
    Storage::disk('public')->assertExists($achievement->image);

    $newImage = $achievement->image;
    $this->delete(route('admin.achievements.destroy', $achievement))
        ->assertRedirect(route('admin.achievements.index'));

    $this->assertDatabaseMissing('achievements', ['id' => $achievement->id]);
    Storage::disk('public')->assertMissing($newImage);
});

it('creates updates and deletes job postings reflected on the home page', function () {
    $this->actingAs(superAdminUser());

    $this->post(route('admin.jobs.store'), [
        'title' => 'Planning Officer',
        'description' => 'Support municipal planning',
        'department' => 'Planning',
        'deadline' => '2026-12-01',
        'job_status_id' => JobStatus::query()->where('name', 'open')->value('id'),
    ])->assertRedirect(route('admin.jobs.index'));

    $job = JobPosting::query()->firstOrFail();
    $this->assertModelExists($job);

    $this->put(route('admin.jobs.update', $job), [
        'title' => 'Senior Planning Officer',
        'description' => 'Lead municipal planning support',
        'department' => 'Planning',
        'deadline' => null,
        'job_status_id' => JobStatus::query()->where('name', 'open')->value('id'),
    ])->assertRedirect(route('admin.jobs.index'));

    $job->refresh();
    expect($job->title)->toBe('Senior Planning Officer');
    expect($job->status?->name)->toBe('open');

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/home')
            ->where('latestJobs.0.title', 'Senior Planning Officer'));

    $this->delete(route('admin.jobs.destroy', $job))
        ->assertRedirect(route('admin.jobs.index'));

    $this->assertDatabaseMissing('job_postings', ['id' => $job->id]);
});

it('rejects invalid service order and job status values', function (
    string $route,
    array $attributes,
    string $field,
    string $message,
) {
    $this->actingAs(superAdminUser())
        ->post($route, $attributes)
        ->assertSessionHasErrors([$field => $message]);
})->with([
    'negative service order' => [
        '/admin/services',
        [
            'title' => 'Invalid service',
            'description' => 'Details',
            'icon' => 'Briefcase',
            'order' => -1,
        ],
        'order',
        'The order field must be at least 0.',
    ],
    'invalid job status' => [
        '/admin/jobs',
        [
            'title' => 'Invalid job',
            'description' => 'Details',
            'department' => 'Planning',
            'job_status_id' => 999999,
        ],
        'job_status_id',
        'The selected job status id is invalid.',
    ],
]);
