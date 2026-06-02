# Margexa — Production Deployment Guide

## Prerequisites

| Requirement | Version |
|---|---|
| PHP | 8.2+ |
| Laravel | 11.x |
| Node.js | 18+ |
| MySQL / MariaDB | 8.0+ |
| Redis | 7.0+ |
| Composer | 2.x |

---

## Step 1 — Environment

```bash
cp .env.production.example .env
# Fill every variable in .env (DB, Redis, Stripe, mail, APP_KEY)
php artisan key:generate
```

Critical values to set before anything else:
- `APP_URL` — your public domain (e.g. `https://app.margexa.io`)
- `DB_*` — production database credentials
- `REDIS_*` — Redis connection (required for cache, session, queue, and circuit breaker)
- `STRIPE_SECRET` + `STRIPE_WEBHOOK_SECRET` — Margexa's own billing
- `MAIL_*` — invitation emails and alerts

---

## Step 2 — Dependencies & Build

```bash
# PHP dependencies (no dev)
composer install --no-dev --optimize-autoloader

# Node dependencies + production build
npm ci
npm run build

# Copy Margexa JSX bundle to public/
node scripts/copy-margexa.js
```

---

## Step 3 — Database

```bash
# Run all migrations (never modify existing migration files)
php artisan migrate --force

# Optional: seed reference data (plans, demo org)
# php artisan db:seed --class=ProductionSeeder --force
```

> **Rule:** Never edit a migration that has already run in production.
> Always create a new migration for schema changes.

---

## Step 4 — Application Cache

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## Step 5 — Queue Worker & Scheduler

The queue handles:
- Invitation emails (`InvitationMail`)
- Benchmark aggregation (`AggregateBenchmarksJob` — weekly, Sunday 02:00 UTC)

**Supervisor config** (`/etc/supervisor/conf.d/margexa-worker.conf`):
```ini
[program:margexa-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/margexa/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/supervisor/margexa-worker.log
stopwaitsecs=3600
```

**Laravel Scheduler** (crontab entry for `www-data`):
```cron
* * * * * cd /var/www/margexa && php artisan schedule:run >> /dev/null 2>&1
```

---

## Step 6 — Web Server (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name app.margexa.io;

    root /var/www/margexa/public;
    index index.php;

    # SSE: disable buffering for /v1/chat/completions streaming
    location ~* ^/v1/ {
        proxy_buffering off;
        proxy_cache off;
        add_header X-Accel-Buffering no;
        try_files $uri $uri/ /index.php?$query_string;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_read_timeout 300;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    }

    ssl_certificate     /etc/letsencrypt/live/app.margexa.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.margexa.io/privkey.pem;
}
```

> **SSE note:** The `X-Accel-Buffering no` header is also set per-response in
> `LLMProxyController::streamChatCompletions()`. Both the nginx config and the
> response header are needed for reliable streaming behind a reverse proxy.

---

## Post-Deploy Checklist

- [ ] `APP_DEBUG=false` in `.env`
- [ ] `APP_ENV=production` in `.env`
- [ ] Redis reachable (`php artisan tinker` → `Cache::put('test', 1, 5)`)
- [ ] Queue worker running (`supervisorctl status margexa-worker`)
- [ ] Scheduler active (`php artisan schedule:list`)
- [ ] Stripe webhook registered at `https://app.margexa.io/stripe/webhook`
- [ ] Invitation email sending (`php artisan tinker` → send a test invite)
- [ ] Circuit breaker Redis keys visible after a test proxy call
- [ ] `/api/benchmarks` returns `has_benchmark_data: false` (data arrives Sunday)
- [ ] `/v1/chat/completions` with `stream: true` delivers chunks in real time

---

## Rollback

```bash
# Revert last migration (only if absolutely necessary)
php artisan migrate:rollback --step=1

# Clear caches after any code change
php artisan optimize:clear
```
