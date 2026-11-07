import { Link } from '@inertiajs/react';
import { ArrowLeft, Award, Facebook } from 'lucide-react';
import { Container } from '@/components/kiblawan/ui/container';
import PublicLayout from '@/layouts/public/public-layout';
import type { Achievement } from '@/types';

export default function AchievementShow({
    achievement,
}: {
    achievement: Achievement;
}) {
    return (
        <PublicLayout title={`${achievement.title} | Achievements`}>
            <section className="relative flex h-[420px] w-full items-end overflow-hidden bg-dark-brown md:h-[520px]">
                <img
                    src={achievement.image_url || '/images/image.webp'}
                    alt={achievement.title}
                    className="absolute inset-0 h-full w-full object-contain"
                    loading="eager"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-linear-to-t from-dark-brown via-dark-brown/45 to-transparent" />

                <Container className="relative z-10 pb-10 md:pb-14">
                    <div className="max-w-4xl">
                        <span className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 text-xs font-extrabold tracking-[0.16em] text-primary-dark uppercase shadow-sm">
                            <Award className="size-3.5" aria-hidden="true" />
                            Award · {achievement.badge_year}
                        </span>
                        <h1 className="mt-4 font-display text-3xl leading-tight font-bold text-white [text-shadow:0_6px_30px_rgba(0,0,0,0.45)] md:text-5xl">
                            {achievement.title}
                        </h1>
                    </div>
                </Container>
            </section>

            <Container className="py-10 md:py-16">
                <Link
                    href="/achievements"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-extrabold tracking-wide text-green-dark uppercase transition-colors hover:text-primary"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to Achievements
                </Link>

                <article className="overflow-hidden rounded-[24px] border border-line bg-white shadow-k-card">
                    <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
                        <div>
                            <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
                                About this achievement
                            </h2>
                            <p className="mt-4 leading-relaxed whitespace-pre-line text-ink-muted">
                                {achievement.description}
                            </p>

                            {achievement.facebook_url && (
                                <a
                                    href={achievement.facebook_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#1877f2] px-6 py-3.5 text-sm font-extrabold tracking-wide text-white shadow-sm transition-all duration-300 ease-k-smooth hover:-translate-y-0.5 hover:bg-[#1263c7]"
                                >
                                    <Facebook
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    View Official Facebook Post
                                </a>
                            )}
                        </div>

                        <aside className="h-fit rounded-[20px] border border-line bg-cream/60 p-6">
                            <p className="text-xs font-extrabold tracking-[0.2em] text-primary uppercase">
                                Awarded year
                            </p>
                            <p className="mt-2 font-display text-5xl font-bold text-primary">
                                {achievement.badge_year}
                            </p>
                            <div className="mt-6 border-t border-line pt-6">
                                <p className="text-xs font-extrabold tracking-[0.2em] text-ink-muted uppercase">
                                    Municipality of Kiblawan
                                </p>
                                <p className="mt-2 leading-relaxed text-ink-muted">
                                    Recognizing Kiblawan’s commitment to child
                                    welfare, good governance, and excellence in
                                    public service.
                                </p>
                            </div>
                        </aside>
                    </div>
                </article>
            </Container>
        </PublicLayout>
    );
}
