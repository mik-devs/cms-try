<?php

use App\Models\AnnualReport;
use App\Models\Bid;
use App\Models\Committee;
use App\Models\MayorMessage;
use App\Models\MessageType;
use App\Models\Official;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('requires authentication and verification for each final CMS module', function (string $path) {
    $this->get($path)->assertRedirect(route('login'));

    $this->actingAs(User::factory()->unverified()->create())
        ->get($path)
        ->assertRedirect(route('verification.notice'));
})->with([
    'bids' => ['/admin/bids'],
    'annual reports' => ['/admin/annual-reports'],
    'officials' => ['/admin/officials'],
    'mayor messages' => ['/admin/mayor-messages'],
]);

it('renders index create and edit pages for each final CMS module', function () {
    $this->actingAs(superAdminUser());

    $bid = Bid::query()->create([
        'title' => 'Road Rehabilitation',
        'date_posted' => '2026-03-01',
        'status' => 'open',
    ]);
    $annualReport = AnnualReport::query()->create([
        'title' => 'Annual Report',
        'category' => 'Financial',
        'pdf_path' => 'reports/annual-report.pdf',
        'year' => 2026,
        'date_posted' => '2026-03-01',
    ]);
    $official = Official::query()->create([
        'name' => 'Alex Santos',
        'position' => 'Mayor',
        'order' => 1,
    ]);
    $mayorMessage = MayorMessage::query()->create([
        'title' => 'Welcome',
        'content' => 'A message to residents.',
        'message_type_id' => MessageType::query()->where('name', 'speech')->value('id'),
        'published_at' => '2026-03-01 09:00:00',
    ]);

    $this->get(route('admin.bids.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/bids/index'));
    $this->get(route('admin.bids.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/bids/create'));
    $this->get(route('admin.bids.edit', $bid))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/bids/edit'));

    $this->get(route('admin.annual-reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/annual-reports/index'));
    $this->get(route('admin.annual-reports.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/annual-reports/create'));
    $this->get(route('admin.annual-reports.edit', $annualReport))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/annual-reports/edit'));

    $this->get(route('admin.officials.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/officials/index'));
    $this->get(route('admin.officials.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/officials/create'));
    $this->get(route('admin.officials.edit', $official))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/officials/edit'));

    $this->get(route('admin.mayor-messages.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/mayor-messages/index'));
    $this->get(route('admin.mayor-messages.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/mayor-messages/create'));
    $this->get(route('admin.mayor-messages.edit', $mayorMessage))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/mayor-messages/edit'));
});

it('stores and cleans up uploaded files across all final CMS modules', function () {
    Storage::fake('public');
    $this->actingAs(superAdminUser());

    $this->post(route('admin.bids.store'), [
        'title' => 'Road Rehabilitation',
        'pdf_path' => UploadedFile::fake()->create('bid.pdf', 100, 'application/pdf'),
        'date_posted' => '2026-03-01',
        'status' => 'open',
    ])->assertRedirect(route('admin.bids.index'));

    $bid = Bid::query()->firstOrFail();
    $originalBidPdf = $bid->pdf_path;
    Storage::disk('public')->assertExists($originalBidPdf);
    $this->put(route('admin.bids.update', $bid), [
        'title' => 'Road Rehabilitation Notice',
        'pdf_path' => null,
        'date_posted' => '2026-03-01',
        'status' => 'open',
    ])->assertRedirect(route('admin.bids.index'));
    $bid->refresh();
    expect($bid->pdf_path)->toBe($originalBidPdf);
    $this->put(route('admin.bids.update', $bid), [
        'title' => 'Updated Road Rehabilitation',
        'pdf_path' => UploadedFile::fake()->create('updated-bid.pdf', 100, 'application/pdf'),
        'date_posted' => '2026-03-02',
        'status' => 'closed',
    ])->assertRedirect(route('admin.bids.index'));
    $bid->refresh();
    Storage::disk('public')->assertMissing($originalBidPdf);
    Storage::disk('public')->assertExists($bid->pdf_path);
    $bidPdf = $bid->pdf_path;
    $this->delete(route('admin.bids.destroy', $bid))
        ->assertRedirect(route('admin.bids.index'));
    Storage::disk('public')->assertMissing($bidPdf);
    $this->assertDatabaseMissing('bids', ['id' => $bid->id]);

    $this->post(route('admin.annual-reports.store'), [
        'title' => 'Annual Report',
        'category' => 'Financial',
        'pdf_path' => UploadedFile::fake()->create('report.pdf', 100, 'application/pdf'),
        'year' => 2026,
        'date_posted' => '2026-03-01',
    ])->assertRedirect(route('admin.annual-reports.index'));

    $annualReport = AnnualReport::query()->firstOrFail();
    $originalReportPdf = $annualReport->pdf_path;
    Storage::disk('public')->assertExists($originalReportPdf);
    $this->put(route('admin.annual-reports.update', $annualReport), [
        'title' => 'Updated Annual Report',
        'category' => 'Financial',
        'pdf_path' => null,
        'year' => 2027,
        'date_posted' => '2027-03-01',
    ])->assertRedirect(route('admin.annual-reports.index'));
    $annualReport->refresh();
    expect($annualReport->pdf_path)->toBe($originalReportPdf);
    $this->put(route('admin.annual-reports.update', $annualReport), [
        'title' => 'Updated Annual Report',
        'category' => 'Financial',
        'pdf_path' => UploadedFile::fake()->create('updated-report.pdf', 100, 'application/pdf'),
        'year' => 2027,
        'date_posted' => '2027-03-01',
    ])->assertRedirect(route('admin.annual-reports.index'));
    $annualReport->refresh();
    Storage::disk('public')->assertMissing($originalReportPdf);
    Storage::disk('public')->assertExists($annualReport->pdf_path);
    $reportPdf = $annualReport->pdf_path;
    $this->delete(route('admin.annual-reports.destroy', $annualReport))
        ->assertRedirect(route('admin.annual-reports.index'));
    Storage::disk('public')->assertMissing($reportPdf);
    $this->assertDatabaseMissing('annual_reports', ['id' => $annualReport->id]);

    $financeCommittee = Committee::query()->create(['name' => 'Committee on Finance']);
    $educationCommittee = Committee::query()->create(['name' => 'Committee on Education']);

    $this->post(route('admin.officials.store'), [
        'name' => 'Alex Santos',
        'position' => 'Mayor',
        'committees' => [$financeCommittee->id],
        'photo' => UploadedFile::fake()->image('official.png'),
        'facebook_url' => 'https://facebook.com/alexsantos',
        'instagram_url' => 'https://instagram.com/alexsantos',
        'order' => 1,
    ])->assertRedirect(route('admin.officials.index'));

    $official = Official::query()->firstOrFail();
    expect($official->facebook_url)->toBe('https://facebook.com/alexsantos')
        ->and($official->instagram_url)->toBe('https://instagram.com/alexsantos')
        ->and($official->committees()->pluck('name')->all())->toBe(['Committee on Finance']);
    $originalPhoto = $official->photo;
    Storage::disk('public')->assertExists($originalPhoto);
    $this->put(route('admin.officials.update', $official), [
        'name' => 'Alex Santos',
        'position' => 'Municipal Mayor',
        'committees' => [$educationCommittee->id],
        'photo' => null,
        'order' => 1,
    ])->assertRedirect(route('admin.officials.index'));
    $official->refresh();
    expect($official->photo)->toBe($originalPhoto)
        ->and($official->committees()->pluck('name')->all())->toBe(['Committee on Education']);
    $this->put(route('admin.officials.update', $official), [
        'name' => 'Alex Santos',
        'position' => 'Municipal Mayor',
        'photo' => UploadedFile::fake()->image('updated-official.png'),
        'order' => 0,
    ])->assertRedirect(route('admin.officials.index'));
    $official->refresh();
    Storage::disk('public')->assertMissing($originalPhoto);
    Storage::disk('public')->assertExists($official->photo);
    $officialPhoto = $official->photo;
    $this->delete(route('admin.officials.destroy', $official))
        ->assertRedirect(route('admin.officials.index'));
    Storage::disk('public')->assertMissing($officialPhoto);
    $this->assertDatabaseMissing('officials', ['id' => $official->id]);

    $this->post(route('admin.mayor-messages.store'), [
        'title' => 'Welcome',
        'content' => 'A message to residents.',
        'message_type_id' => MessageType::query()->where('name', 'speech')->value('id'),
        'image' => UploadedFile::fake()->image('mayor.png'),
        'published_at' => '2026-03-01 09:00:00',
    ])->assertRedirect(route('admin.mayor-messages.index'));

    $mayorMessage = MayorMessage::query()->firstOrFail();
    $originalImage = $mayorMessage->image;
    Storage::disk('public')->assertExists($originalImage);
    $this->put(route('admin.mayor-messages.update', $mayorMessage), [
        'title' => 'Updated Welcome',
        'content' => 'An updated message to residents.',
        'message_type_id' => MessageType::query()->where('name', 'speech')->value('id'),
        'image' => null,
        'published_at' => '2026-03-01 09:00:00',
    ])->assertRedirect(route('admin.mayor-messages.index'));
    $mayorMessage->refresh();
    expect($mayorMessage->image)->toBe($originalImage);
    $this->put(route('admin.mayor-messages.update', $mayorMessage), [
        'title' => 'Updated Welcome',
        'content' => 'An updated message to residents.',
        'message_type_id' => MessageType::query()->where('name', 'photo_release')->value('id'),
        'image' => UploadedFile::fake()->image('updated-mayor.png'),
        'published_at' => '2026-03-02 09:00:00',
    ])->assertRedirect(route('admin.mayor-messages.index'));
    $mayorMessage->refresh();
    Storage::disk('public')->assertMissing($originalImage);
    Storage::disk('public')->assertExists($mayorMessage->image);
    $mayorImage = $mayorMessage->image;
    $this->delete(route('admin.mayor-messages.destroy', $mayorMessage))
        ->assertRedirect(route('admin.mayor-messages.index'));
    Storage::disk('public')->assertMissing($mayorImage);
    $this->assertDatabaseMissing('mayor_messages', ['id' => $mayorMessage->id]);
});

it('rejects invalid bid and mayor message types and requires annual report documents', function () {
    $this->actingAs(superAdminUser());

    $this->post(route('admin.bids.store'), [
        'title' => 'Road Rehabilitation',
        'date_posted' => '2026-03-01',
        'status' => 'pending',
    ])->assertSessionHasErrors('status');

    $this->post(route('admin.annual-reports.store'), [
        'title' => 'Annual Report',
        'year' => 2026,
        'date_posted' => '2026-03-01',
    ])->assertSessionHasErrors('pdf_path');

    $this->post(route('admin.mayor-messages.store'), [
        'title' => 'Welcome',
        'content' => 'A message to residents.',
        'message_type_id' => 999999,
    ])->assertSessionHasErrors('message_type_id');

    $this->assertDatabaseCount('bids', 0);
    $this->assertDatabaseCount('annual_reports', 0);
    $this->assertDatabaseCount('mayor_messages', 0);
});

it('shows officials and transparency files publicly and features the latest mayor messages on home', function () {
    Storage::fake('public');
    Storage::disk('public')->put('bids/open.pdf', '%PDF-1.4');
    Storage::disk('public')->put('reports/annual.pdf', '%PDF-1.4');
    $this->actingAs(superAdminUser());

    Official::query()->create([
        'name' => 'Jordan Reyes',
        'position' => 'Councilor',
        'order' => 2,
    ]);
    Official::query()->create([
        'name' => 'Alex Santos',
        'position' => 'Mayor',
        'order' => 1,
    ]);
    Bid::query()->create([
        'title' => 'Road Rehabilitation',
        'pdf_path' => 'bids/open.pdf',
        'date_posted' => '2026-03-01',
        'status' => 'open',
    ]);
    AnnualReport::query()->create([
        'title' => 'Annual Report',
        'pdf_path' => 'reports/annual.pdf',
        'year' => 2026,
        'date_posted' => '2026-03-01',
    ]);
    MayorMessage::query()->create([
        'title' => 'Oldest',
        'content' => 'Earlier message.',
        'message_type_id' => MessageType::query()->where('name', 'speech')->value('id'),
        'published_at' => '2026-01-01 09:00:00',
    ]);
    foreach (['Second', 'Third', 'Newest'] as $index => $title) {
        MayorMessage::query()->create([
            'title' => $title,
            'content' => 'A public message.',
            'message_type_id' => MessageType::query()->where('name', 'speech')->value('id'),
            'published_at' => '2026-02-0'.($index + 1).' 09:00:00',
        ]);
    }

    $this->get(route('government.officials'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/elected-officials')
            ->where('mayor.name', 'Alex Santos')
            ->where('members.0.name', 'Jordan Reyes'));

    $this->get(route('transparency'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/transparency')
            ->where('bids.0.pdf_url', Storage::disk('public')->url('bids/open.pdf'))
            ->where('annualReports.0.pdf_url', Storage::disk('public')->url('reports/annual.pdf')));

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/home')
            ->where('mayorMessage.title', 'Newest'));
});

it('shows only the ten latest published mayor messages on the home page', function () {
    foreach (range(1, 11) as $messageNumber) {
        MayorMessage::query()->create([
            'title' => "Message {$messageNumber}",
            'content' => 'A public message.',
            'message_type_id' => MessageType::query()->where('name', 'speech')->value('id'),
            'published_at' => now()->subDays(12 - $messageNumber),
        ]);
    }

    MayorMessage::query()->create([
        'title' => 'Scheduled Message',
        'content' => 'This message is not public yet.',
        'message_type_id' => MessageType::query()->where('name', 'speech')->value('id'),
        'published_at' => now()->addDay(),
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/home')
            ->where('mayorMessage.title', 'Message 11'));
});

it('renders the public mayors corner page with published messages', function () {
    MayorMessage::query()->create([
        'title' => 'Oldest Photo',
        'content' => 'A public photo.',
        'message_type_id' => MessageType::query()->where('name', 'photo_release')->value('id'),
        'published_at' => '2026-01-01 09:00:00',
    ]);
    MayorMessage::query()->create([
        'title' => 'Middle Speech',
        'content' => 'A public speech.',
        'message_type_id' => MessageType::query()->where('name', 'speech')->value('id'),
        'published_at' => '2026-02-01 09:00:00',
    ]);
    MayorMessage::query()->create([
        'title' => 'Newest Achievement',
        'content' => 'A public achievement.',
        'message_type_id' => MessageType::query()->where('name', 'achievement')->value('id'),
        'published_at' => '2026-03-01 09:00:00',
    ]);
    MayorMessage::query()->create([
        'title' => 'Future Update',
        'content' => 'Not public yet.',
        'message_type_id' => MessageType::query()->where('name', 'gallery')->value('id'),
        'published_at' => now()->addDay(),
    ]);

    $this->get(route('mayors-corner'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/mayors-corner')
            ->has('messages', 3)
            ->where('messages.0.title', 'Newest Achievement')
            ->where('messages.1.title', 'Middle Speech')
            ->where('messages.2.title', 'Oldest Photo'));
});

it('publishes a mayor message created in the CMS to the home page', function () {
    Storage::fake('public');
    $this->actingAs(superAdminUser());

    $this->post(route('admin.mayor-messages.store'), [
        'title' => 'Community Update',
        'content' => 'A message for residents.',
        'image' => UploadedFile::fake()->image('community.png'),
        'message_type_id' => MessageType::query()->where('name', 'photo_release')->value('id'),
        'published_at' => now()->subMinute()->toDateTimeString(),
    ])->assertRedirect(route('admin.mayor-messages.index'));

    $message = MayorMessage::query()->firstOrFail();
    Storage::disk('public')->assertExists($message->image);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/home')
            ->where('mayorMessage.title', 'Community Update')
            ->where('mayorMessage.message_type.name', 'photo_release')
            ->where('mayorMessage.image_url', Storage::disk('public')->url($message->image)));
});
