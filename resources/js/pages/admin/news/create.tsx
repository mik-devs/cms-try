import { Head } from '@inertiajs/react';
import NewsController from '@/actions/App/Http/Controllers/Admin/NewsController';
import NewsForm from '@/pages/admin/news/components/news-form';
import type { NewsCategory } from '@/types';

export default function CreateNews({
    newsCategories,
}: {
    newsCategories: NewsCategory[];
}) {
    return (
        <>
            <Head title="Create News" />
            <NewsForm
                title="Create News"
                backHref={NewsController.index.url()}
                newsCategories={newsCategories}
                onSubmit={(form) => form.post(NewsController.store.url())}
                submitLabel="Create News"
            />
        </>
    );
}
