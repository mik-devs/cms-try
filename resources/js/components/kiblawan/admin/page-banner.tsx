import { Link } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export interface PageBannerProps {
    title: string;
    subtitle: string;
    backHref?: string;
    backLabel?: string;
    actionLabel?: string;
    actionHref?: string;
    children?: ReactNode;
}

export function PageBanner({
    title,
    subtitle,
    backHref,
    backLabel,
    actionLabel,
    actionHref,
    children,
}: PageBannerProps) {
    return (
        <section className="relative min-h-[200px] shrink-0 overflow-hidden rounded-[24px] border-l-4 border-gold bg-primary p-8 text-white select-none md:min-h-[180px] md:px-12 md:py-10">
            <img
                src="/images/image.webp"
                alt=""
                aria-hidden="true"
                width={224}
                height={224}
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute -right-4 -bottom-8 w-40 opacity-10 md:w-56"
            />
            {children ? (
                <div className="absolute top-6 left-6 z-20 md:left-12">
                    {children}
                </div>
            ) : backHref ? (
                <Link
                    href={backHref}
                    className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm transition-colors hover:text-gold md:left-12"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to {backLabel ?? 'Admin'}
                </Link>
            ) : null}
            <div className="absolute right-8 bottom-8 left-8 z-10 pr-28 md:right-12 md:bottom-10 md:left-12 md:pr-48">
                <h1 className="relative z-10 font-display text-3xl font-bold text-white md:text-4xl">
                    {title}
                </h1>
                <p className="relative z-10 mt-2 max-w-2xl text-sm text-white/80 md:text-base">
                    {subtitle}
                </p>
            </div>
            {actionLabel && actionHref ? (
                <div className="absolute top-1/2 right-8 z-20 -translate-y-1/2">
                    <Button
                        asChild
                        className="bg-white text-primary hover:bg-cream"
                    >
                        <Link
                            href={actionHref}
                            className="inline-flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {actionLabel}
                        </Link>
                    </Button>
                </div>
            ) : null}
        </section>
    );
}

export default PageBanner;
