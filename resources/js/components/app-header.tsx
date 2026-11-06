import { usePage, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react'; 
import { Bell, ChevronDown, LogOut, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useInitials } from '@/hooks/use-initials';

type NotificationItem = {
    id: string;
    sender_name: string;
    message_preview: string;
    url: string;
    created_at: string;
};

type Props = {
    breadcrumbs?: { title: string; href: string }[];
    leading?: ReactNode;
};

export function AppHeader({ breadcrumbs = [], leading }: Props) {
    const { auth, notifications: initialNotifications } = usePage().props as any;
    const user = auth?.user ?? null;
    const role = user?.roles?.[0]?.replaceAll('_', ' ') ?? 'Administrator';
    const getInitials = useInitials();

    const [unreadCount, setUnreadCount] = useState<number>(initialNotifications?.unreadCount ?? 0);
    const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications?.list ?? []);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && user?.id && (window as any).Echo) {
            const echo = (window as any).Echo.private(`App.Models.User.${user.id}`);

            echo.notification((notification: any) => {
                setNotifications((prev) => {
                    const exists = prev.some((n) => n.id === notification.id);
                    if (!exists) return [notification, ...prev].slice(0, 5);
                    return prev;
                });
                setUnreadCount((prev) => prev + 1);
            });

            return () => {
                try {
                    echo.stop();
                } catch (e) {
                    // Ignore errors on cleanup
                }
            };
        }
    }, [user?.id]);

    const markAsRead = (notificationId: string) => {
        router.post(`/admin/notifications/${notificationId}/read`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
        
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setUnreadCount((prev) => Math.max(prev - 1, 0));
    };

    const markAllAsRead = () => {
        router.post('/admin/notifications/read-all', {}, {
            preserveScroll: true,
            preserveState: true,
        });

        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-white px-4 md:px-6">
            {leading}

            <div className="flex min-w-0 items-center gap-2 text-sm text-ink-muted">
                {breadcrumbs.length > 0 ? (
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                ) : (
                    <span className="font-medium">Admin Console</span>
                )}
            </div>

            {/* INILAGAY SA LOOB ANG PROFILE DROPDOWN */}
            <div className="ml-auto flex items-center gap-2">
                {/* NOTIFICATION BELL DROPDOWN */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Notifications"
                            className="relative size-9 cursor-pointer rounded-full text-ink-muted hover:bg-(--color-bg-light) hover:text-primary"
                        >
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="end">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                                <Button onClick={markAllAsRead} variant="ghost" className="h-auto cursor-pointer p-0 text-xs text-primary hover:bg-transparent hover:text-primary/80">
                                    Mark all as read
                                </Button>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {notifications.length > 0 ? (
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <DropdownMenuItem key={notification.id} className="flex cursor-pointer items-start gap-3 p-3" onClick={() => markAsRead(notification.id)}>
                                        <div className="flex-shrink-0">
                                            <Avatar className="size-8 rounded-full border border-line">
                                                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                                    {notification.sender_name?.charAt(0) || 'S'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="min-w-0 flex-1 whitespace-normal">
                                            <p className="text-sm font-semibold text-ink truncate">{notification.sender_name}</p>
                                            <p className="text-xs text-ink-muted line-clamp-2">
                                                {notification.message_preview}
                                            </p>
                                            <p className="mt-1 text-[10px] text-ink-muted/70">
                                                {notification.created_at}
                                            </p>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        ) : (
                            <p className="py-8 text-center text-sm text-ink-muted">
                                No new notifications
                            </p>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* PROFILE DROPDOWN */}
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 cursor-pointer gap-2 rounded-full px-2 hover:bg-(--color-bg-light)">
                                <Avatar className="size-8 border border-line">
                                    <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                                    <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden text-left md:grid">
                                    <span className="text-sm font-semibold leading-tight text-primary">{user.name}</span>
                                    <span className="text-[11px] capitalize leading-tight text-ink-muted">{role}</span>
                                </span>
                                <ChevronDown className="hidden size-4 text-ink-muted md:block" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted/50">
                                <Link href="/settings/profile" className="flex w-full cursor-pointer flex-row items-center gap-2">
                                    <Settings className="h-4 w-4 shrink-0" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <AlertDialog
                                trigger={
                                    <DropdownMenuItem
                                        className="flex cursor-pointer items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <LogOut className="h-4 w-4 shrink-0" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                }
                                title="Are you sure you want to log out?"
                                description="You will be signed out of your account. You can always log back in later."
                                onConfirm={() => router.post('/logout')}
                                onCancel={() => {}}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header> 
    );
}