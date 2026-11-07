<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\AchievementController as PublicAchievementController;
use App\Http\Controllers\Admin\AchievementController;
use App\Http\Controllers\Admin\AnnualReportController;
use App\Http\Controllers\Admin\BarangayController;
use App\Http\Controllers\Admin\BidController;
use App\Http\Controllers\Admin\ChatController;
use App\Http\Controllers\Admin\CitizenCharterController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EmergencyContactController;
use App\Http\Controllers\Admin\HeroSlideController;
use App\Http\Controllers\Admin\JobController;
use App\Http\Controllers\Admin\MayorMessageController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\OfficeController;
use App\Http\Controllers\Admin\OfficialController;
use App\Http\Controllers\Admin\OfficialVideoController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\StatController;
use App\Http\Controllers\Admin\TourismController as AdminTourismController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\BarangayController as PublicBarangayController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\GovernmentController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MayorCornerController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\TourismController;
use App\Http\Controllers\TransparencyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::inertia('/welcome', 'welcome')->name('welcome');

Route::redirect('/about', '/about/history')->name('about');
Route::get('/about/history', [AboutController::class, 'history'])->name('about.history');
Route::get('/about/demographic', [AboutController::class, 'demographic'])->name('about.demographic');
Route::get('/about/socio-economic', [AboutController::class, 'socioEconomic'])->name('about.socio-economic');
Route::get('/about/geography', [AboutController::class, 'geography'])->name('about.geography');

Route::get('/government', [GovernmentController::class, 'index'])->name('government');
Route::get('/government/vision-mission', [GovernmentController::class, 'index'])
    ->defaults('tab', 'vision-mission')
    ->name('government.vision-mission');
Route::get('/government/officials', [GovernmentController::class, 'officials'])
    ->name('government.officials');
Route::get('/government/sangguniang-bayan', [GovernmentController::class, 'sanggunianBayan'])
    ->name('government.sangguniang-bayan');
Route::get('/government/citizens-charter', [GovernmentController::class, 'citizensCharter'])
    ->name('government.citizens-charter');
Route::get('/government/directories', [GovernmentController::class, 'directories'])
    ->name('government.directories');

Route::get('/services', [ServicesController::class, 'index'])->name('services');

Route::get('/transparency', [TransparencyController::class, 'index'])->name('transparency');
Route::get('/transparency/bids', [TransparencyController::class, 'bids'])
    ->name('transparency.bids');
Route::get('/transparency/reports', [TransparencyController::class, 'reports'])
    ->name('transparency.reports');

Route::get('/contact', [ContactController::class, 'index'])->name('contact');

Route::get('/news', [NewsController::class, 'index'])->name('news.index');
Route::get('/news/{slug}', [NewsController::class, 'show'])->name('news.show');
Route::get('/mayors-corner', [MayorCornerController::class, 'index'])
    ->name('mayors-corner');

Route::get('/careers', fn () => Inertia::render('public/coming-soon', ['title' => 'Careers']))
    ->name('careers');
Route::get('/tourism', [TourismController::class, 'index'])
    ->name('tourism');
Route::get('/tourism/{slug}', [TourismController::class, 'show'])
    ->name('tourism.show');
Route::get('/achievements', [PublicAchievementController::class, 'index'])
    ->name('achievements');
Route::get('/achievements/{id}', [PublicAchievementController::class, 'show'])
    ->whereNumber('id')
    ->name('achievements.show');
Route::get('/barangays', fn () => Inertia::render('public/coming-soon', ['title' => 'Barangays']))
    ->name('barangays');
Route::get('/barangays/{slug}', [PublicBarangayController::class, 'show'])
    ->name('barangays.show');

Route::inertia('/privacy-policy', 'public/privacy-policy')->name('privacy-policy');
Route::inertia('/terms-of-use', 'public/terms-of-use')->name('terms-of-use');
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin', [DashboardController::class, 'index'])->name('dashboard');
});

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])
            ->name('notifications.read-all');
        Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead'])
            ->name('notifications.read');

        Route::middleware('can:manage news')->group(function () {
            Route::resource('news', App\Http\Controllers\Admin\NewsController::class)
                ->except('show');
        });
        Route::middleware('can:manage services')->group(function () {
            Route::resource('services', ServiceController::class)
                ->except('show');
        });
        Route::middleware('can:manage achievements')->group(function () {
            Route::resource('achievements', AchievementController::class)
                ->except('show');
        });
        Route::middleware('can:manage jobs')->group(function () {
            Route::resource('jobs', JobController::class)
                ->except('show');
        });
        Route::middleware('can:manage tourism')->group(function () {
            Route::delete('/tourism-images/{image}', [AdminTourismController::class, 'destroyImage'])
                ->name('tourism.images.destroy');
            Route::resource('tourism', AdminTourismController::class)
                ->except('show');
        });
        Route::middleware('can:manage emergency')->group(function () {
            Route::resource('emergency-contacts', EmergencyContactController::class)
                ->except('show');
        });
        Route::middleware('can:manage transparency')->group(function () {
            Route::resource('bids', BidController::class)
                ->except('show');
            Route::resource('annual-reports', AnnualReportController::class)
                ->except('show');
        });
        Route::middleware('can:access internal chat')->group(function () {
            Route::get('chat', [ChatController::class, 'index'])
                ->name('chat.index');
            Route::post('chat', [ChatController::class, 'store'])
                ->name('chat.store')
                ->middleware('throttle:60,1');
            Route::post('chat/typing', [ChatController::class, 'typing'])
                ->name('chat.typing')
                ->middleware('throttle:60,1');
        });
        Route::middleware('can:manage officials')->group(function () {
            Route::resource('officials', OfficialController::class)
                ->except('show');
            Route::resource('mayor-messages', MayorMessageController::class)
                ->except('show');
        });
        Route::middleware('can:manage settings')->group(function () {
            Route::resource('barangays', BarangayController::class)
                ->except('show');
            Route::resource('citizen-charters', CitizenCharterController::class)
                ->except('show');
            Route::resource('offices', OfficeController::class)
                ->except('show');
            Route::resource('videos', OfficialVideoController::class)
                ->except('show');
            Route::get('pages', [PageController::class, 'index'])
                ->name('pages.index');
            Route::get('pages/{slug}/edit', [PageController::class, 'edit'])
                ->name('pages.edit');
            Route::put('pages/{slug}', [PageController::class, 'update'])
                ->name('pages.update');
            Route::get('settings', [SettingController::class, 'index'])
                ->name('settings.index');
            Route::put('settings', [SettingController::class, 'update'])
                ->name('settings.update');
        });
        Route::middleware('can:manage hero')->group(function () {
            Route::resource('hero-slides', HeroSlideController::class)
                ->except('show');
        });
        Route::middleware('can:manage stats')->group(function () {
            Route::resource('stats', StatController::class)
                ->except('show');
        });
        Route::middleware('role:super_admin')->group(function () {
            Route::resource('users', UserController::class)
                ->except('show');
            Route::resource('roles', RoleController::class)
                ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
        });
    });

require __DIR__.'/settings.php';

if (file_exists(__DIR__.'/reverb-diagnostic.php')) {
    require __DIR__.'/reverb-diagnostic.php';
}