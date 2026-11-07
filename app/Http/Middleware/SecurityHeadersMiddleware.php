<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        $scriptSrc = "'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://embed.windy.com";
        $styleSrc = "'self' 'unsafe-inline' https://fonts.googleapis.com";
        $fontSrc = "'self' https://fonts.gstatic.com";
        
        $appUrl = config('app.url'); 
        $wsUrl = str_replace(['http://', 'https://'], ['ws://', 'wss://'], $appUrl);
        
        $connectSrc = "'self' ws://localhost:8080 wss://kiblawan.test:8080 wss://localhost:8080 {$appUrl} {$wsUrl}";

        if (app()->isLocal()) {
            $viteUrls = 'https://kiblawan.test:5173 https://vite.kiblawan.test:5173 wss://kiblawan.test:5173 wss://vite.kiblawan.test:5173';

            $scriptSrc .= " {$viteUrls}";
            $styleSrc .= " {$viteUrls}";
            $fontSrc .= " {$viteUrls}";
            $connectSrc .= " {$viteUrls}";
        }

        $csp = implode('; ', [
            "default-src 'self'",
            "script-src {$scriptSrc}",
            "style-src {$styleSrc}",
            "font-src {$fontSrc}",
            "img-src 'self' data: https: blob:",
            "connect-src {$connectSrc}",
            "frame-src 'self' https://www.google.com https://maps.google.com https://embed.windy.com",
        ]);

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}