<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAchievementRequest;
use App\Http\Requests\Admin\UpdateAchievementRequest;
use App\Models\Achievement;
use App\Traits\HandlesImageUploads;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    use HandlesImageUploads;

    public function index(): Response
    {
        return Inertia::render('admin/achievements/index', [
            'achievements' => Achievement::query()->orderBy('order')->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/achievements/create');
    }

    public function store(StoreAchievementRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeOptimizedImage($request->file('image'), 'achievements');
        }

        Achievement::query()->create($validated);

        return to_route('admin.achievements.index')->with('success', 'Achievement created');
    }

    public function edit(Achievement $achievement): Response
    {
        return Inertia::render('admin/achievements/edit', [
            'achievement' => $achievement,
        ]);
    }

    public function update(
        UpdateAchievementRequest $request,
        Achievement $achievement,
    ): RedirectResponse {
        $validated = $request->validated();
        $previousImage = $achievement->image;

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeOptimizedImage($request->file('image'), 'achievements');
        }

        $achievement->update($validated);

        if ($request->hasFile('image')) {
            $this->deleteImage($previousImage);
        }

        return to_route('admin.achievements.index')->with('success', 'Achievement updated');
    }

    public function destroy(Achievement $achievement): RedirectResponse
    {
        $image = $achievement->image;
        $achievement->delete();

        $this->deleteImage($image);

        return to_route('admin.achievements.index')->with('success', 'Achievement deleted');
    }
}
