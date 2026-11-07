import { Link, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

interface NavLink {
    label: string;
    href: string;
}

interface NavItem extends NavLink {
    translationKey?:
        | 'nav_home'
        | 'nav_about'
        | 'nav_gov'
        | 'nav_services'
        | 'nav_transparency'
        | 'nav_contact';
    children?: NavLink[];
}

const navItems: NavItem[] = [
    { label: 'Home', translationKey: 'nav_home', href: '/' },
    {
        label: 'About Kiblawan',
        translationKey: 'nav_about',
        href: '/about',
        children: [
            { label: 'History of Kiblawan', href: '/about/history' },
            { label: 'Demographic Profile', href: '/about/demographic' },
            { label: 'Socio-Economic Profile', href: '/about/socio-economic' },
            {
                label: 'Physical / Geographical Profile',
                href: '/about/geography',
            },
        ],
    },
    {
        label: 'Government',
        translationKey: 'nav_gov',
        href: '/government',
        children: [
            { label: 'Vision & Mission', href: '/government/vision-mission' },
            { label: 'Elected Officials', href: '/government/officials' },
            {
                label: 'Sangguniang Bayan',
                href: '/government/sangguniang-bayan',
            },
            {
                label: "Citizen's Charter",
                href: '/government/citizens-charter',
            },
            { label: 'Office Directories', href: '/government/directories' },
        ],
    },
    { label: 'Services', translationKey: 'nav_services', href: '/services' },
    {
        label: 'Transparency',
        translationKey: 'nav_transparency',
        href: '/transparency',
    },
    { label: 'Contact Us', translationKey: 'nav_contact', href: '/contact' },
];

const itemBase =
    'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[16px] text-base font-semibold text-primary transition-all border border-transparent';
const itemActive =
    'bg-primary text-white border-primary shadow-[0_4px_12px_rgba(122,41,38,0.25)]';
const itemIdle =
    'hover:bg-primary/10 hover:text-primary hover:border-primary/15';
const mobileBase =
    'block px-3 py-3 rounded-[16px] text-base font-semibold text-primary transition-all border border-transparent';
const mobileIdle = 'hover:bg-primary/10 hover:text-primary';
const mobileChild =
    'block px-3 py-2 rounded-[12px] text-base font-medium text-primary transition-all hover:bg-primary/5 hover:text-primary';

export default function Navbar({ isScrolled = false }: { isScrolled?: boolean }) {
    const { url, props } = usePage();
    const { t } = useLanguage();
    const siteSettings = props.siteSettings;
    const pathname = url.split('?')[0];
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const getLabel = (item: NavItem): string =>
        item.translationKey ? t[item.translationKey] : item.label;

    const isActive = (href: string): boolean =>
        href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(`${href}/`);

    const toggleExpanded = (href: string): void => {
        setExpanded((current) => {
            const next = new Set(current);

            if (next.has(href)) {
                next.delete(href);
            } else {
                next.add(href);
            }

            return next;
        });
    };

    useEffect(() => {
        if (!mobileOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                setMobileOpen(false);
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [mobileOpen]);

    useEffect(() => {
        if (!mobileOpen) {
            // Remove focus from any element inside the menu when it closes
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }
    }, [mobileOpen]);

    return (
        <>
            <header className={`fixed right-0 left-0 z-[90] border-b border-line bg-cream shadow-k-soft transition-all duration-300 ${isScrolled ? 'top-0' : 'top-[36px]'}`}>
                <div className="mx-auto flex min-h-[86px] max-w-[1320px] items-center justify-between px-4">
                    <Link href="/" className="group flex items-center gap-3.5">
                        <img
                            src="/images/image.webp"
                            alt="Municipality of Kiblawan Logo"
                            width={60}
                            height={60}
                            className="size-[60px] shrink-0 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                        />
                        <div className="leading-[1.1]">
                            <div className="font-display text-[1.15rem] font-bold text-primary">
                                {siteSettings.site_name ?? 'Kiblawan'}
                            </div>
                            <div className="text-[0.72rem] font-semibold tracking-[0.1em] text-ink-muted uppercase">
                                {siteSettings.tagline ??
                                    'Davao del Sur, Philippines'}
                            </div>
                        </div>
                    </Link>

                    <nav
                        aria-label="Primary"
                        className="hidden items-center gap-0.5 min-[1200px]:flex"
                    >
                        <ul className="flex items-center gap-0.5">
                            {navItems.map((item) => {
                                const active = isActive(item.href);

                                if (!item.children) {
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                aria-current={
                                                    active ? 'page' : undefined
                                                }
                                                className={cn(
                                                    itemBase,
                                                    active
                                                        ? itemActive
                                                        : itemIdle,
                                                )}
                                            >
                                                {getLabel(item)}
                                            </Link>
                                        </li>
                                    );
                                }

                                return (
                                    <li key={item.href}>
                                        <div className="group relative">
                                            <Link
                                                href={item.href}
                                                aria-current={
                                                    active ? 'page' : undefined
                                                }
                                                className={cn(
                                                    itemBase,
                                                    active
                                                        ? itemActive
                                                        : itemIdle,
                                                )}
                                            >
                                                {getLabel(item)}
                                                <span className="ml-0.5 inline-block size-2 -translate-y-0.5 rotate-45 border-r-2 border-b-2 border-current transition-transform duration-300 group-hover:-rotate-[135deg]" />
                                            </Link>

                                            <span
                                                aria-hidden="true"
                                                className="absolute top-full left-0 h-2 w-full"
                                            />

                                            <div className="absolute top-full left-0 z-30 mt-2 hidden min-w-[260px] animate-[k-dropdown-fade_0.28s_cubic-bezier(0.4,0,0.2,1)_both] flex-col gap-0.5 rounded-[20px] border border-line bg-white p-2 shadow-k-dropdown group-hover:flex">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className="block rounded-[12px] px-3.5 py-2.5 text-base font-medium text-primary transition-all hover:bg-primary/5 hover:text-primary"
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                        aria-expanded={mobileOpen}
                        aria-controls="kiblawan-mobile-nav"
                        className="flex flex-col gap-1.5 rounded-[16px] bg-primary p-2.5 min-[1200px]:hidden"
                    >
                        <span className="block h-0.5 w-[22px] rounded bg-white" />
                        <span className="block h-0.5 w-[22px] rounded bg-white" />
                        <span className="block h-0.5 w-[22px] rounded bg-white" />
                    </button>
                </div>
            </header>

            <div
                aria-hidden="true"
                onClick={() => setMobileOpen(false)}
                className={cn(
                    'fixed inset-0 z-[79] bg-black/40 transition-opacity duration-300',
                    mobileOpen
                        ? 'opacity-100'
                        : 'pointer-events-none opacity-0',
                )}
            />

            <aside
                id="kiblawan-mobile-nav"
                aria-label="Mobile navigation"
                aria-hidden={!mobileOpen}
                inert={!mobileOpen}
                className={cn(
                    'fixed top-[var(--nav-offset)] right-0 z-[80] k-scrollbar h-[calc(100vh-var(--nav-offset))] w-[min(88vw,380px)] overflow-y-auto bg-paper p-7 shadow-[-12px_0_40px_rgba(38,50,56,0.16)] transition-transform duration-[400ms]',
                    mobileOpen ? 'translate-x-0' : 'translate-x-full',
                )}
            >
                <div className="mb-6 flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-primary">
                        Menu
                    </span>
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                        className="grid size-10 place-items-center rounded-full bg-primary text-white transition-all hover:bg-primary-dark"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <ul className="flex flex-col gap-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        const isExpanded = expanded.has(item.href);

                        return (
                            <li key={item.href}>
                                {item.children ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleExpanded(item.href)
                                            }
                                            aria-expanded={isExpanded}
                                            className={cn(
                                                mobileBase,
                                                'flex w-full items-center justify-between text-left',
                                                active
                                                    ? itemActive
                                                    : mobileIdle,
                                            )}
                                        >
                                            {getLabel(item)}
                                            <span
                                                className={cn(
                                                    'inline-block size-2 -translate-y-0.5 rotate-45 border-r-2 border-b-2 border-current transition-transform duration-300',
                                                    isExpanded &&
                                                        'rotate-[135deg]',
                                                )}
                                            />
                                        </button>

                                        {isExpanded && (
                                            <ul className="mt-1 mb-2 flex flex-col gap-0.5 pl-4">
                                                <li>
                                                    <Link
                                                        href={item.href}
                                                        onClick={() =>
                                                            setMobileOpen(false)
                                                        }
                                                        className={cn(
                                                            mobileChild,
                                                            pathname ===
                                                                item.href &&
                                                                'bg-primary/5 text-primary',
                                                        )}
                                                    >
                                                        {getLabel(item)}{' '}
                                                        overview
                                                    </Link>
                                                </li>
                                                {item.children.map((child) => (
                                                    <li key={child.href}>
                                                        <Link
                                                            href={child.href}
                                                            onClick={() =>
                                                                setMobileOpen(
                                                                    false,
                                                                )
                                                            }
                                                            className={cn(
                                                                mobileChild,
                                                                isActive(
                                                                    child.href,
                                                                ) &&
                                                                    'bg-primary/5 text-primary',
                                                            )}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                        className={cn(
                                            mobileBase,
                                            active ? itemActive : mobileIdle,
                                        )}
                                    >
                                        {getLabel(item)}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </aside>
        </>
    );
}
