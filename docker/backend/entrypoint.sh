#!/usr/bin/env sh
set -e

echo "=== Memulai Backend Container SIPLOK ==="

# Menunggu koneksi PostgreSQL siap
echo "Menunggu PostgreSQL ($DB_HOST:$DB_PORT) siap..."
until nc -z -v -w3 "$DB_HOST" "$DB_PORT" 2>/dev/null; do
    echo "PostgreSQL belum merespons, mencoba lagi dalam 2 detik..."
    sleep 2
done
echo "PostgreSQL berhasil tersambung!"

# Cek dependensi Composer
if [ ! -f /var/www/html/vendor/autoload.php ]; then
    echo "vendor/autoload.php belum ditemukan, menjalankan composer install..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Direktori permission untuk storage & bootstrap cache
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Generate key jika kosong
if [ -z "$APP_KEY" ]; then
    echo "Menjalankan php artisan key:generate..."
    php artisan key:generate --force || true
fi

# Migrasi otomatis pada semua environment
echo "Menjalankan migrasi database..."
php artisan migrate --force || true

# Seeding otomatis jika APP_ENV=local atau SEED_ON_STARTUP=true
if [ "$APP_ENV" = "local" ] || [ "$SEED_ON_STARTUP" = "true" ]; then
    echo "Menjalankan seeding database..."
    php artisan db:seed --force || true
fi

echo "Menjalankan PHP-FPM daemon..."
php-fpm -D

echo "Menjalankan Nginx di port 80..."
exec nginx -g "daemon off;"
