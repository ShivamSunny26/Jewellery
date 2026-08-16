# Deployment / DevOps Document
## Shree Om Jwellers — Jewellery Showcase Website

**Version:** 1.0
**Date:** August 15, 2026

---

## 1. Environments

| Environment | Purpose |
|---|---|
| Local (dev) | Developer's machine — FastAPI via Uvicorn reload + React dev server |
| Staging (optional) | Pre-production check before pushing catalogue/rate changes live |
| Production | Live site customers and admin use |

## 2. Recommended Hosting (small-business budget)

- **Backend (FastAPI):** A single small VPS (e.g., 1–2 vCPU / 2GB RAM tier) or a managed Python host — plenty for a catalogue-only site with no transactional load.
- **Database:** Managed PostgreSQL (small tier) or a PostgreSQL instance on the same VPS for lowest cost.
- **Frontend (React, x2 apps):** Built as static bundles, served via Nginx on the same VPS or a static host/CDN (e.g., a static-hosting service) for fast mobile delivery.
- **Media/3D assets:** Served via Nginx static path initially; can move to object storage + CDN later if catalogue/traffic grows (important for 3D model load speed on mobile).

## 3. Deployment Topology

```
Internet → HTTPS (Nginx reverse proxy)
             ├── / (customer React build, static)
             ├── /admin (admin React build, static)
             ├── /api/v1/* → Uvicorn/Gunicorn (FastAPI)
             └── /media/* → static file serving (photos, GLB models)
                     │
                     ▼
              PostgreSQL (ornaments, categories, rates, enquiries, admins)
```

## 4. Build & Release Process

1. Backend: `pip install -r requirements.txt`, run migrations (Alembic), start with Gunicorn + Uvicorn workers behind Nginx.
2. Frontend (customer + admin): `npm run build` for each React app → static assets copied to Nginx-served directories.
3. Environment variables (never committed to source control): DB connection string, JWT secret, cookie domain, allowed CORS origins, media storage path/keys.
4. Zero-downtime-ish releases: build new frontend assets, swap directory; restart backend workers one at a time if using multiple.

## 5. Backups

- **Database:** automated daily backup (pg_dump or managed-DB snapshot), retained for at least 30 days — protects ornament catalogue, rate history, and enquiries.
- **Media:** photos and 3D models backed up alongside/independently of DB (they're referenced by URL, not stored inside it).

## 6. Monitoring & Logging

- Basic uptime monitoring (ping `/health` endpoint) — alerts admin/developer if the site goes down.
- Application logs (FastAPI/Nginx access & error logs) retained for troubleshooting.
- Simple error tracking (e.g., logging exceptions to a file or lightweight service) — no heavy observability stack needed at this scale.

## 7. Domain & SSL

- Custom domain (e.g., `shreeomjwellers.com`), DNS pointed at the hosting VPS/CDN.
- Free TLS certificate via Let's Encrypt, auto-renewed via certbot cron/systemd timer.

## 8. Scaling Notes (future, not v1 requirement)

- If catalogue/traffic grows: move media to object storage + CDN (faster 3D model loads across India), and consider a managed DB tier bump.
- No horizontal scaling of a "cart/order" service is ever needed, since none exists.

## 9. Rollback Plan

- Keep the previous frontend build directory and previous backend release tagged in version control; on a bad release, redeploy the last known-good build/tag and, if needed, restore the most recent DB backup.
