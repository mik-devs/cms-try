#!/bin/sh
set -e

# Render provides the public port via the $PORT environment variable (default: 10000 on Render).
# If PORT is not set (e.g. running locally), fallback to 10000 to avoid conflicting with
# php artisan serve which runs internally on 127.0.0.1:8000.
export PORT="${PORT:-10000}"

echo "Configuring Nginx to listen on port: ${PORT}"

# Replace the __PORT__ placeholder in nginx.conf
sed -i "s/__PORT__/${PORT}/g" /etc/nginx/nginx.conf

# Execute CMD passed to the container (Supervisord)
exec "$@"
