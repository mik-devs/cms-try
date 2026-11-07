import { useState } from 'react';
import { Camera, Medal, Megaphone, Images } from 'lucide-react';
import { Container } from '@/components/kiblawan/ui/container';
import { PageHeader } from '@/components/kiblawan/ui/page-header';
import { Section } from '@/components/kiblawan/ui/section';
import PublicLayout from '@/layouts/public/public-layout';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import type { MayorMessage } from '@/types';

const tabs = ['Photo Release', 'Speeches', 'Achievements', 'Gallery'] as const;

type MayorTab = (typeof tabs)[number];

const messageTypes: Record<MayorTab, string> = {
    'Photo Release': 'photo_release',
    Speeches: 'speech',
    Achievements: 'achievement',
    Gallery: 'gallery',
};

const tabIcons: Record<MayorTab, typeof Camera> = {
    'Photo Release': Camera,
    Speeches: Megaphone,
    Achievements: Medal,
    Gallery: Images,
};

export default function MayorsCorner({
    messages,
}: {
    messages: MayorMessage[];
}) {
    const [activeTab, setActiveTab] = useState<MayorTab>('Photo Release');
    const activeType = messageTypes[activeTab];
    const visibleMessages = messages.filter(
        (message) => message.message_type?.name === activeType,
    );
    const isGalleryTab = activeTab === 'Gallery';

    return (
        <PublicLayout title="Mayor's Corner | Municipality of Kiblawan">
            <PageHeader
                title="Mayor's Corner"
                subtitle="Latest news, speeches, and gallery from the Mayor's Office."
            />

            <Section className="bg-cream py-14 md:py-18">
                <Container>
                    <div
                        role="tablist"
                        aria-label="Mayor's Corner content types"
                        className="mb-10 flex flex-wrap gap-2 border-b border-line pb-4"
                    >
                        {tabs.map((tab) => {
                            const Icon = tabIcons[tab];
                            const isActive = tab === activeTab;

                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-controls={`mayors-corner-${tab}`}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-extrabold tracking-wide uppercase transition-all duration-300 ease-k-smooth sm:text-sm',
                                        isActive
                                            ? 'border-primary bg-primary text-white shadow-sm'
                                            : 'border-line bg-white text-primary hover:border-gold hover:bg-cream',
                                    )}
                                >
                                    <Icon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {tab}
                                </button>
                            );
                        })}
                    </div>

                    <div
                        id={`mayors-corner-${activeTab}`}
                        role="tabpanel"
                        aria-label={activeTab}
                    >
                        {visibleMessages.length === 0 ? (
                            <div className="rounded-[24px] border border-line bg-white p-10 text-center text-ink-muted shadow-sm">
                                No {activeTab.toLowerCase()} are available yet.
                            </div>
                        ) : isGalleryTab ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                                {visibleMessages.map((message) => (
                                    <figure
                                        key={message.id}
                                        className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
                                    >
                                        <img
                                            src={message.image_url || '/images/kib.png'}
                                            alt={message.title}
                                            className="h-full w-full object-cover transition-transform duration-500 ease-k-smooth group-hover:scale-105"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <figcaption className="absolute inset-0 flex items-end bg-linear-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <span className="line-clamp-2 text-xs leading-snug font-bold text-white sm:text-sm">
                                                {message.title}
                                            </span>
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {visibleMessages.map((message) => (
                                    <article
                                        key={message.id}
                                        className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-white shadow-k-card transition-all duration-300 ease-k-smooth hover:-translate-y-1 hover:shadow-k-glow"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                                            <img
                                                src={message.image_url || '/images/kib.png'}
                                                alt={message.title}
                                                className="h-full w-full object-cover transition-transform duration-500 ease-k-smooth group-hover:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            <time
                                                dateTime={
                                                    message.published_at ??
                                                    undefined
                                                }
                                                className="text-xs font-extrabold tracking-[0.16em] text-primary uppercase"
                                            >
                                                {formatDate(
                                                    message.published_at,
                                                )}
                                            </time>
                                            <h2 className="mt-2 font-display text-xl leading-snug font-bold text-primary">
                                                {message.title}
                                            </h2>
                                            <p className="mt-3 line-clamp-4 leading-relaxed text-ink-muted">
                                                {message.content}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </Container>
            </Section>
        </PublicLayout>
    );
}
