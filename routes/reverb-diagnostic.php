<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Process;

Route::get('/reverb-diagnostic', function () {
    $results = [];

    // 1. Check kung tumatakbo si Reverb
    $ps = Process::run('ps aux | grep reverb | grep -v grep');
    $results['reverb_process_running'] = !empty(trim($ps->output()));
    $results['reverb_process_output'] = trim($ps->output());

    // 2. Check kung nakabukas ang port 8080
    $netstat = Process::run('netstat -tulpn 2>/dev/null | grep 8080 || ss -tulpn 2>/dev/null | grep 8080');
    $results['port_8080_listening'] = !empty(trim($netstat->output()));
    $results['port_8080_output'] = trim($netstat->output());

    // 3. Check ang Environment Variables (Safe values lang)
    $results['env_vars'] = [
        'REVERB_HOST' => env('REVERB_HOST'),
        'REVERB_PORT' => env('REVERB_PORT'),
        'REVERB_SCHEME' => env('REVERB_SCHEME'),
        'REVERB_SERVER_HOST' => env('REVERB_SERVER_HOST'),
        'REVERB_SERVER_PORT' => env('REVERB_SERVER_PORT'),
        'APP_URL' => env('APP_URL'),
    ];

    // 4. Check Nginx error logs
    $nginxLog = '/var/log/nginx/error.log';
    if (file_exists($nginxLog)) {
        $results['nginx_last_errors'] = shell_exec('tail -n 10 ' . $nginxLog);
    } else {
        $results['nginx_last_errors'] = 'Nginx log file not found.';
    }

    // 5. Check Reverb logs mula sa supervisor
    $reverbLog = '/var/log/supervisor/laravel-reverb.log';
    if (file_exists($reverbLog)) {
        $results['reverb_last_logs'] = shell_exec('tail -n 20 ' . $reverbLog);
    } else {
        $results['reverb_last_logs'] = 'Reverb log file not found.';
    }

    return response()->json($results, 200, [], JSON_PRETTY_PRINT);
});