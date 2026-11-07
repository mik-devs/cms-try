#!/bin/sh
set -e

# Render provides the public port via $PORT (Render standard is 10000).
# If PORT is not set, fallback to 10000 to prevent conflicting with 
# php artisan serve on 127.0.0.1:8000.
export PORT="${PORT:-10000}"

echo "Configuring Nginx to listen on port: ${PORT}"

# Replace the __PORT__ placeholder in nginx.conf
sed -i "s/__PORT__/${PORT}/g" /etc/nginx/nginx.conf

# Verify Nginx configuration syntax before passing to Supervisor
nginx -t

echo "Nginx configuration verified successfully. Launching Supervisor..."

# Execute CMD passed to the container (Supervisord)
exec "$@"
