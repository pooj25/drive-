#!/bin/sh
set -e

# Run migrations and seeds if database is empty
if [ ! -s database/database.sqlite ]; then
    touch database/database.sqlite
    php artisan migrate --force --seed
else
    php artisan migrate --force
fi

# Ensure storage permissions
chmod -R 777 storage bootstrap/cache database

# Execute CMD
exec "$@"
