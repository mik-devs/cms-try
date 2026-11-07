import { Head } from '@inertiajs/react';
import NewsController from '@/actions/App/Http/Controllers/Admin/NewsController';
import ResourceTable from '@/pages/admin/components/resource-table';
import { Badge } from '@/components/ui/badge';
import type { News } from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedNews {
    data: News[];
    links: PaginationLink[];
}

export default function NewsIndex({ news }: { news: PaginatedNews }) {
    return (
        <>
            <Head title="News" />
            <ResourceTable<News>
                title="News"
                description="Manage news articles and announcements."
                items={news.data}
                links={news.links}
                createHref={NewsController.create.url()}
                createLabel="Create News"
                editHref={(item) => NewsController.edit.url(item.id)}
                deleteHref={(item) => NewsController.destroy.url(item.id)}
                getItemLabel={(item) => item.title}
                emptyMessage="No news items found."
                columns={[
                    {
                        label: 'Image',
                        render: (item) =>
                            item.image_url ? (
                                <img
                                    src={item.image_url}
                                    alt=""
                                    className="h-14 w-14 rounded-lg border border-line-soft object-cover shadow-sm"
                                />
                            ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-line-soft bg-cream/50 text-ink-muted">
                                    <span className="text-xs">No img</span>
                                </div>
                            ),
                    },
                    {
                        label: 'Title',
                        render: (item) => (
                            <span className="font-medium">{item.title}</span>
                        ),
                    },
                    {
                        label: 'Category',
                        render: (item) => (
                            <span className="capitalize">
                                {item.news_category?.name ?? '-'}
                            </span>
                        ),
                    },
                    {
                        label: 'Status',
                        render: (item) => (
                            <Badge
                                className={
                                    item.status === 'published'
                                        ? 'border-transparent bg-green-100 text-green-800'
                                        : 'border-transparent bg-yellow-100 text-yellow-800'
                                }
                            >
                                {item.status}
                            </Badge>
                        ),
                    },
                    {
                        label: 'Date',
                        render: (item) =>
                            item.published_at
                                ? new Date(item.published_at).toLocaleDateString()
                                : '—',
                    },
                ]}
            />
        </>
    );
}
