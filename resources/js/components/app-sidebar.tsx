import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Award,
    BarChart3,
    BookOpen,
    BriefcaseBusiness,
    Building2,
    FileText,
    Gavel,
    Image,
    KeyRound,
    Landmark,
    LayoutGrid,
    LogOut,
    MapPin,
    MapPinned,
    MessageSquare,
    Mic,
    Newspaper,
    ScrollText,
    Settings,
    ShieldCheck,
    Siren,
    Users,
    Video,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { logout } from '@/routes';
import type { NavItem } from '@/types';

type AdminNavItem = NavItem & {
    permission?: string;
    role?: string;
};

type AdminNavGroup = {
    label: string;
    items: AdminNavItem[];
};

const navGroups: AdminNavGroup[] = [
    {
        label: 'Content',
        items: [
            { title: 'News', href: '/admin/news', icon: Newspaper, permission: 'manage news' },
            { title: 'Achievements', href: '/admin/achievements', icon: Award, permission: 'manage achievements' },
            { title: 'Tourism', href: '/admin/tourism', icon: MapPinned, permission: 'manage tourism' },
            { title: 'Jobs', href: '/admin/jobs', icon: BriefcaseBusiness, permission: 'manage jobs' },
        ],
    },
    {
        label: 'LGU Info',
        items: [
            { title: 'Officials', href: '/admin/officials', icon: Users, permission: 'manage officials' },
            { title: 'Barangays', href: '/admin/barangays', icon: MapPin, permission: 'manage settings' },
            { title: 'About Pages', href: '/admin/pages', icon: BookOpen, permission: 'manage settings' },
            { title: 'Services', href: '/admin/services', icon: Landmark, permission: 'manage services' },
            { title: "Mayor's Messages", href: '/admin/mayor-messages', icon: Mic, permission: 'manage officials' },
            { title: "Citizen's Charter", href: '/admin/citizen-charters', icon: ScrollText, permission: 'manage settings' },
            { title: 'Office Directories', href: '/admin/offices', icon: Building2, permission: 'manage settings' },
        ],
    },
    {
        label: 'Transparency',
        items: [
            { title: 'Bids', href: '/admin/bids', icon: Gavel, permission: 'manage transparency' },
            { title: 'Reports', href: '/admin/annual-reports', icon: FileText, permission: 'manage transparency' },
        ],
    },
    {
        label: 'Communication',
        items: [
            { title: 'Internal Chat', href: '/admin/chat', icon: MessageSquare, permission: 'access internal chat' },
        ],
    },
    {
        label: 'System',
        items: [
            { title: 'Staff Users', href: '/admin/users', icon: ShieldCheck, role: 'super_admin' },
            { title: 'Roles & Permissions', href: '/admin/roles', icon: KeyRound, role: 'super_admin' },
            { title: 'Site Settings', href: '/admin/settings', icon: Settings, permission: 'manage settings' },
            { title: 'Hero Slides', href: '/admin/hero-slides', icon: Image, permission: 'manage hero' },
            { title: 'Official Videos', href: '/admin/videos', icon: Video, permission: 'manage settings' },
            { title: 'Stats', href: '/admin/stats', icon: BarChart3, permission: 'manage stats' },
            { title: 'Emergency', href: '/admin/emergency-contacts', icon: Siren, permission: 'manage emergency' },
        ],
    },
];

const navItemClassName =
    'h-9 gap-2 rounded-lg px-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-(--color-bg-light) hover:text-primary data-[active=true]:bg-primary data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-sm data-[active=true]:hover:bg-primary data-[active=true]:hover:text-white';

export function AppSidebar() {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions ?? [];
    const user = auth?.user ?? null;
    const role = user?.roles?.[0]?.replaceAll('_', ' ') ?? 'Administrator';
    const getInitials = useInitials();
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    // NOTE: `showLogoutDialog` state removed — AlertDialog manages its own open/close via `trigger`.

    return (
        <Sidebar collapsible="icon" className="border-r border-line">
            <SidebarHeader className="border-b border-line p-3">
                <SidebarMenu>
                    <SidebarMenuButton
                        size="lg"
                        asChild
                        className="h-auto justify-start gap-3 p-1 hover:bg-(--color-bg-light)"
                    >
                        <Link href="/admin" prefetch>
                            {/* Logo span — closes BEFORE text span (siblings, not nested) */}
                            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream ring-1 ring-line-soft group-data-[collapsible=icon]:size-7">
                                <img
                                    src="/images/image.webp"
                                    alt="Kiblawan logo"
                                    width={40}
                                    height={40}
                                    className="size-full object-contain p-0.5"
                                />
                            </span>
                            <span className="grid min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-display text-base leading-tight font-bold text-primary">
                                    Kiblawan
                                </span>
                                <span className="text-[10px] font-semibold tracking-[0.2em] text-ink-muted uppercase">
                                    Admin
                                </span>
                            </span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="[scrollbar-width:none] gap-0 overflow-y-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <SidebarGroup className="px-1 pt-1 pb-0">
                    <SidebarMenu className="gap-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl('/admin')}
                                tooltip={{ children: 'Dashboard' }}
                                className={navItemClassName}
                            >
                                <Link href="/admin" prefetch>
                                    <LayoutGrid className="h-4 w-4 shrink-0" />
                                    <span className="truncate">Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {navGroups.map((group) => {
                    const roles = auth?.user?.roles ?? [];
                    const items = group.items.filter(
                        ({ permission, role: requiredRole }) =>
                            (!permission || permissions.includes(permission)) &&
                            (!requiredRole || roles.includes(requiredRole)),
                    );

                    if (items.length === 0) {
                        return null;
                    }

                    return (
                        <SidebarGroup key={group.label} className="px-1 py-2">
                            <SidebarGroupLabel className="h-7 px-2 text-[10px] font-semibold tracking-[0.18em] text-ink-muted/80 uppercase">
                                {group.label}
                            </SidebarGroupLabel>
                            <SidebarMenu className="gap-1">
                                {items.map((item) => {
                                    const isActive = isCurrentOrParentUrl(item.href);
                                    const Icon = item.icon;

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={{ children: item.title }}
                                                className={navItemClassName}
                                            >
                                                <Link href={item.href} prefetch>
                                                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                                                    <span className="truncate">
                                                        {item.title}
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroup>
                    );
                })}
            </SidebarContent>

            <SidebarFooter className="border-t border-line p-3">
                {user && (
                    <div className="rounded-xl border border-line bg-(--color-bg-light) p-3 group-data-[collapsible=icon]:hidden">
                        <div className="flex items-center gap-2.5">
                            <Avatar className="size-9 border border-white shadow-sm">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-primary">
                                    {user.name}
                                </p>
                                <p className="truncate text-[11px] text-ink-muted capitalize">
                                    {role}
                                </p>
                            </div>
                        </div>

                        <AlertDialog
                            trigger={
                                <button
                                    type="button"
                                    className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-primary transition-colors hover:border-primary/20 hover:bg-primary/5"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log Out
                                </button>
                            }
                            title="Are you sure you want to log out?"
                            description="You will be signed out of your account. You can always log back in later."
                            onConfirm={() => router.post(logout().url)}
                            onCancel={() => {}}
                        />
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}