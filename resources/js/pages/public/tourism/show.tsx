import { Link } from '@inertiajs/react';
import { ArrowLeft, Check, MapPin, Navigation, Phone } from 'lucide-react';
import { Container } from '@/components/kiblawan/ui/container';
import PublicLayout from '@/layouts/public/public-layout';
import type { TourismSpot } from '@/types';

const TIPS = [
    'Best visited during the dry season.',
    'Secure a local guide before trekking.',
    'Help keep the area clean and leave no trace.',
] as const;

export default function TourismShow({ spot }: { spot: TourismSpot }) {
    const galleryImages = spot.images ?? [];

    return (
        <PublicLayout title={`${spot.name} | Tourism`}>
            <section className="relative h-[400px] w-full overflow-hidden md:h-[500px]">
                <img
                    src={spot.image_url || '/images/image.webp'}
                    alt={spot.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-linear-to-t from-dark-brown/95 via-dark-brown/35 to-transparent" />

                <Container className="relative z-10 flex h-full flex-col justify-end pb-10 md:pb-14">
                    <div className="max-w-3xl">
                        {spot.category && (
                            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 text-xs font-extrabold tracking-[0.16em] text-primary-dark uppercase shadow-sm">
                                <MapPin
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                                {spot.category}
                            </span>
                        )}
                        <h1 className="font-display text-4xl leading-tight font-bold text-white [text-shadow:0_6px_30px_rgba(0,0,0,0.45)] md:text-5xl lg:text-6xl">
                            {spot.name}
                        </h1>
                    </div>
                </Container>
            </section>

            <Container className="py-10 md:py-16">
                <Link
                    href="/tourism"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-extrabold tracking-wide text-green-dark uppercase transition-colors hover:text-primary"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to Tourism
                </Link>

                <article className="rounded-[24px] bg-white p-8 shadow-sm md:p-12">
                    <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
                        <div>
                            <h2 className="mb-4 font-display text-2xl font-bold text-primary md:text-3xl">
                                About {spot.name}
                            </h2>
                            <p className="leading-relaxed whitespace-pre-line text-ink-muted">
                                {spot.description}
                            </p>
                        </div>

                        <aside className="rounded-[20px] border border-line bg-cream/60 p-6">
                            <h3 className="mb-3 font-display text-xl font-bold text-primary">
                                Location &amp; Tips
                            </h3>
                            <p className="mb-5 flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
                                <MapPin
                                    className="mt-0.5 size-4 shrink-0 text-green-dark"
                                    aria-hidden="true"
                                />
                                <span>
                                    Located in the Municipality of Kiblawan,
                                    Davao del Sur. Bring your own food and
                                    water, wear comfortable footwear, and follow
                                    the guidance of local tourism staff.
                                </span>
                            </p>
                            <ul className="space-y-3 text-sm text-ink-muted">
                                {TIPS.map((tip) => (
                                    <li
                                        key={tip}
                                        className="flex items-start gap-2.5"
                                    >
                                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-green-dark">
                                            <Check
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </aside>
                    </div>

                    {galleryImages.length > 0 && (
                        <section className="mt-10 border-t border-line pt-8">
                            <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
                                Gallery
                            </h2>
                            <p className="mt-1 text-sm text-ink-muted">
                                Snapshots of {spot.name}.
                            </p>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {galleryImages.map((image) => (
                                    <a
                                        key={image.id}
                                        href={image.image_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group overflow-hidden rounded-[18px] border border-line-soft shadow-sm"
                                    >
                                        <img
                                            src={image.image_url || '/images/image.webp'}
                                            alt={`${spot.name} photo`}
                                            className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-k-smooth group-hover:scale-105"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    {spot.latitude && spot.longitude && (
                        <section className="mt-10 border-t border-line pt-8">
                            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
                                        Location &amp; Directions
                                    </h2>
                                    <p className="mt-1 text-sm text-ink-muted">
                                        Plan your visit to {spot.name}.
                                    </p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold tracking-wide text-white transition-colors hover:bg-primary-dark"
                                >
                                    <Navigation
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Get Directions
                                </a>
                            </div>
                            <div className="mt-6 h-[400px] w-full overflow-hidden rounded-[24px] border border-line-soft shadow-sm">
                                <iframe
                                    title={`Map of ${spot.name}`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    src={`https://maps.google.com/maps?q=${spot.latitude},${spot.longitude}&hl=en&z=14&output=embed`}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </section>
                    )}

                    <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-8">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-extrabold tracking-wide text-primary-dark shadow-sm transition-all duration-300 ease-k-smooth hover:-translate-y-0.5 hover:bg-gold-soft"
                        >
                            <Phone className="size-4" aria-hidden="true" />
                            Contact Tourism Office
                        </Link>
                        <Link
                            href="/tourism"
                            className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-extrabold tracking-wide text-primary transition-colors hover:border-gold hover:bg-cream"
                        >
                            View all destinations
                        </Link>
                    </div>
                </article>
            </Container>
        </PublicLayout>
    );
}
