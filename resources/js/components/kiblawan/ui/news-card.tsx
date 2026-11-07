import { Link } from '@inertiajs/react';
import { Calendar, Search } from 'lucide-react';
import { formatDate } from '@/lib/format-date';
import type { News } from '@/types';

export function NewsCard({ news }: { news: News }) {
    return (
        <Link
            href={`/news/${news.slug}`}
            className="group relative block overflow-hidden rounded-[20px] border border-line bg-white shadow-k-card transition-colors duration-300 ease-k-smooth hover:border-primary/30 hover:shadow-k-glow"
        >
            <div className="overflow-hidden">
                <img
                    src={news.image_url || '/images/image.webp'}
                    alt={news.title}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                />
            </div>

            <p className="m-0 px-[1.3rem] pt-5 pb-1 text-[0.96rem] leading-[1.45] font-extrabold text-primary">
                {news.title}
            </p>

            <strong className="flex items-center gap-1.5 px-[1.3rem] pb-5 text-sm font-semibold text-ink-muted">
                <Calendar className="size-3.5 text-primary" />
                {formatDate(news.published_at ?? news.created_at)}
            </strong>

            <div className="absolute inset-0 z-10 flex items-center justify-center bg-linear-to-b from-transparent to-dark-brown/90 opacity-0 transition-opacity duration-300 ease-k-smooth group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 text-[0.85rem] font-extrabold tracking-[0.06em] text-white uppercase">
                    <Search className="size-4" /> View Details
                </span>
            </div>
        </Link>
    );
}
