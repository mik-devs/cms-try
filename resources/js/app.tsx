import '../css/app.css';
import './echo';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, Root } from 'react-dom/client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import GlobalLoader from '@/components/global-loader';
import { useState, useEffect, ReactNode } from 'react';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = 'Municipality of Kiblawan';

function AppWrapper({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        let maxTimeout: ReturnType<typeof setTimeout>;

        const startListener = (event: any) => {

            if (event.detail?.visit?.prefetch) {
                return;
            }

            timeout = setTimeout(() => {
                setIsLoading(true);

                maxTimeout = setTimeout(() => {
                    setIsLoading(false);
                }, 4000);
            }, 200);
        };

        const finishListener = () => {
            clearTimeout(timeout);
            clearTimeout(maxTimeout);
            setIsLoading(false);

            // MANUAL TITLE UPDATE USING URL PATH
            const path = window.location.pathname;
            let pageTitle = '';

            if (path.includes('/about/history')) pageTitle = 'History';
            else if (path.includes('/about/demographic')) pageTitle = 'Demographic Profile';
            else if (path.includes('/about/socio-economic')) pageTitle = 'Socio-Economic Profile';
            else if (path.includes('/about/geography')) pageTitle = 'Geographical Profile';
            else if (path.includes('/government/officials')) pageTitle = 'Elected Officials';
            else if (path.includes('/government/sangguniang-bayan')) pageTitle = 'Sangguniang Bayan';
            else if (path.includes('/government/citizens-charter')) pageTitle = "Citizen's Charter";
            else if (path.includes('/government/directories')) pageTitle = 'Office Directories';
            else if (path.includes('/about')) pageTitle = 'About Kiblawan';
            else if (path.includes('/government')) pageTitle = 'Government';
            else if (path.includes('/services')) pageTitle = 'Services';
            else if (path.includes('/transparency')) pageTitle = 'Transparency';
            else if (path.includes('/contact')) pageTitle = 'Contact Us';
            else if (path.includes('/news')) pageTitle = 'News & Announcements';
            else if (path.includes('/tourism')) pageTitle = 'Tourism';
            else if (path.includes('/achievements')) pageTitle = 'Achievements';
            else if (path.includes('/mayors-corner')) pageTitle = "Mayor's Corner";
            else if (path.includes('/admin/settings')) pageTitle = 'Site Settings';

            if (pageTitle) {
                document.title = `Municipality of Kiblawan | ${pageTitle}`;
            } else {
                document.title = 'Municipality of Kiblawan';
            }
        };

        router.on('start', startListener);
        router.on('finish', finishListener);
        router.on('error', finishListener);

        return () => {
            clearTimeout(timeout);
            clearTimeout(maxTimeout);
        };
    }, []);

    return (
        <TooltipProvider delayDuration={0}>
            <GlobalLoader show={isLoading} />
            {children}
            <Toaster 
                position="top-center"
                offset={80}
                richColors
                closeButton
                duration={3500}
                toastOptions={{
                    style: { 
                        padding: '16px', 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
                    },
                }}
            />
        </TooltipProvider>
    );
}

createInertiaApp({
    resolve: ((name: string) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        )) as any,
    layout: (name) => {
        switch (true) {
            case name.startsWith('public/'):
                return null;
            case name === 'welcome':
                return null;
            case name === 'auth/login':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    setup({ el, App, props }) {

        if (typeof window !== 'undefined') {
            const win = window as any;
            
            if (!win.__inertia_root) {
                win.__inertia_root = createRoot(el);
            }
            
            win.__inertia_root.render(
                <AppWrapper>
                    <App {...props} />
                </AppWrapper>,
            );
        }
    },
    progress: false,
});

initializeTheme();

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        if (typeof window !== 'undefined') {
            const win = window as any;
            if (win.__inertia_root) {
                win.__inertia_root.unmount();
                win.__inertia_root = null;
            }
        }
    });
}