<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNewsRequest;
use App\Http\Requests\Admin\UpdateNewsRequest;
use App\Models\News;
use App\Actions\SanitizeHtmlAction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class NewsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/news/index', [
            'news' => News::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/news/create');
    }

public function store(StoreNewsRequest $request): RedirectResponse
        {
            $validated = $request->validated();

            if ($request->hasFile('image')) {
                $imagePath = Storage::disk('public')->putFile('news', $request->file('image'));

                if ($imagePath === false) {
                    throw new RuntimeException('The news image could not be stored.');
                }

                $validated['image'] = $imagePath;
            }

            $validated['user_id'] = auth()->id();

            $validated['content'] = (new SanitizeHtmlAction())->handle($validated['content'] ?? '');

            News::query()->create($validated);

            return to_route('admin.news.index')->with('success', 'News created');
        }

    public function edit(News $news): Response
    {
        return Inertia::render('admin/news/edit', [
            'news' => $news,
        ]);
    }

public function update(UpdateNewsRequest $request, News $news): RedirectResponse
        {
            $validated = $request->validated();
            $previousImage = $news->image;

            if ($request->hasFile('image')) {
                $imagePath = Storage::disk('public')->putFile('news', $request->file('image'));

                if ($imagePath === false) {
                    throw new RuntimeException('The news image could not be stored.');
                }

                $validated['image'] = $imagePath;
            }

            $validated['content'] = (new SanitizeHtmlAction())->handle($validated['content'] ?? '');

            $news->update($validated);

        if (
            $request->hasFile('image')
            && $previousImage !== null
            && Storage::disk('public')->exists($previousImage)
            && ! Storage::disk('public')->delete($previousImage)
        ) {
            throw new RuntimeException('The previous news image could not be deleted.');
        }

        return to_route('admin.news.index')->with('success', 'News updated');
    }

    public function destroy(News $news): RedirectResponse
    {
        $image = $news->image;
        $news->delete();

        if (
            $image !== null
            && Storage::disk('public')->exists($image)
            && ! Storage::disk('public')->delete($image)
        ) {
            throw new RuntimeException('The news image could not be deleted.');
        }

        return to_route('admin.news.index')->with('success', 'News deleted');
    }
}
