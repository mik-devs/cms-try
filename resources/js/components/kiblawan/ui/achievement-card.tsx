import { Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import type { Achievement } from '@/types';

export function AchievementCard({ achievement }: { achievement: Achievement }) {
    return (
        <div className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-white shadow-k-card transition-colors duration-300 ease-k-smooth hover:border-primary/30 hover:shadow-k-glow">
            <div className="relative aspect-[4/3] overflow-hidden bg-image-bed">
                <img
                    src={achievement.image_url || '/images/image.webp'}
                    alt={achievement.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                />
                <div className="absolute inset-0 z-[2] flex items-center justify-center bg-linear-to-b from-transparent to-dark-brown/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Link
                        href={`/achievements/${achievement.id}`}
                        className="inline-flex items-center gap-2 text-[0.85rem] font-extrabold tracking-[0.06em] text-white uppercase"
                    >
                        <Search className="size-4" /> View Details
                    </Link>
                </div>
            </div>

            <div className="relative grow p-6 pt-[1.6rem] pb-[1.8rem]">
                <div className="absolute -top-[1.1rem] right-6 z-[3] rounded-full bg-gold px-3.5 py-1 font-sans text-[0.78rem] font-extrabold text-primary shadow-sm">
                    {achievement.badge_year}
                </div>
                <h3 className="m-0 mb-2.5 font-display text-[1.15rem] leading-tight text-primary">
                    {achievement.title}
                </h3>
                <p className="m-0 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                    {achievement.description}
                </p>
            </div>
        </div>
    );
}
