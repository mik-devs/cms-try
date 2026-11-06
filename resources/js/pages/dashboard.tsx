import { Head, Link, usePage } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    Calendar as CalendarIcon,
    Clock,
    Gavel,
    MapPin,
    Newspaper,
    Plus,
    ShieldCheck,
    TrendingUp,
    Users,
    Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import NewsController from '@/actions/App/Http/Controllers/Admin/NewsController';
import JobController from '@/actions/App/Http/Controllers/Admin/JobController';
import BidController from '@/actions/App/Http/Controllers/Admin/BidController';
import TourismController from '@/actions/App/Http/Controllers/Admin/TourismController';
import { create as createVideo } from '@/actions/App/Http/Controllers/Admin/OfficialVideoController';
import PageBanner from '@/components/kiblawan/admin/page-banner';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

type DashboardStats = {
    news: number;
    jobs: number;
    bids: number;
    officials: number;
    tourism: number;
};

type UpcomingEvent = {
    title: string;
    date: string;
    type: string;
};

type RecentActivity = {
    type: string;
    title: string;
    created_at: string;
};

type DashboardProps = {
    stats?: DashboardStats;
    upcomingEvents?: UpcomingEvent[];
    recentActivity?: RecentActivity[];
};

const defaultStats: DashboardStats = {
    news: 0,
    jobs: 0,
    bids: 0,
    officials: 0,
    tourism: 0,
};

function formatTimeAgo(dateString?: string): string {
    if (!dateString) {
        return 'recently';
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return 'recently';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function getActivityMeta(type: string): {
    icon: LucideIcon;
    dotColor: string;
    iconBg: string;
} {
    switch (type) {
        case 'News':
            return {
                icon: Newspaper,
                dotColor: 'bg-red-500',
                iconBg: 'bg-red-50 text-red-600',
            };
        case 'Job':
            return {
                icon: BriefcaseBusiness,
                dotColor: 'bg-blue-500',
                iconBg: 'bg-blue-50 text-blue-600',
            };
        case 'Tourism':
            return {
                icon: MapPin,
                dotColor: 'bg-amber-500',
                iconBg: 'bg-amber-50 text-amber-600',
            };
        default:
            return {
                icon: Newspaper,
                dotColor: 'bg-maroon',
                iconBg: 'bg-maroon/10 text-maroon',
            };
    }
}

export default function Dashboard({
    stats = defaultStats,
    upcomingEvents = [],
    recentActivity = [],
}: DashboardProps) {
    const { auth } = usePage().props;
    const permissions = (auth?.user?.permissions ?? []) as string[];
    const roles = (auth?.user?.roles ?? []) as string[];
    const isSuperAdmin = roles.includes('super_admin');

    const hasPermission = (permission: string) =>
        isSuperAdmin || permissions.includes(permission);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const eventDates = useMemo(
        () =>
            upcomingEvents
                .map((event) => new Date(`${event.date}T00:00:00`))
                .filter((date) => !Number.isNaN(date.getTime())),
        [upcomingEvents],
    );

    const statCards = [
        {
            label: 'Total News',
            value: stats.news,
            icon: Newspaper,
            circleColor: 'bg-maroon/10 text-maroon',
            trend: '+12%',
        },
        {
            label: 'Total Jobs',
            value: stats.jobs,
            icon: BriefcaseBusiness,
            circleColor: 'bg-emerald-50 text-emerald-700',
            trend: '+8%',
        },
        {
            label: 'Tourism Spots',
            value: stats.tourism,
            icon: MapPin,
            circleColor: 'bg-gold/25 text-amber-900',
            trend: '+5%',
        },
        {
            label: 'Officials',
            value: stats.officials,
            icon: Users,
            circleColor: 'bg-forest/10 text-forest',
            trend: '+2%',
        },
    ];

    const quickActions = [
        {
            label: 'Create News',
            href: NewsController.create.url(),
            icon: Newspaper,
            canAccess: hasPermission('manage news'),
        },
        {
            label: 'Add Job',
            href: JobController.create.url(),
            icon: BriefcaseBusiness,
            canAccess: hasPermission('manage jobs'),
        },
        {
            label: 'Upload Tourism Spot',
            href: TourismController.create.url(),
            icon: MapPin,
            canAccess: hasPermission('manage tourism'),
        },
        {
            label: 'Add Bid',
            href: BidController.create.url(),
            icon: Gavel,
            canAccess:
                hasPermission('manage transparency'),
        },
        {
            label: 'Add Official Video',
            href: createVideo.url(),
            icon: Video,
            canAccess:
                hasPermission('manage settings'),
        },
    ];

    const availableActions = quickActions.filter((action) => action.canAccess);

    return (
        <>
            <Head title="Dashboard" />
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-6 md:p-8">
                {/* 1. RESTORED PAGE BANNER */}
                <PageBanner
                    title="Dashboard"
                    subtitle="Welcome back to the Kiblawan Admin Console."
                />

                {/* 2. UPGRADED STAT CARDS */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="group relative overflow-hidden rounded-[20px] border border-line-soft bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                                        {card.label}
                                    </p>
                                    <p className="mt-2.5 font-display text-4xl font-bold tracking-tight text-forest">
                                        {Number(card.value ?? 0).toLocaleString()}
                                    </p>
                                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-600">
                                        <TrendingUp className="size-4 shrink-0" />
                                        <span>{card.trend}</span>
                                        <span className="font-normal text-ink-muted">
                                            vs last month
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className={cn(
                                        'flex size-13 shrink-0 items-center justify-center rounded-2xl shadow-2xs transition-transform duration-300 group-hover:scale-105',
                                        card.circleColor,
                                    )}
                                >
                                    <card.icon className="size-6" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. CALENDAR, QUICK ACTIONS & RECENT ACTIVITY */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* CALENDAR CARD */}
                    <div className="flex flex-col justify-between rounded-[20px] border border-line-soft bg-white p-6 shadow-xs lg:col-span-2">
                        <div>
                            <div className="mb-4 flex items-center justify-between border-b border-line-soft/80 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-maroon/10 text-maroon">
                                        <CalendarIcon className="size-5" />
                                    </span>
                                    <div>
                                        <h2 className="font-display text-lg font-bold text-forest">
                                            Calendar & Events
                                        </h2>
                                        <p className="text-xs text-ink-muted">
                                            Schedules and municipal milestones
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full border border-line-soft bg-cream px-3 py-1 text-xs font-bold tracking-wide text-forest">
                                    {selectedDate
                                        ? selectedDate.toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                          })
                                        : 'Today'}
                                </span>
                            </div>

                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                modifiers={{ event: eventDates }}
                                modifiersClassNames={{
                                    event: 'relative font-bold after:absolute after:bottom-1 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-maroon',
                                }}
                                className="flex w-full justify-center p-0"
                                classNames={{
                                    caption_label:
                                        'text-xl font-display font-bold text-maroon mb-4',
                                    nav: 'flex items-center gap-1.5',
                                    button_previous:
                                        'size-8 rounded-lg border border-line-soft bg-cream/30 p-0 text-forest hover:bg-cream hover:text-maroon transition-colors',
                                    button_next:
                                        'size-8 rounded-lg border border-line-soft bg-cream/30 p-0 text-forest hover:bg-cream hover:text-maroon transition-colors',
                                    month_grid: 'w-full border-collapse mt-2',
                                    weekdays: 'flex justify-between border-b border-line-soft pb-2',
                                    weekday:
                                        'text-ink-muted/80 rounded-md w-9 font-bold text-[0.75rem] uppercase tracking-wider text-center',
                                    week: 'flex w-full justify-between mt-2',
                                    day: 'size-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                                    day_button:
                                        'size-9 p-0 font-medium rounded-xl text-ink transition-all duration-150 hover:bg-maroon/10 hover:text-maroon hover:scale-105 active:scale-95 aria-selected:opacity-100',
                                    selected:
                                        'bg-maroon text-white font-bold shadow-xs hover:bg-maroon hover:text-white focus:bg-maroon focus:text-white',
                                    today: 'border-2 border-gold text-forest font-bold bg-cream/40',
                                    outside:
                                        'text-ink-muted/40 opacity-40 hover:bg-transparent hover:text-ink-muted/40',
                                }}
                            />
                        </div>

                        {upcomingEvents.length > 0 && (
                            <div className="mt-5 space-y-2.5 border-t border-line-soft pt-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                                        Upcoming Schedules
                                    </p>
                                    <span className="text-[11px] font-semibold text-maroon">
                                        {upcomingEvents.length} event
                                        {upcomingEvents.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                    {upcomingEvents.slice(0, 5).map((event, index) => (
                                        <div
                                            key={`${event.title}-${index}`}
                                            className="flex items-center justify-between rounded-xl border border-line-soft bg-cream/40 px-3.5 py-2.5 transition-colors hover:bg-cream"
                                        >
                                            <div className="min-w-0 pr-2">
                                                <p className="truncate text-xs font-semibold text-forest">
                                                    {event.title}
                                                </p>
                                                <p className="text-[11px] text-ink-muted">
                                                    {event.type}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-md border border-line-soft bg-white px-2 py-0.5 text-[11px] font-semibold text-maroon shadow-2xs">
                                                {new Date(
                                                    `${event.date}T00:00:00`,
                                                ).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4. UPGRADED QUICK ACTIONS */}
                    <div className="flex flex-col rounded-[20px] border border-line-soft bg-white p-6 shadow-xs lg:col-span-1">
                        <div className="mb-4">
                            <h2 className="font-display text-lg font-bold text-forest">
                                Quick Actions
                            </h2>
                            <p className="text-xs text-ink-muted">
                                Create new content and manage portals
                            </p>
                        </div>
                        {availableActions.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                                <div className="flex size-12 items-center justify-center rounded-full bg-cream text-ink-muted">
                                    <ShieldCheck className="size-6 text-ink-muted/60" />
                                </div>
                                <p className="mt-3 text-sm font-medium text-ink-muted">
                                    No quick actions available.
                                </p>
                                <p className="mt-1 text-xs text-ink-muted/70">
                                    You don't have publishing permissions.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col justify-start space-y-3">
                                {availableActions.map((action) => (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className="group flex items-center justify-between rounded-xl border border-line-soft bg-cream/50 p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-cream hover:shadow-md"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-maroon shadow-2xs transition-colors group-hover:bg-maroon group-hover:text-white">
                                                <action.icon className="size-4.5" />
                                            </span>
                                            <span className="truncate text-sm font-semibold text-forest">
                                                {action.label}
                                            </span>
                                        </div>
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-ink-muted shadow-2xs transition-all group-hover:bg-forest group-hover:text-white">
                                            <Plus className="size-4" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 5. REFINED RECENT ACTIVITY */}
                    <div className="flex flex-col rounded-[20px] border border-line-soft bg-white p-6 shadow-xs lg:col-span-1">
                        <div className="mb-4">
                            <h2 className="font-display text-lg font-bold text-forest">
                                Recent Activity
                            </h2>
                            <p className="text-xs text-ink-muted">
                                Latest system records and updates
                            </p>
                        </div>
                        <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
                            {recentActivity.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-cream text-ink-muted">
                                        <Clock className="size-6 text-ink-muted/60" />
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-ink-muted">
                                        No recent activity yet.
                                    </p>
                                </div>
                            ) : (
                                recentActivity.map((item, index) => {
                                    const meta = getActivityMeta(item.type);
                                    const Icon = meta.icon;

                                    return (
                                        <div
                                            key={`${item.title}-${index}`}
                                            className="group flex items-start gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-line-soft hover:bg-cream/40"
                                        >
                                            <span
                                                className={cn(
                                                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg shadow-2xs',
                                                    meta.iconBg,
                                                )}
                                            >
                                                <Icon className="size-4" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={cn(
                                                            'size-2 shrink-0 rounded-full',
                                                            meta.dotColor,
                                                        )}
                                                    />
                                                    <span className="text-[11px] font-bold tracking-wider text-ink-muted uppercase">
                                                        {item.type}
                                                    </span>
                                                    <span className="text-xs text-ink-muted/50">
                                                        •
                                                    </span>
                                                    <span className="truncate text-xs text-ink-muted">
                                                        {formatTimeAgo(
                                                            item.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-forest transition-colors group-hover:text-maroon">
                                                    {item.title}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
    ],
};
