# Base image: PHP 8.5 CLI
FROM php:8.5-cli

# 1. Install system dependencies (TINANGGAL natin ang nodejs at npm dito)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    supervisor \
    nginx

# 2. Install modern Node.js (v22 LTS) via NodeSource
# Ito ang magbibigay sa'yo ng bagong Node at npm na compatible sa Vite
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# Clear apt cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (sockets is required for Laravel Reverb)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd sockets

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application files
COPY . /app

# Install PHP and Node dependencies, build front-end assets
RUN composer install --no-dev --optimize-autoloader

# 3. I-install at i-build (Tinanggal natin yung 'npm install -g npm@latest' kasi bago na siya)
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