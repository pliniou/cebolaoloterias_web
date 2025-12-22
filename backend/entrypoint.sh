#!/bin/bash
set -e

echo "Waiting for database..."
while ! python -c "import psycopg; psycopg.connect('${DATABASE_URL}')" 2>/dev/null; do
    sleep 1
done

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting server..."
exec "$@"
