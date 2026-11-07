<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bid;
use App\Models\JobPosting;
use App\Models\News;
use App\Models\Official;
use App\Models\TourismSpot;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return $this->index();
    }

    public function index(): Response
    {
        $upcomingJobs = JobPosting::query()
            ->whereNotNull('deadline')
            ->where('deadline', '>=', now()->toDateString())
            ->orderBy('deadline')
            ->take(5)
            ->get()
            ->map(function (JobPosting $job): array {
                return [
                    'title' => $job->title,
                    'date' => Carbon::parse($job->deadline)->toDateString(), // Tinanggal ang ?->
                    'type' => 'Job Deadline',
                ];
            });

        $upcomingNews = News::query()
            ->whereNotNull('published_at')
            ->where('published_at', '>=', now())
            ->orderBy('published_at')
            ->take(5)
            ->get()
            ->map(function (News $news): array {
                return [
                    'title' => $news->title,
                    'date' => Carbon::parse($news->published_at)->toDateString(), // Tinanggal ang ?->
                    'type' => 'News Publish',
                ];
            });

        $upcomingEvents = $upcomingJobs
            ->concat($upcomingNews)
            ->sortBy('date')
            ->take(8)
            ->values();

        $recentActivity = collect()
            ->concat(
                News::query()->latest()->take(5)->get()->map(function (News $item): array {
                    return [
                        'type' => 'News',
                        'title' => $item->title,
                        'created_at' => $item->created_at?->toDateTimeString(),
                    ];
                })
            )
            ->concat(
                JobPosting::query()->latest()->take(5)->get()->map(function (JobPosting $item): array {
                    return [
                        'type' => 'Job',
                        'title' => $item->title,
                        'created_at' => $item->created_at?->toDateTimeString(),
                    ];
                })
            )
            ->concat(
                TourismSpot::query()->latest()->take(5)->get()->map(function (TourismSpot $item): array {
                    return [
                        'type' => 'Tourism',
                        'title' => $item->name,
                        'created_at' => $item->created_at?->toDateTimeString(),
                    ];
                })
            )
            ->sortByDesc('created_at')
            ->take(5)
            ->values();

        return Inertia::render('dashboard', [
            'stats' => [
                'news' => News::query()->count(),
                'jobs' => JobPosting::query()->count(),
                'bids' => Bid::query()->count(),
                'officials' => Official::query()->count(),
                'tourism' => TourismSpot::query()->count(),
            ],
            'upcomingEvents' => $upcomingEvents,
            'recentActivity' => $recentActivity,
        ]);
    }
}
