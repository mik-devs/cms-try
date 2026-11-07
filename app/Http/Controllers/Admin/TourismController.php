<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTourismRequest;
use App\Http\Requests\Admin\UpdateTourismRequest;
use App\Models\Barangay;
use App\Models\TourismSpot;
use App\Models\TourismSpotImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class TourismController extends Controller
{
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

        $imagePath = Storage::disk('public')->putFile('tourism', $request->file('image'));

        if ($imagePath === false) {
            throw new RuntimeException('The tourism spot image could not be stored.');
        }

        $validated['image'] = $imagePath;
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
            $imagePath = Storage::disk('public')->putFile('tourism', $request->file('image'));

            if ($imagePath === false) {
                throw new RuntimeException('The tourism spot image could not be stored.');
            }

            $validated['image'] = $imagePath;
        } else {
            unset($validated['image']);
        }

        $tourism->update($validated);
        $this->deleteGalleryImages($tourism, $removeImageIds);
        $this->storeGalleryImages($tourism, $galleryImages);

        if (
            $request->hasFile('image')
            && filled($previousImage)
            && Storage::disk('public')->exists($previousImage)
            && ! Storage::disk('public')->delete($previousImage)
        ) {
            throw new RuntimeException('The previous tourism spot image could not be deleted.');
        }

        return to_route('admin.tourism.index')->with('success', 'Tourism spot updated');
    }

    public function destroy(TourismSpot $tourism): RedirectResponse
    {
        $image = $tourism->image;
        $galleryImages = $tourism->images()->get();
        $tourism->delete();

        foreach ($galleryImages as $galleryImage) {
            if (
                filled($galleryImage->image_path)
                && Storage::disk('public')->exists($galleryImage->image_path)
                && ! Storage::disk('public')->delete($galleryImage->image_path)
            ) {
                throw new RuntimeException('A tourism gallery image could not be deleted.');
            }
        }

        if (
            filled($image)
            && Storage::disk('public')->exists($image)
            && ! Storage::disk('public')->delete($image)
        ) {
            throw new RuntimeException('The tourism spot image could not be deleted.');
        }

        return to_route('admin.tourism.index')->with('success', 'Tourism spot deleted');
    }

    public function destroyImage(TourismSpotImage $image): RedirectResponse
    {
        $imagePath = $image->image_path;

        if (
            filled($imagePath)
            && Storage::disk('public')->exists($imagePath)
            && ! Storage::disk('public')->delete($imagePath)
        ) {
            throw new RuntimeException('The tourism gallery image could not be deleted.');
        }

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
            $imagePath = Storage::disk('public')->putFile('tourism/gallery', $image);

            if ($imagePath === false) {
                throw new RuntimeException('A tourism gallery image could not be stored.');
            }

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
            if (
                filled($image->image_path)
                && Storage::disk('public')->exists($image->image_path)
                && ! Storage::disk('public')->delete($image->image_path)
            ) {
                throw new RuntimeException('A tourism gallery image could not be deleted.');
            }

            $image->delete();
        }
    }
}
