<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMayorMessageRequest;
use App\Http\Requests\Admin\UpdateMayorMessageRequest;
use App\Models\MayorMessage;
use App\Actions\SanitizeHtmlAction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class MayorMessageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/mayor-messages/index', [
            'mayorMessages' => MayorMessage::query()
                ->orderByDesc('published_at')
                ->orderByDesc('id')
                ->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/mayor-messages/create');
    }

public function store(StoreMayorMessageRequest $request): RedirectResponse
        {
            $validated = $request->validated();

            if ($request->hasFile('image')) {
                $imagePath = Storage::disk('public')->putFile('mayor', $request->file('image'));

                if ($imagePath === false) {
                    throw new RuntimeException('The mayor message image could not be stored.');
                }

                $validated['image'] = $imagePath;
            }

            $validated['content'] = (new SanitizeHtmlAction())->handle($validated['content'] ?? '');

            MayorMessage::query()->create($validated);

            return to_route('admin.mayor-messages.index')->with('success', 'Mayor message created');
        }

    public function edit(MayorMessage $mayorMessage): Response
    {
        return Inertia::render('admin/mayor-messages/edit', [
            'mayorMessage' => $mayorMessage,
        ]);
    }

    public function update(
        UpdateMayorMessageRequest $request,
        MayorMessage $mayorMessage,
    ): RedirectResponse {
        $validated = $request->validated();
        $previousImage = $mayorMessage->image;

        if ($request->hasFile('image')) {
            $imagePath = Storage::disk('public')->putFile('mayor', $request->file('image'));

            if ($imagePath === false) {
                throw new RuntimeException('The mayor message image could not be stored.');
            }

            $validated['image'] = $imagePath;
        } else {
            unset($validated['image']);
        }

        $validated['content'] = (new SanitizeHtmlAction())->handle($validated['content'] ?? '');

        $mayorMessage->update($validated);

        if (
            $request->hasFile('image')
            && filled($previousImage)
            && Storage::disk('public')->exists($previousImage)
            && ! Storage::disk('public')->delete($previousImage)
        ) {
            throw new RuntimeException('The previous mayor message image could not be deleted.');
        }

        return to_route('admin.mayor-messages.index')->with('success', 'Mayor message updated');
    }

    public function destroy(MayorMessage $mayorMessage): RedirectResponse
    {
        $image = $mayorMessage->image;
        $mayorMessage->delete();

        if (
            filled($image)
            && Storage::disk('public')->exists($image)
            && ! Storage::disk('public')->delete($image)
        ) {
            throw new RuntimeException('The mayor message image could not be deleted.');
        }

        return to_route('admin.mayor-messages.index')->with('success', 'Mayor message deleted');
    }
}
