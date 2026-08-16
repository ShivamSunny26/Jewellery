# System Architecture Document (SAD)
## Shree Om Jwellers — Jewellery Showcase Website

**Version:** 1.0
**Date:** August 15, 2026

---

## 1. Architecture Goals

- Simple, single-developer-maintainable stack.
- Clear separation between public Customer App and private Admin App, sharing one backend.
- Fast, lightweight delivery of 3D assets to mobile devices.
- No transactional subsystems (no cart/order/payment services) — smaller attack surface and simpler ops.

## 2. High-Level Architecture

```
                       ┌───────────────────────────┐
                       │        Clients            │
                       │  Customer PWA (mobile)     │
                       │  Admin PWA (mobile)        │
                       └────────────┬───────────────┘
                                    │ HTTPS / JSON
                       ┌────────────▼───────────────┐
                       │   FastAPI Backend (REST)    │
                       │  - Auth (Admin JWT)          │
                       │  - Ornaments/Categories API   │
                       │  - Rates API                  │
                       │  - Enquiries API               │
                       └───────┬──────────┬────────────┘
                               │          │
                 ┌─────────────▼──┐   ┌───▼─────────────────┐
                 │  Database        │   │  Media/Asset Store   │
                 │  (PostgreSQL/    │   │  (photos + 3D GLB    │
                 │   MongoDB)       │   │   models), served via │
                 └──────────────────┘   │   CDN/static hosting   │
                                         └─────────────────────────┘
```

## 3. Frontend Architecture

### 3.1 Customer App (React, mobile-first)
- **Home** → Categories + Featured ornaments.
- **Category Listing** → grid of ornament cards.
- **Ornament Detail** → 3D Viewer component + photo gallery + info + Enquire CTA.
- **Rate Bubbles** → global, persistent component mounted at app root (fixed `position: fixed; bottom; right;`), polling the Rates API on an interval (e.g., every few minutes) or on page load.
- **Enquiry Modal/Page** → simple form, posts to Enquiries API.
- **Store Info** → static page (address, map embed, hours).

### 3.2 Admin App (React, mobile-first, separate route/subdomain e.g. `/admin`)
- **Login**
- **Dashboard** — quick links: Update Rates, Add Ornament, View Enquiries.
- **Ornament Manager** — list, create/edit form (with photo + 3D model upload), visibility toggle.
- **Category Manager**
- **Rate Manager** — single-screen form: Gold rate, Silver rate, Save (shows last-updated + history).
- **Enquiries** — list with read/unread state.

### 3.3 3D Viewing Technology
- Use `<model-viewer>` (Google's web component, built on Three.js) for the ornament 3D view — it is purpose-built for lightweight, mobile-friendly, AR-capable product 3D viewing with pinch/rotate gestures out of the box.
- Models stored/served as compressed **GLB** (binary glTF), optionally Draco-compressed for smaller file size.
- 3D viewer loads **only on the specific ornament's detail page**, lazily, so category/listing pages stay light.
- Fallback: if an ornament has no `model_url`, render the existing photo gallery instead — no broken states.

## 4. Backend Architecture

- **Framework:** FastAPI (Python), consistent with existing developer expertise.
- **Structure:** modular routers — `auth`, `ornaments`, `categories`, `rates`, `enquiries`, `media`.
- **Auth:** Admin-only JWT issued on login, stored in HTTP-only cookie; customer routes are unauthenticated.
- **Media handling:** Upload endpoint (admin-only) accepts images/GLB, stores to disk or object storage (e.g., S3-compatible), returns public URL saved on the ornament record.
- **Rates:** simple table with `active` current rate + history rows for audit; `GET /rates/current` is a hot, cache-friendly public endpoint used by the bubbles.

## 5. Data Flow — Key Scenarios

### 5.1 Customer views an ornament in 3D
1. Customer taps an ornament card → navigates to `/ornament/{id}`.
2. Frontend calls `GET /ornaments/{id}` → receives ornament metadata + `model_url` + photo URLs.
3. If `model_url` present, `<model-viewer src={model_url}>` is rendered; user rotates/zooms via touch.
4. If absent, photo gallery renders instead.

### 5.2 Rate bubble refresh
1. On app load (and every N minutes), frontend calls `GET /rates/current`.
2. Response: `{ gold: {rate, unit, purity, updated_at}, silver: {...} }`.
3. Bubbles render/update without page reload.

### 5.3 Admin updates rate
1. Admin logs in → Rate Manager screen.
2. Submits new Gold/Silver values → `POST /admin/rates`.
3. Backend writes a new "current" rate row + appends to history; timestamps it.
4. Next customer poll picks up the new value.

## 6. Deployment Topology (overview — details in DevOps doc)

- Single VM or container host running FastAPI (via Uvicorn/Gunicorn) behind Nginx.
- React apps built as static bundles (customer + admin), served via Nginx or a static host/CDN.
- Database (PostgreSQL recommended for relational rate-history + ornament data) on the same host or managed DB service.
- Media/3D assets served via Nginx static path or object storage + CDN for faster mobile delivery.

## 7. Key Architectural Decisions

| Decision | Rationale |
|---|---|
| No cart/order microservice | Explicitly out of scope; reduces complexity and attack surface |
| `<model-viewer>` over custom Three.js scene per ornament | Fast to implement, mobile gesture support built-in, good enough fidelity for a jewellery catalogue |
| Manual rate entry, no external API | Matches business requirement; avoids cost/complexity of market-data integration |
| Single backend serving both apps | One codebase to maintain for a solo developer, distinguished by auth-gated `/admin/*` routes |
| Mobile-first only, no dedicated desktop breakpoints | Matches explicit requirement; saves design/QA effort |
