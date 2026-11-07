<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOfficialRequest;
use App\Http\Requests\Admin\UpdateOfficialRequest;
use App\Models\Committee;
use App\Models\Official;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class OfficialController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/officials/index', [
            'officials' => Official::query()
                ->with('committees')
                ->orderBy('order')
                ->orderBy('id')
                ->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/officials/create', [
            'committees' => Committee::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreOfficialRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $committees = $validated['committees'] ?? [];
        unset($validated['committees']);

        if ($request->hasFile('photo')) {
            $photoPath = Storage::disk('public')->putFile('officials', $request->file('photo'));

            if ($photoPath === false) {
                throw new RuntimeException('The official photo could not be stored.');
            }

            $validated['photo'] = $photoPath;
        }

        $official = Official::query()->create($validated);
        $official->committees()->sync($committees);

        return to_route('admin.officials.index')->with('success', 'Official created');
    }

    public function edit(Official $official): Response
    {
        $official->load('committees');

        return Inertia::render('admin/officials/edit', [
            'official' => $official,
            'committees' => Committee::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(
        UpdateOfficialRequest $request,
        Official $official,
    ): RedirectResponse {
        $validated = $request->validated();
        $committees = $validated['committees'] ?? [];
        unset($validated['committees']);
        $previousPhoto = $official->photo;

        if ($request->hasFile('photo')) {
            $photoPath = Storage::disk('public')->putFile('officials', $request->file('photo'));

            if ($photoPath === false) {
                throw new RuntimeException('The official photo could not be stored.');
            }

            $validated['photo'] = $photoPath;
        } else {
            unset($validated['photo']);
        }

        $official->update($validated);
        $official->committees()->sync($committees);

        if (
            $request->hasFile('photo')
            && filled($previousPhoto)
            && Storage::disk('public')->exists($previousPhoto)
            && ! Storage::disk('public')->delete($previousPhoto)
        ) {
            throw new RuntimeException('The previous official photo could not be deleted.');
        }

        return to_route('admin.officials.index')->with('success', 'Official updated');
    }

    public function destroy(Official $official): RedirectResponse
    {
        $photo = $official->photo;
        $official->delete();

        if (
            filled($photo)
            && Storage::disk('public')->exists($photo)
            && ! Storage::disk('public')->delete($photo)
        ) {
            throw new RuntimeException('The official photo could not be deleted.');
        }

        return to_route('admin.officials.index')->with('success', 'Official deleted');
    }
}
