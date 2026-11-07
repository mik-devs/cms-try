# Base image: PHP 8.5 CLI
FROM php:8.5-cli

# 1. Install fast PHP extensions using mlocati
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_mysql mbstring exif pcntl bcmath gd sockets

# 2. Install system dependencies (Nginx, Supervisor, Node.js v22)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    supervisor \
    nginx

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 3. Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Set working directory
WORKDIR /app

# ✅ 5. DOCKER LAYER CACHING: 
# Kopyahin lang muna natin yung dependency files para kung walang nagbago sa code, 
# hindi na uulitin ni Render i-download ang Composer at NPM packages.
COPY composer.json composer.lock ./
COPY package.json package-lock.json ./

# ✅ 6. I-INSTALL ANG DEPENDENCIES (WITH MEMORY FIX)
# --prefer-dist: Mas mabilis at mas magaan sa RAM kumpara sa source extraction
# --no-scripts: Pipigilan muna ang pag-run ng artisan habang wala pa yung buong code
# COMPOSER_MEMORY_LIMIT=-1: Tinatanggal ang memory limit ni Composer
RUN COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --prefer-dist --no-scripts --no-interaction --optimize-autoloader
RUN npm install --no-audit --no-fund

# 7. Kopyahin ang natitirang code
COPY . /app

# 8. Build ang frontend assets
RUN npm run build

# 9. I-run ang mga necessary scripts pagkatapos ma-copy ang buong codebase
RUN php artisan package:discover --ansi

# 10. Set directory permissions for Laravel
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# 11. Copy Nginx & Supervisor configurations
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 12. Copy Entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose Render default port
EXPOSE 10000

# Entrypoint updates Nginx with $PORT and passes control to Supervisor
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]