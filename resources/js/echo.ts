import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'reverb'>;
        ReverbConfig?: {
            key?: string;
            host?: string;
            port?: string | number;
            scheme?: string;
        };
    }
}

if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

    const reverbConfig = window.ReverbConfig ?? {};
    const key = reverbConfig.key || import.meta.env.VITE_REVERB_APP_KEY;
    const host = reverbConfig.host || import.meta.env.VITE_REVERB_HOST || window.location.hostname;
    const port = Number(reverbConfig.port || import.meta.env.VITE_REVERB_PORT || 443);
    const scheme = reverbConfig.scheme || import.meta.env.VITE_REVERB_SCHEME || 'https';
    const isTls = scheme === 'https';

    if (key) {
        window.Echo = new Echo<'reverb'>({
            broadcaster: 'reverb',
            key,
            wsHost: host,
            wsPort: port,
            wssPort: port,
            forceTLS: isTls,
            enabledTransports: ['ws', 'wss'],
        });
    } else {
        console.warn('Reverb app key is missing. Echo real-time listener was not initialized.');
    }
}
