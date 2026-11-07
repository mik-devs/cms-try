<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHeroSlideRequest;
use App\Http\Requests\Admin\UpdateHeroSlideRequest;
use App\Models\HeroSlide;
use App\Traits\HandlesImageUploads;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class HeroSlideController extends Controller
{
    use HandlesImageUploads;

    public function index(): Response
    {
        return Inertia::render('admin/hero-slides/index', [
            'heroSlides' => HeroSlide::query()
                ->orderBy('order')
                ->orderBy('id')
                ->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/hero-slides/create');
    }

    public function store(StoreHeroSlideRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['image'] = $this->storeOptimizedImage($request->file('image'), 'hero');

        HeroSlide::query()->create($validated);

        return to_route('admin.hero-slides.index')->with('success', 'Hero slide created');
    }

    public function edit(HeroSlide $heroSlide): Response
    {
        return Inertia::render('admin/hero-slides/edit', [
            'heroSlide' => $heroSlide,
        ]);
    }

    public function update(
        UpdateHeroSlideRequest $request,
        HeroSlide $heroSlide,
    ): RedirectResponse {
        $validated = $request->validated();
        $previousImage = $heroSlide->image;

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeOptimizedImage($request->file('image'), 'hero');
        } else {
            unset($validated['image']);
        }

        $heroSlide->update($validated);

        if ($request->hasFile('image')) {
            $this->deleteImage($previousImage);
        }

        return to_route('admin.hero-slides.index')->with('success', 'Hero slide updated');
    }

    public function destroy(HeroSlide $heroSlide): RedirectResponse
    {
        $image = $heroSlide->image;
        $heroSlide->delete();

        $this->deleteImage($image);

        return to_route('admin.hero-slides.index')->with('success', 'Hero slide deleted');
    }
}
