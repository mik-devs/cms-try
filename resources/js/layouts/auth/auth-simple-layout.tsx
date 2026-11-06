import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh items-center justify-center p-6">
            
            {/* 1. Background Image gamit ang inline style para siguradong lumabas */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/kib.png')" }}
            ></div>
            
            <div className="absolute inset-0 z-0 bg-primary/60"></div>

            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
                
                <div className="mb-8 flex flex-col items-center text-center">
                    <Link href={home()} className="mb-2">
                        <img 
                            src="/images/image.png" 
                            alt="Kiblawan Seal" 
                            className="h-24 w-24 object-contain drop-shadow-md" 
                        />
                    </Link>
                    <h1 className="font-display text-3xl font-bold text-primary">
                        Admin Portal
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Municipality of Kiblawan
                    </p>
                </div>

                {/* Dynamic Title & Description */}
                {(title || description) && (
                    <div className="mb-6 text-center">
                        {title && <h2 className="text-xl font-semibold text-ink">{title}</h2>}
                        {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
                    </div>
                )}

                {/* Diri na mo sulod tong form na puti*/}
                {children}
            </div>
        </div>
    );
}