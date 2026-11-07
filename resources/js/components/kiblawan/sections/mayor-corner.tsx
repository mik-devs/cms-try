import { ArrowRight, Facebook, Instagram } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';
import { Container } from '@/components/kiblawan/ui/container';
import { Headline } from '@/components/kiblawan/ui/headline';
import { JobCard } from '@/components/kiblawan/ui/job-card';
import { Section } from '@/components/kiblawan/ui/section';
import type { JobPosting, MayorMessage } from '@/types';

export function MayorCorner({
    message,
    jobs,
}: {
    message: MayorMessage | null;
    jobs: JobPosting[];
}) {
    const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
    const imageUrl = message?.image_url || '/images/mayor/mayor.jpg';
    const title = message?.title ?? "Welcome to the Mayor's Corner";
    const excerpt =
        message?.content ??
        'Explore the latest updates, speeches, and gallery from the Mayor’s Office.';

    return (
        <Section
            id="mayor-corner"
            className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/kib.webp)' }}
        >
            {/* Light overlay so the background isn't too distracting */}
            <div className="absolute inset-0 z-0 bg-cream/80" />

            <div className="relative z-10">
                <Container>
                    <div
                        ref={ref}
                        className="grid grid-cols-1 gap-8 lg:grid-cols-2"
                    >
                    <div
                        className={cn(
                            'slide-in-left h-full',
                            inView && 'is-visible',
                        )}
                    >
                        <Headline title={"Mayor's Corner"} />

                        <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-white shadow-k-card">
                            <div className="relative z-10 flex h-full flex-col">
                                <div className="relative w-full h-[400px] md:h-[480px] overflow-hidden rounded-t-[24px]">
                                    <img
                                        src={imageUrl}
                                        alt="Mayor's Photo"
                                        className="absolute inset-0 w-full h-full object-cover object-top"
                                        loading="eager"
                                        decoding="async"
                                    />
                                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                                        <a
                                            href="https://www.facebook.com/p/Carl-Jason-Rama-61570573016071/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-primary shadow-sm transition-colors duration-300 hover:bg-gold hover:text-primary-dark"
                                            aria-label="Mayor's Facebook"
                                        >
                                            <Facebook className="size-5" />
                                        </a>
                                        <a
                                            href="https://www.instagram.com/carljasonrama/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-primary shadow-sm transition-colors duration-300 hover:bg-gold hover:text-primary-dark"
                                            aria-label="Mayor's Instagram"
                                        >
                                            <Instagram className="size-5" />
                                        </a>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8">
                                    <p className="mb-2 text-xs font-extrabold tracking-[0.2em] text-primary uppercase">
                                        Latest from the Mayor
                                    </p>
                                    <h3 className="mb-2 font-display text-2xl font-bold text-primary">
                                        {title}
                                    </h3>
                                    <p className="mb-5 line-clamp-3 leading-relaxed text-ink-muted">
                                        {excerpt}
                                    </p>
                                    <Link
                                        href="/mayors-corner"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-extrabold tracking-wide text-primary-dark shadow-sm transition-all duration-300 ease-k-smooth hover:-translate-y-0.5 hover:bg-gold-soft"
                                    >
                                        View All Updates
                                        <ArrowRight
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className={cn(
                            'slide-in-right h-full',
                            inView && 'is-visible',
                        )}
                    >
                        <Headline
                            title="Latest Jobs"
                            action={{ label: 'More →', href: '/careers' }}
                        />

                        <div className="flex h-full flex-col gap-4 rounded-[24px] border border-line bg-white p-6 shadow-k-card">
                            {jobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    </div>
                    </div>
                </Container>
            </div>
        </Section>
    );
}
