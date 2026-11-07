<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTourismRequest;
use App\Http\Requests\Admin\UpdateTourismRequest;
use App\Models\Barangay;
use App\Models\TourismSpot;
use App\Models\TourismSpotImage;
use App\Traits\HandlesImageUploads;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class TourismController extends Controller
{
    use HandlesImageUploads;

    public function index(): Response
    {
        return Inertia::render('admin/tourism/index', [
            'tourismSpots' => TourismSpot::query()
                ->with('barangay')
                ->orderBy('order')
                ->orderBy('id')
                ->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/tourism/create', [
            'barangays' => Barangay::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreTourismRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $galleryImages = $request->file('images', []);
        unset($validated['images']);

        $validated['image'] = $this->storeOptimizedImage($request->file('image'), 'tourism');
        $tourismSpot = TourismSpot::query()->create($validated);
        $this->storeGalleryImages($tourismSpot, $galleryImages);

        return to_route('admin.tourism.index')->with('success', 'Tourism spot created');
    }

    public function edit(TourismSpot $tourism): Response
    {
        $tourism->load('images', 'barangay');

        return Inertia::render('admin/tourism/edit', [
            'tourismSpot' => $tourism,
            'barangays' => Barangay::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(
        UpdateTourismRequest $request,
        TourismSpot $tourism,
    ): RedirectResponse {
        $validated = $request->validated();
        $galleryImages = $request->file('images', []);
        $removeImageIds = $validated['remove_images'] ?? [];
        unset($validated['images'], $validated['remove_images']);

        $previousImage = $tourism->image;

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeOptimizedImage($request->file('image'), 'tourism');
        } else {
            unset($validated['image']);
        }

        $tourism->update($validated);
        $this->deleteGalleryImages($tourism, $removeImageIds);
        $this->storeGalleryImages($tourism, $galleryImages);

        if ($request->hasFile('image')) {
            $this->deleteImage($previousImage);
        }

        return to_route('admin.tourism.index')->with('success', 'Tourism spot updated');
    }

    public function destroy(TourismSpot $tourism): RedirectResponse
    {
        $image = $tourism->image;
        $galleryImages = $tourism->images()->get();
        $tourism->delete();

        foreach ($galleryImages as $galleryImage) {
            $this->deleteImage($galleryImage->image_path);
        }

        $this->deleteImage($image);

        return to_route('admin.tourism.index')->with('success', 'Tourism spot deleted');
    }

    public function destroyImage(TourismSpotImage $image): RedirectResponse
    {
        $imagePath = $image->image_path;
        $this->deleteImage($imagePath);
        $image->delete();

        return back()->with('success', 'Gallery image deleted');
    }

    /**
     * @param  array<int, UploadedFile>  $images
     */
    private function storeGalleryImages(TourismSpot $tourismSpot, array $images): void
    {
        $order = (int) $tourismSpot->images()->max('order');

        foreach ($images as $image) {
            $imagePath = $this->storeOptimizedImage($image, 'tourism/gallery');

            $tourismSpot->images()->create([
                'image_path' => $imagePath,
                'order' => ++$order,
            ]);
        }
    }

    /**
     * @param  array<int, int|string>  $imageIds
     */
    private function deleteGalleryImages(TourismSpot $tourismSpot, array $imageIds): void
    {
        if ($imageIds === []) {
            return;
        }

        $images = $tourismSpot->images()->whereKey($imageIds)->get();

        foreach ($images as $image) {
            $this->deleteImage($image->image_path);
            $image->delete();
        }
    }
}
