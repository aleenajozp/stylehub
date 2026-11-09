#!/bin/sh
set -e

echo "Waiting for database connection at ${DB_HOST:-127.0.0.1}:${DB_PORT:-3306}..."
max_retries=30
counter=0
until python -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect(('${DB_HOST:-127.0.0.1}', int('${DB_PORT:-3306}')))
    s.close()
    exit(0)
except Exception:
    exit(1)
" 2>/dev/null; do
    counter=$((counter + 1))
    if [ "$counter" -gt "$max_retries" ]; then
        echo "Database connection timed out, proceeding anyway..."
        break
    fi
    echo "Database unavailable, waiting 2s... ($counter/$max_retries)"
    sleep 2
done

echo "Running database migrations..."
python manage.py makemigrations accounts products cart orders --noinput || true
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

if [ -n "$STYLEHUB_ADMIN_PASSWORD" ]; then
    echo "Checking initial admin user..."
    python manage.py create_initial_admin || true
fi

echo "Starting Gunicorn on port 8000..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers ${GUNICORN_WORKERS:-2} \
    --threads ${GUNICORN_THREADS:-4} \
    --timeout 120
