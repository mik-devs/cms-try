import { Facebook, Instagram } from 'lucide-react';
import { GovernmentNavigation } from '@/components/kiblawan/government-navigation';
import { Container } from '@/components/kiblawan/ui/container';
import { PageHeader } from '@/components/kiblawan/ui/page-header';
import PublicLayout from '@/layouts/public/public-layout';
import type { Official } from '@/types';

export default function SangguniangBayan({
    viceMayor,
    members,
}: {
    viceMayor: Official | null;
    members: Official[];
}) {
    return (
        <PublicLayout title="Sangguniang Bayan">
            <PageHeader
                title="Sangguniang Bayan"
                subtitle="The legislative council of the Municipality of Kiblawan."
            />
            <Container className="py-12 md:py-16">
                <GovernmentNavigation activeTab="sangguniang-bayan" />

                <section
                    aria-labelledby="presiding-officer-heading"
                    className="mb-16"
                >
                    <h2
                        id="presiding-officer-heading"
                        className="mb-6 font-display text-3xl font-bold text-primary"
                    >
                        Presiding Officer
                    </h2>
                    <article className="grid overflow-hidden rounded-[24px] border border-line bg-white shadow-k-card md:grid-cols-[minmax(16rem,0.8fr)_1.2fr]">
                        <img
                            src={viceMayor?.photo_url || '/images/image.png'}
                            alt={viceMayor?.name ?? 'Vice Mayor'}
                            className="aspect-[4/3] w-full bg-cream object-contain object-top md:aspect-auto md:min-h-80"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="flex flex-col justify-center gap-3 p-6 md:p-10">
                            <p className="m-0 text-sm font-bold tracking-wide text-primary uppercase">
                                Vice Mayor
                            </p>
                            <h3 className="m-0 font-display text-3xl font-bold text-primary md:text-4xl">
                                {viceMayor?.name ?? 'Not listed yet'}
                            </h3>
                            {viceMayor && (
                                <>
                                    <p className="m-0 text-ink-muted">
                                        {viceMayor.position}
                                    </p>
                                    <div className="mt-1 flex gap-3">
                                        {viceMayor.facebook_url && (
                                            <a
                                                href={viceMayor.facebook_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${viceMayor.name} on Facebook`}
                                                className="text-primary transition-colors hover:text-green-dark"
                                            >
                                                <Facebook className="h-5 w-5" />
                                            </a>
                                        )}
                                        {viceMayor.instagram_url && (
                                            <a
                                                href={viceMayor.instagram_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${viceMayor.name} on Instagram`}
                                                className="text-primary transition-colors hover:text-green-dark"
                                            >
                                                <Instagram className="h-5 w-5" />
                                            </a>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </article>
                </section>

                <section aria-labelledby="councilors-heading" className="mb-16">
                    <h2
                        id="councilors-heading"
                        className="mb-6 font-display text-3xl font-bold text-primary"
                    >
                        The Councilors
                    </h2>
                    {members.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {members.map((member) => (
                                <article
                                    key={member.id}
                                    className="overflow-hidden rounded-[20px] border border-line bg-white shadow-k-card"
                                >
                                    <img
                                        src={member.photo_url || '/images/image.png'}
                                        alt={member.name}
                                        className="aspect-[4/3] w-full bg-cream object-contain object-top"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="p-5">
                                        <h3 className="m-0 font-display text-xl font-bold text-primary">
                                            {member.name}
                                        </h3>
                                        <p className="mt-1 mb-3 text-sm text-ink-muted">
                                            Sangguniang Bayan Member
                                        </p>
                                        <div className="mb-3 flex gap-3">
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
                                        {member.committees &&
                                            member.committees.length > 0 && (
                                                <>
                                                    <p className="m-0 text-sm font-semibold text-primary">
                                                        Committees
                                                    </p>
                                                    <ul className="mt-1 mb-0 list-inside list-disc text-sm text-ink-muted">
                                                        {member.committees.map(
                                                            (committee) => (
                                                                <li
                                                                    key={
                                                                        committee.id
                                                                    }
                                                                >
                                                                    {
                                                                        committee.name
                                                                    }
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </>
                                            )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-[20px] border border-line bg-white p-8 text-ink-muted">
                            Councilors will be listed here soon.
                        </p>
                    )}
                </section>

                <section aria-labelledby="session-heading">
                    <h2
                        id="session-heading"
                        className="mb-6 font-display text-3xl font-bold text-primary"
                    >
                        Legislative Session
                    </h2>
                    <article className="rounded-[20px] border border-line bg-white p-6 shadow-k-card md:p-8">
                        <p className="m-0 text-lg font-semibold text-primary">
                            Regular Session: Every Tuesday at 9:00 AM | SB
                            Session Hall
                        </p>
                    </article>
                </section>
            </Container>
        </PublicLayout>
    );
}
