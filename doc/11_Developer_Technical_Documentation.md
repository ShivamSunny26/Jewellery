# Developer / Technical Documentation
## Shree Om Jwellers — Jewellery Showcase Website

**Version:** 1.0
**Date:** August 15, 2026

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, Uvicorn/Gunicorn |
| Database | PostgreSQL + SQLAlchemy/Alembic (migrations) |
| Auth | JWT in HTTP-only cookies (admin only) |
| Frontend (Customer + Admin) | React (mobile-first CSS, e.g., plain CSS/Tailwind) |
| 3D Viewer | `<model-viewer>` web component (Three.js under the hood) |
| Media assets | Local disk / S3-compatible object storage, served via Nginx or CDN |
| Reverse proxy | Nginx |
| TLS | Let's Encrypt |

## 2. Repository Structure (suggested)

```
shree-om-jwellers/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/            # SQLAlchemy models: Ornament, Category, Rate, Enquiry, Admin
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── public_ornaments.py
│   │   │   ├── public_rates.py
│   │   │   ├── public_enquiries.py
│   │   │   ├── admin_auth.py
│   │   │   ├── admin_ornaments.py
│   │   │   ├── admin_categories.py
│   │   │   ├── admin_rates.py
│   │   │   └── admin_enquiries.py
│   │   ├── core/               # config, security (JWT), db session
│   │   └── media/              # upload handling
│   ├── alembic/
│   └── requirements.txt
├── frontend-customer/          # React app (public site)
│   └── src/
│       ├── pages/ (Home, Category, OrnamentDetail, Enquiry, StoreInfo)
│       └── components/ (RateBubbles, ModelViewer3D, OrnamentCard, ...)
├── frontend-admin/             # React app (admin panel)
│   └── src/
│       ├── pages/ (Login, Dashboard, Ornaments, Categories, Rates, Enquiries)
│       └── components/
└── docs/                       # this document suite
```

## 3. Local Development Setup

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend - customer app
cd frontend-customer
npm install
npm run dev

# Frontend - admin app
cd frontend-admin
npm install
npm run dev
```

## 4. Key Implementation Notes

### 4.1 Rate Bubbles Component
- Mount once at the root layout (both apps' shared `App` shell isn't shared, but each customer page must include it — implement as a single root-level component so it's not re-mounted per route).
- Poll `GET /rates/current` on mount + every few minutes (`setInterval`), or re-fetch on route change if simpler.
- CSS: `position: fixed; bottom: env(safe-area-inset-bottom, 16px); right: 16px; z-index: 50;` stacked with `gap`.

### 4.2 3D Viewer Integration
```html
<model-viewer
  src="/media/models/necklace-12.glb"
  camera-controls
  auto-rotate
  auto-rotate-delay="3000"
  interaction-prompt="auto"
  style="width:100%;height:60vh;background:#1A1210;">
</model-viewer>
```
- Load the `model-viewer` script only on the ornament detail route (code-split / lazy import) to avoid bloating other pages.
- Always check `ornament.model_url` before rendering `<model-viewer>`; otherwise render the photo gallery component.

### 4.3 Admin Auth Flow (FastAPI)
- `/admin/login` verifies credentials, issues JWT (`HS256`, short-ish expiry), sets it as `Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict`.
- A FastAPI dependency (`get_current_admin`) reads the cookie, verifies the JWT, and is injected into every `/admin/*` route to enforce auth.

### 4.4 Rate Update Logic (backend pseudocode)
```python
def set_rate(metal: str, rate_value: float, admin_id: int, db: Session):
    db.query(Rate).filter(Rate.metal == metal, Rate.is_active == True)\
      .update({"is_active": False})
    new_rate = Rate(metal=metal, rate_value=rate_value, is_active=True,
                     set_by_admin_id=admin_id)
    db.add(new_rate)
    db.commit()
    return new_rate
```

### 4.5 Media Upload Validation
- Accept only `image/jpeg`, `image/png`, `image/webp` for photos; `model/gltf-binary` (`.glb`) for models.
- Cap file size (e.g., 5MB photos, 15MB models) and reject anything else with a `422`.
- Store with randomized filenames (`uuid4()`), never trust the client-provided filename.

## 5. Testing Strategy

- **Backend:** pytest for router/service logic (auth, rate switching logic, visibility filtering).
- **Frontend:** component tests for `RateBubbles` (renders correct values, handles missing data) and `ModelViewer3D` (fallback to gallery when `model_url` is null).
- **Manual QA checklist:** verify no cart/checkout UI exists anywhere; verify bubbles never block the 3D gesture area; verify mobile viewport (360–430px) on real devices or emulator.

## 6. Coding Conventions

- Backend: PEP8, type-hinted Pydantic schemas for all request/response bodies.
- Frontend: functional components + hooks; shared design tokens (colors/typography) in a single theme file consumed by both customer and admin apps for visual consistency.

## 7. Environment Variables (backend `.env`)

```
DATABASE_URL=postgresql://user:pass@host:5432/shreeomjwellers
JWT_SECRET=<random-64-char-secret>
JWT_EXPIRE_MINUTES=720
COOKIE_DOMAIN=shreeomjwellers.com
CORS_ORIGINS=https://shreeomjwellers.com,https://admin.shreeomjwellers.com
MEDIA_STORAGE_PATH=/var/www/shreeomjwellers/media
```

## 8. Explicitly-Not-Implemented (do not add without a new requirements pass)

- Cart / checkout / order models or routes.
- Payment gateway integration.
- Delivery/shipping tracking.
- Automated market-rate fetching for gold/silver.
- Desktop-specific responsive breakpoints.
