import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { PageBanner } from '@/components/kiblawan/admin/page-banner';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

export default function SettingsLayout({ children }: PropsWithChildren) {
    // GINAMIT ANG usePage IMBES NA useLocation
    const { url } = usePage(); 
    
    // PINALITAN ANG location.href NG url
    const isProfilePage = url.startsWith('/settings/profile');
    const isSecurityPage = url.startsWith('/settings/security');

    return (
        <div>
            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <PageBanner
                    title="Account Settings"
                    subtitle="Manage your personal profile, security, and preferences."
                />

                <div className="border-b pb-4">
                    <div className="flex gap-2">
                        <Link
                            href={edit().url} // Ginamit ang Wayfinder route
                            className={cn(
                                'inline-flex items-center rounded-t-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors',
                                isProfilePage ? 'bg-primary text-white' : ''
                            )}
                        >
                            Profile
                        </Link>
                        <Link
                            href={editSecurity().url} // Ginamit ang Wayfinder route
                            className={cn(
                                'inline-flex items-center rounded-t-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors',
                                isSecurityPage ? 'bg-primary text-white' : ''
                            )}
                        >
                            Security
                        </Link>
                    </div>
                </div>

                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}