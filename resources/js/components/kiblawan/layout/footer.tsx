import { Link, usePage } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import type { TranslationKey } from '@/lib/translations';

interface FooterLink {
    label: string;
    href: string;
    translationKey?: TranslationKey;
}

const quickLinks: FooterLink[] = [
    { label: 'Home', translationKey: 'nav_home', href: '/' },
    {
        label: 'About Kiblawan',
        translationKey: 'nav_about',
        href: '/about',
    },
    { label: 'Government', translationKey: 'nav_gov', href: '/government' },
    { label: 'Services', translationKey: 'nav_services', href: '/services' },
    { label: 'Careers', href: '/careers' },
];

const transparencyLinks: FooterLink[] = [
    { label: 'Full Disclosure', href: '/transparency' },
    { label: 'Invitation to Bid', href: '/transparency/bids' },
    { label: 'Bids & Awards', href: '/transparency/bids' },
    { label: 'Annual Reports', href: '/transparency/reports' },
    { label: 'Full Disclosure Reports', href: '/transparency/reports' },
];

const bottomLinks: FooterLink[] = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Use', href: '/terms-of-use' },
    { label: 'Sitemap', href: '#' },
];

const widgetHeading =
    "relative mb-6 pb-2 font-sans text-[0.9rem] font-bold tracking-[1.5px] text-white uppercase after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-[30px] after:bg-gold after:content-['']";

const footerLink =
    'group inline-flex items-center text-[0.88rem] text-white/65 transition-all hover:translate-x-[5px] hover:text-gold';

interface ContactItem {
    icon: LucideIcon;
    label: string;
    value: string | null;
    href?: string;
}

export default function Footer() {
    const { siteSettings } = usePage().props;
    const { t } = useLanguage();
    const contacts: ContactItem[] = [
        {
            icon: MapPin,
            label: 'Address',
            value: siteSettings.address,
        },
        {
            icon: Phone,
            label: 'Phone',
            value: siteSettings.phone,
            href: siteSettings.phone
                ? `tel:${siteSettings.phone.replace(/[^\d+]/g, '')}`
                : undefined,
        },
        {
            icon: Mail,
            label: 'Email',
            value: siteSettings.email,
            href: siteSettings.email
                ? `mailto:${siteSettings.email}`
                : undefined,
        },
        {
            icon: Clock,
            label: 'Office Hours',
            value: siteSettings.office_hours,
        },
    ].filter((contact) => contact.value);

    return (
        <footer className="relative border-t-4 border-gold bg-(--color-dark-brown) text-white/75">
            <div className="py-20 pb-12">
                <div className="mx-auto max-w-[1320px] px-4">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr] lg:gap-12">
                        <div>
                            <img
                                src="/images/image.webp"
                                alt="Kiblawan Seal"
                                width={80}
                                height={80}
                                className="mb-5 size-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                                loading="lazy"
                                decoding="async"
                            />
                            <h3 className="mb-2 font-display text-[1.4rem] font-bold tracking-[0.5px] text-white">
                                {siteSettings.site_name ??
                                    'Municipality of Kiblawan'}
                            </h3>
                            <span className="mb-4 block text-[0.85rem] font-semibold tracking-[1px] text-gold-soft uppercase">
                                {t.footer_tagline}
                            </span>
                            <p className="max-w-[30ch] text-[0.9rem] leading-relaxed">
                                Official website of{' '}
                                {siteSettings.site_name ??
                                    'the Municipality of Kiblawan'}
                                .
                            </p>
                        </div>

                        <div>
                            <h4 className={widgetHeading}>
                                {t.footer_quicklinks}
                            </h4>
                            <ul className="m-0 list-none space-y-2.5 p-0">
                                {quickLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={footerLink}
                                        >
                                            <span className="mr-2 text-lg leading-none text-gold transition-transform group-hover:translate-x-[3px]">
                                                ›
                                            </span>
                                            {link.translationKey
                                                ? t[link.translationKey]
                                                : link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className={widgetHeading}>
                                {t.footer_transparency}
                            </h4>
                            <ul className="m-0 list-none space-y-2.5 p-0">
                                {transparencyLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className={footerLink}
                                        >
                                            <span className="mr-2 text-lg leading-none text-gold transition-transform group-hover:translate-x-[3px]">
                                                ›
                                            </span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className={widgetHeading}>
                                {t.footer_contact}
                            </h4>
                            <ul className="space-y-4">
                                {contacts.map((contact) => (
                                    <li
                                        key={contact.label}
                                        className="flex gap-4 text-[0.88rem] leading-relaxed"
                                    >
                                        <contact.icon className="mt-1 size-4 shrink-0 text-gold" />
                                        <div>
                                            <span className="mb-0.5 block text-[0.75rem] tracking-wide text-white/70 uppercase">
                                                {contact.label}
                                            </span>
                                            {contact.href ? (
                                                <a
                                                    href={contact.href}
                                                    className="text-white/85 hover:text-gold"
                                                >
                                                    {contact.value}
                                                </a>
                                            ) : (
                                                contact.value
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/5 bg-black/25 py-6 text-[0.8rem]">
                <div className="mx-auto flex max-w-[1320px] flex-col flex-wrap items-center justify-center gap-4 px-4 text-center md:flex-row md:justify-between md:text-left">
                    <p className="m-0 text-white/65">
                        © 2026{' '}
                        {siteSettings.site_name ?? 'Municipality of Kiblawan'}.
                        All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {bottomLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-white/65 transition-colors hover:text-gold"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
