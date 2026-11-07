<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOfficialRequest;
use App\Http\Requests\Admin\UpdateOfficialRequest;
use App\Models\Committee;
use App\Models\Official;
use App\Traits\HandlesImageUploads;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OfficialController extends Controller
{
    use HandlesImageUploads;

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
            $validated['photo'] = $this->storeOptimizedImage($request->file('photo'), 'officials');
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
            $validated['photo'] = $this->storeOptimizedImage($request->file('photo'), 'officials');
        } else {
            unset($validated['photo']);
        }

        $official->update($validated);
        $official->committees()->sync($committees);

        if ($request->hasFile('photo')) {
            $this->deleteImage($previousPhoto);
        }

        return to_route('admin.officials.index')->with('success', 'Official updated');
    }

    public function destroy(Official $official): RedirectResponse
    {
        $photo = $official->photo;
        $official->delete();

        $this->deleteImage($photo);

        return to_route('admin.officials.index')->with('success', 'Official deleted');
    }
}
