<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'roles' => $user->getRoleNames()->sort()->values(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->sort()->values(),
                ] : null,
            ],
            'siteSettings' => Setting::query()
                ->whereIn('key', [
                    'site_name',
                    'tagline',
                    'address',
                    'phone',
                    'email',
                    'office_hours',
                ])
                ->pluck('value', 'key')
                ->toArray(),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => [
                'unreadCount' => $user ? $user->unreadNotifications()->count() : 0,
                'list' => $user ? $user->unreadNotifications()
                    ->latest()
                    ->take(5)
                    ->get() // <--- IDINAGDAG ANG get() PARA MAKUHA ANG COLLECTION
                    ->map(function ($notification) {
                        return [
                            'id' => $notification->id,
                            'sender_name' => $notification->data['sender_name'] ?? 'System',
                            'message_preview' => $notification->data['message_preview'] ?? '',
                            'url' => $notification->data['url'] ?? '#',
                            'created_at' => $notification->created_at ? $notification->created_at->diffForHumans() : '',
                        ];
                    })->values()->toArray() : [],
            ],
        ];
    }
}
