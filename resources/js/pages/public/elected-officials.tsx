import { Link } from '@inertiajs/react';
import { Facebook, Instagram } from 'lucide-react';
import { GovernmentNavigation } from '@/components/kiblawan/government-navigation';
import { Container } from '@/components/kiblawan/ui/container';
import { PageHeader } from '@/components/kiblawan/ui/page-header';
import PublicLayout from '@/layouts/public/public-layout';
import { home } from '@/routes';
import type { Official } from '@/types';

export default function ElectedOfficials({
    mayor,
    viceMayor,
    members,
}: {
    mayor: Official | null;
    viceMayor: Official | null;
    members: Official[];
}) {
    const executiveLeaders = [
        { title: 'Mayor', official: mayor },
        { title: 'Vice Mayor', official: viceMayor },
    ];

    return (
        <PublicLayout title="Elected Officials">
            <PageHeader
                title="Elected Officials"
                subtitle="Meet the executive leaders and legislative council of Kiblawan."
            />
            <Container className="py-12 md:py-16">
                <GovernmentNavigation activeTab="officials" />

                <section aria-labelledby="executive-heading" className="mb-16">
                    <h2
                        id="executive-heading"
                        className="mb-6 font-display text-3xl font-bold text-primary"
                    >
                        The Executive
                    </h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {executiveLeaders.map(({ title, official }) => (
                            <article
                                key={title}
                                className="overflow-hidden rounded-[24px] border border-line bg-white shadow-k-card"
                            >
                                <img
                                    src={official?.photo_url || '/images/image.webp'}
                                    alt={official?.name ?? title}
                                    className="aspect-[16/10] w-full bg-cream object-contain object-top"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className="flex flex-col items-start gap-3 p-6 md:p-8">
                                    <p className="m-0 text-sm font-bold tracking-wide text-primary uppercase">
                                        {title}
                                    </p>
                                    <h3 className="m-0 font-display text-2xl font-bold text-primary md:text-3xl">
                                        {official?.name ?? 'Not listed yet'}
                                    </h3>
                                    {official && (
                                        <>
                                            <p className="m-0 text-ink-muted">
                                                {official.position}
                                            </p>
                                            <div className="mt-1 flex gap-3">
                                                {official.facebook_url && (
                                                    <a
                                                        href={
                                                            official.facebook_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={`${official.name} on Facebook`}
                                                        className="text-primary transition-colors hover:text-green-dark"
                                                    >
                                                        <Facebook className="h-5 w-5" />
                                                    </a>
                                                )}
                                                {official.instagram_url && (
                                                    <a
                                                        href={
                                                            official.instagram_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={`${official.name} on Instagram`}
                                                        className="text-primary transition-colors hover:text-green-dark"
                                                    >
                                                        <Instagram className="h-5 w-5" />
                                                    </a>
                                                )}
                                            </div>
                                            <Link
                                                href={`${home.url()}#mayor-corner`}
                                                className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green"
                                            >
                                                Read Message
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="legislative-heading">
                    <h2
                        id="legislative-heading"
                        className="mb-6 font-display text-3xl font-bold text-primary"
                    >
                        Legislative Council
                    </h2>
                    {members.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {members.map((member) => (
                                <article
                                    key={member.id}
                                    className="overflow-hidden rounded-[20px] border border-line bg-white shadow-k-card"
                                >
                                    <img
                                        src={member.photo_url || '/images/image.webp'}
                                        alt={member.name}
                                        className="aspect-[4/3] w-full bg-cream object-contain object-top"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="p-5">
                                        <h3 className="m-0 font-display text-xl font-bold text-primary">
                                            {member.name}
                                        </h3>
                                        <p className="mt-2 mb-0 text-sm text-ink-muted">
                                            Sangguniang Bayan Member
                                        </p>
                                        <div className="mt-3 flex gap-3">
                                            {member.facebook_url && (
                                                <a
                                                    href={member.facebook_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`${member.name} on Facebook`}
                                                    className="text-primary transition-colors hover:text-green-dark"
                                                >
                                                    <Facebook className="h-5 w-5" />
                                                </a>
                                            )}
                                            {member.instagram_url && (
                                                <a
                                                    href={member.instagram_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`${member.name} on Instagram`}
                                                    className="text-primary transition-colors hover:text-green-dark"
                                                >
                                                    <Instagram className="h-5 w-5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-[20px] border border-line bg-white p-8 text-ink-muted">
                            Sangguniang Bayan members will be listed here soon.
                        </p>
                    )}
                </section>
            </Container>
        </PublicLayout>
    );
}
