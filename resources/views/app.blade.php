<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta
            data-inertia="description"
            name="description"
            content="Official Website of the Municipality of Kiblawan, Davao del Sur. Serbisyong Mabilis, Bayang Maasahan."
        >

        <meta property="og:type" content="website">
        <meta property="og:title" content="Municipality of Kiblawan">
        <meta
            property="og:description"
            content="Official Website of the Municipality of Kiblawan, Davao del Sur. Serbisyong Mabilis, Bayang Maasahan."
        >
        <meta property="og:image" content="{{ asset('images/kib.png') }}">
        <meta property="og:image:alt" content="Municipality of Kiblawan">
        <meta name="twitter:card" content="summary_large_image">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" type="image/png" href="/images/image.png">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- Runtime Reverb configuration injected from Laravel backend --}}
        <script>
            window.ReverbConfig = {
                key: "{{ env('REVERB_APP_KEY') ?: config('reverb.apps.apps.0.key') }}",
                host: "{{ env('REVERB_HOST') ?: config('reverb.apps.apps.0.options.host') }}",
                port: "{{ env('REVERB_PORT') ?: config('reverb.apps.apps.0.options.port', 443) }}",
                scheme: "{{ env('REVERB_SCHEME') ?: config('reverb.apps.apps.0.options.scheme', 'https') }}"
            };
        </script>

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>Municipality of Kiblawan</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
