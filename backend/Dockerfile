FROM php:8.2-cli-alpine

# Install system dependencies & PHP extensions for Intervention Image & SQLite
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libwebp-dev \
    zlib-dev \
    sqlite-dev \
    oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_sqlite mbstring bcmath

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy backend application
COPY . .

# Install production PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Prepare storage & sqlite database with full write permissions
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/app/public/gallery/thumbnails database \
    && touch database/database.sqlite \
    && chmod -R 777 storage bootstrap/cache database

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "php artisan migrate --force --seed && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
