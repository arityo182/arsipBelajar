# ================================================================
# docker/backend/Dockerfile
# SIPLOK Backend: PHP 8.3-FPM + Nginx (Alpine Linux)
# ================================================================

FROM php:8.3-fpm-alpine

# Set working directory
WORKDIR /var/www/html

# Install runtime libraries
RUN apk update && apk add --no-cache \
    libpq \
    libzip \
    zip \
    unzip \
    curl \
    nginx \
    netcat-openbsd \
    git \
    bash

# Install temporary build dependencies, compile PHP extensions, then purge compiler toolchain
RUN apk add --no-cache --virtual .build-deps \
    postgresql-dev \
    libzip-dev \
    && docker-php-ext-install pdo_pgsql pgsql zip opcache bcmath \
    && apk del .build-deps

# Ambil binary Composer dari image official
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Salin composer.json untuk install dependensi
COPY composer.json /var/www/html/

# Salin konfigurasi Nginx
COPY docker/backend/nginx.conf /etc/nginx/http.d/default.conf

# Salin seluruh source code backend
COPY . /var/www/html

# Install Composer dependencies
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader || true

# Salin dan berikan izin eksekusi entrypoint
COPY docker/backend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Izin akses untuk direktori storage & bootstrap
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

# Port 80 untuk Nginx reverse proxy internal
EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
