import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

import { Container } from '@/components/kiblawan/ui/container';
import { useCarousel } from '@/hooks/use-carousel';
import { renderEmphasisTitle } from '@/lib/emphasis-title';
import { cn, isExternalUrl } from '@/lib/utils';
import type { HeroSlide } from '@/types';

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
    const { index: current, goTo, next, prev, containerProps } = useCarousel({
        length: slides.length,
        autoplay: true,
        timeout: 4000,
        pauseOnHover: true,
    });

    if (slides.length === 0) {
        return (
            <section
                aria-label="Featured highlights"
                className="h-[calc(100vh-var(--nav-offset))] min-h-[620px] w-full bg-k-grad-hero"
            />
        );
    }

    return (
        <section
            aria-label="Featured highlights"
            aria-roledescription="carousel"
            className="relative h-[calc(100vh-var(--nav-offset))] min-h-[620px] w-full overflow-hidden bg-k-grad-hero"
            {...containerProps}
        >
            {slides.map((slide, index) => {
                const isActive = index === current;

                return (
                    <div
                        key={slide.id}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${index + 1} of ${slides.length}`}
                        aria-hidden={!isActive}
                        inert={!isActive}
                        className={cn(
                            'absolute inset-0 transition-opacity duration-[1000ms] ease-k-smooth',
                            isActive
                                ? 'opacity-100 z-10'
                                : 'opacity-0 z-0 pointer-events-none',
                        )}
                    >
                        <img
                            src={slide.image_url}
                            alt={slide.title}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading={index === 0 ? 'eager' : 'lazy'}
                            fetchPriority={
                                index === 0 ? 'high' : undefined
                            }
                            decoding="async"
                        />

                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,28,17,0.88)_0%,rgba(6,28,17,0.5)_50%,rgba(6,28,17,0.15)_100%)]" />

                        <Container className="relative z-[2] flex h-full w-full flex-col items-start justify-center px-4 py-8 text-left text-white sm:px-4 lg:px-4">
                            <div className="w-full max-w-3xl text-left">
                                {slide.kicker && (
                                    <p className="mb-4 inline-flex items-center gap-2.5 text-[0.78rem] font-extrabold tracking-[0.22em] text-gold uppercase before:block before:h-0.5 before:w-[26px] before:rounded-sm before:bg-gold before:content-['']">
                                        {slide.kicker}
                                    </p>
                                )}
                                <h2 className="mb-7 max-w-[20ch] font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.12] text-white [text-shadow:0_6px_30px_rgba(0,0,0,0.45)]">
                                    {renderEmphasisTitle(
                                        slide.title,
                                        slide.title_emphasis,
                                    )}
                                </h2>

                                {slide.subtitle && (
                                    <p className="mb-8 max-w-[52ch] text-[clamp(1rem,1.6vw,1.15rem)] leading-relaxed text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]">
                                        {slide.subtitle}
                                    </p>
                                )}

                                {slide.cta_text && slide.cta_link && (
                                isExternalUrl(slide.cta_link) ? (
                                    <a
                                        href={slide.cta_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-fit items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-extrabold tracking-wide text-primary-dark shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all duration-300 ease-k-smooth hover:-translate-y-0.5 hover:bg-gold-soft hover:shadow-[0_14px_36px_rgba(0,0,0,0.3)]"
                                    >
                                        {slide.cta_text}
                                        <span aria-hidden="true">→</span>
                                    </a>
                                ) : (
                                    <Link
                                        href={slide.cta_link}
                                        className="inline-flex w-fit items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-extrabold tracking-wide text-primary-dark shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all duration-300 ease-k-smooth hover:-translate-y-0.5 hover:bg-gold-soft hover:shadow-[0_14px_36px_rgba(0,0,0,0.3)]"
                                    >
                                        {slide.cta_text}
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                )
                            )}
                            </div>
                        </Container>
                    </div>
                );
            })}

            <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="absolute top-1/2 left-4 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-gold hover:text-primary-dark md:left-8"
            >
                <ChevronLeft className="size-6" aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="absolute top-1/2 right-4 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-gold hover:text-primary-dark md:right-8"
            >
                <ChevronRight className="size-6" aria-hidden="true" />
            </button>

            <div className="absolute right-0 bottom-7 left-0 z-[3] flex items-center justify-center gap-8">
                <div
                    role="tablist"
                    aria-label="Slide navigation"
                    className="flex gap-2.5"
                >
                    {slides.map((slide, index) => (
                        <button
                            key={slide.id}
                            type="button"
                            role="tab"
                            onClick={() => goTo(index)}
                            aria-selected={index === current}
                            aria-label={`Go to slide ${index + 1}`}
                            className={cn(
                                'h-1.5 rounded-full transition-all duration-[400ms] ease-k-smooth',
                                index === current
                                    ? 'w-14 bg-gold shadow-[0_0_12px_var(--color-gold)]'
                                    : 'w-9 bg-white/35',
                            )}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
