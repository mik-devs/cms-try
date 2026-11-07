import { Link } from '@inertiajs/react';
import { ArrowRight, Compass, MapPin } from 'lucide-react';
import { Container } from '@/components/kiblawan/ui/container';
import { PageHeader } from '@/components/kiblawan/ui/page-header';
import { WeatherWidget } from '@/components/kiblawan/sections/weather-widget';
import PublicLayout from '@/layouts/public/public-layout';
import type { TourismSpot } from '@/types';

export default function TourismIndex({ spots }: { spots: TourismSpot[] }) {
    return (
        <PublicLayout title="Tourism | Municipality of Kiblawan">
            <PageHeader
                title="Discover Kiblawan"
                subtitle="Explore the natural wonders, eco-adventures, and hidden gems of our municipality."
            />
            <Container className="py-12 md:py-20">
                {spots.length > 0 ? (
                    <>
                        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.22em] text-green-dark uppercase">
                                    <Compass
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Eco-Tourism Destinations
                                </p>
                                <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
                                    Places worth the journey
                                </h2>
                            </div>
                            <span className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-muted">
                                {spots.length}{' '}
                                {spots.length === 1
                                    ? 'destination'
                                    : 'destinations'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {spots.map((spot) => (
                                <Link
                                    key={spot.id}
                                    href={`/tourism/${spot.slug}`}
                                    className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-white shadow-k-soft transition-all duration-300 ease-k-smooth hover:-translate-y-1 hover:border-gold/40 hover:shadow-k-card"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={spot.image_url || '/images/image.webp'}
                                            alt={spot.name}
                                            className="h-full w-full object-cover transition-transform duration-500 ease-k-smooth group-hover:scale-105"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        {spot.category && (
                                            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-dark-brown/85 px-3 py-1.5 text-[0.7rem] font-extrabold tracking-[0.08em] text-gold uppercase backdrop-blur-sm">
                                                <MapPin
                                                    className="size-3"
                                                    aria-hidden="true"
                                                />
                                                {spot.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <h3 className="mb-3 font-display text-xl font-bold text-primary">
                                            {spot.name}
                                        </h3>
                                        <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                                            {spot.description}
                                        </p>
                                        <span className="mt-auto inline-flex items-center gap-2 text-sm font-extrabold tracking-wide text-green-dark uppercase transition-colors group-hover:text-primary">
                                            Explore destination
                                            <ArrowRight
                                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="rounded-[24px] border border-line bg-white p-10 text-center shadow-k-soft">
                        <Compass
                            className="mx-auto mb-4 size-10 text-gold"
                            aria-hidden="true"
                        />
                        <h2 className="mb-2 font-display text-2xl font-bold text-primary">
                            Tourism spots are coming soon
                        </h2>
                        <p className="text-ink-muted">
                            Please check back later as we prepare our
                            eco-tourism destinations.
                        </p>
                    </div>
                )}
            </Container>
            <WeatherWidget />
        </PublicLayout>
    );
}
