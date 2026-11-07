# Base image: PHP 8.5 CLI
FROM php:8.5-cli

# ✅ 1. I-INSTALL ANG MABILIS NA PHP EXTENSION INSTALLER
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_mysql mbstring exif pcntl bcmath gd sockets

# 2. Install system dependencies (Nginx, Supervisor, etc.)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    supervisor \
    nginx

# 3. Install modern Node.js (v22 LTS) via NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# Clear apt cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application files
COPY . /app

# Install PHP and Node dependencies, build front-end assets
RUN composer install --no-dev --optimize-autoloader

# I-install at i-build ang frontend
RUN npm install && npm run build

# Set directory permissions for Laravel
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy Entrypoint script to dynamically inject Render's PORT into Nginx
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose Render default port
EXPOSE 10000

# Entrypoint updates Nginx with $PORT and passes control to Supervisor
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]