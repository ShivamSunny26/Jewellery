# Shree Om Jwellers — Jewellery Showcase Website

A mobile-first digital catalogue for **Shree Om Jwellers**, a physical jewellery shop. Customers browse ornaments by category, view them in interactive 3D, check today's gold & silver rates, and send enquiries — all from a phone. The shop owner manages everything (ornaments, photos, 3D models, rates, enquiries) through a separate admin panel.

> **Not an e-commerce store.** There is no cart, checkout, payments, or delivery — by design. The sale happens in-store; the website's job is to showcase the collection and drive walk-ins & enquiries.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Customer Frontend](#customer-frontend)
  - [Admin Frontend](#admin-frontend)
- [Default Seeded Data](#default-seeded-data)
- [API Overview](#api-overview)
- [Documentation](#documentation)
- [License](#license)

---

## Key Features

### Customer Website
- **Home** — hero banner, category chips, featured ornaments grid
- **Category browsing** — Rings, Necklaces, Bangles, Earrings, Bridal Sets (filtered 2-column grid)
- **Ornament detail** — interactive **3D viewer** (rotate / pinch-zoom / auto-rotate / AR via `<model-viewer>`) with photo-gallery fallback; purity, weight, description, making charge
- **Live rate bubbles** — floating gold & silver rate bubbles on every page; tap to expand; auto-refreshes every 5 minutes
- **Enquiry** — form (name / phone / message, ornament pre-filled), WhatsApp button, and call button
- **Store info** — address, OpenStreetMap embed, hours, phone / WhatsApp

### Admin Panel (phone-friendly)
- JWT-protected login (`AuthGuard`)
- Dashboard with quick actions and unread enquiry badge
- Ornament CRUD with multi-photo upload and **GLB / glTF 3D model upload**
- Show / hide (visibility toggle) for ornaments
- Category management
- Daily gold (22K) & silver (92.5) rate updates with per-metal history
- Enquiry inbox with status (new / read / resolved) and one-tap call

### Security
- JWT (HS256) stored in an **HTTP-only cookie**
- bcrypt password hashing
- Sliding-window rate limiting (login: 5 / 15 min, enquiries: 5 / 60 s per IP)
- Security headers (CSP, X-Frame-Options, nosniff, Referrer-Policy)
- Upload validation (MIME type + size limits, randomized UUID filenames)
- Admin panel excluded from search engines (`noindex`, `robots.txt`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.13, FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| **Database** | PostgreSQL (local or Supabase) |
| **Auth** | PyJWT + bcrypt, HTTP-only cookies |
| **Customer Frontend** | React 18, Vite 6, React Router 6, plain CSS |
| **Admin Frontend** | React 18, Vite 6, React Router 6, plain CSS |
| **3D Viewing** | Google `<model-viewer>` v3.5 (Three.js under the hood) |
| **Typography** | Playfair Display (headings) + Inter (body) — Google Fonts |

---

## Project Structure

```
jewellery/
├── backend/                  FastAPI REST API
│   ├── main.py               App entry + startup (auto-create tables & seed)
│   ├── seed.py               Seed script (manual re-seed)
│   ├── requirements.txt
│   ├── .env                  DATABASE_URL, JWT_SECRET, CORS, media path
│   ├── media/                Uploaded photos + placeholder SVGs
│   └── app/
│       ├── core/             config, database, deps, security, rate_limit
│       ├── models/           SQLAlchemy models
│       ├── schemas/          Pydantic schemas (public + admin)
│       └── routers/          4 public + 6 admin routers
├── frontend-customer/        React app (port 3000)
│   └── src/                  Home, CategoryPage, OrnamentDetail, Enquiry,
│                             StoreInfo, RateBubbles, ModelViewer3D
├── frontend-admin/           React app (port 3001)
│   └── src/                  Login, Dashboard, Ornaments, Categories,
│                             Rates, Enquiries
├── doc/                      11 project documents (PRD … Developer Docs)
└── LICENSE                   MIT © 2026 ShivamSunny26
```

---

## Getting Started

### Prerequisites

- **Python 3.13+**
- **Node.js 18+** and npm
- **PostgreSQL 14+** (local instance or a Supabase project)

### Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env and set:
#   DATABASE_URL        e.g. postgresql://user:pass@localhost:5432/shreeomjwellers
#   JWT_SECRET          a long random string
#   CORS_ORIGINS        http://localhost:3000,http://localhost:3001
#   MEDIA_STORAGE_PATH  ./media
#   PUBLIC_BASE_URL     http://localhost:8000

# Run the API (http://127.0.0.1:8000)
uvicorn main:app --reload
```

On first startup the app **automatically creates all tables and seeds sample data** if the database is empty. To re-seed manually (drops and recreates tables):

```bash
python seed.py
```

### Customer Frontend

```bash
cd frontend-customer
npm install
npm run dev          # http://localhost:3000
```

### Admin Frontend

```bash
cd frontend-admin
npm install
npm run dev          # http://localhost:3001
```

Both frontends proxy `/api` and `/media` to the backend at `http://localhost:8000` via Vite config.

---

## Default Seeded Data

| Item | Value |
|---|---|
| Admin login | **admin** / **admin123** |
| Categories | Rings, Necklaces, Bangles, Earrings, Bridal Sets |
| Sample ornaments | 6 (with placeholder SVG photos) |
| Gold rate | ₹7,185.00 / gram (22K) |
| Silver rate | ₹92.50 / gram (92.5) |
| Sample enquiry | 1 ("Riya Shah") |

> Change the admin password and `JWT_SECRET` before deploying to production.

---

## API Overview

Base path: `/api/v1`

### Public
| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | List categories |
| GET | `/ornaments?category=` | List ornaments (optionally filtered) |
| GET | `/ornaments/{id}` | Ornament detail with media |
| GET | `/rates/current` | Today's gold & silver rates |
| POST | `/enquiries` | Submit an enquiry |

### Admin (JWT required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/login` | Login (sets HTTP-only cookie) |
| POST | `/admin/logout` | Logout |
| GET | `/admin/me` | Current admin profile |
| GET/POST | `/admin/ornaments` | List / create ornaments |
| GET/PUT/DELETE | `/admin/ornaments/{id}` | Read / update / delete |
| PATCH | `/admin/ornaments/{id}/visibility` | Show / hide |
| POST | `/admin/ornaments/{id}/media` | Upload photo or 3D model |
| DELETE | `/admin/media/{id}` | Delete media |
| GET/POST | `/admin/categories` | List / create categories |
| PUT/DELETE | `/admin/categories/{id}` | Update / delete |
| GET | `/admin/rates/history` | Rate history |
| POST | `/admin/rates` | Update today's rates |
| GET | `/admin/enquiries` | List enquiries |
| PATCH | `/admin/enquiries/{id}` | Update enquiry status |
| GET | `/health` | Health check |

---

## Documentation

Detailed project documentation lives in the [`doc/`](doc/) folder:

| # | Document |
|---|---|
| 01 | Product Requirements Document (PRD) |
| 02 | Business Requirements Document (BRD) |
| 03 | Software Requirements Specification (SRS) |
| 04 | System Architecture Design (SAD) |
| 05 | Database Design |
| 06 | API Specification |
| 07 | UI/UX Design |
| 08 | Security Design |
| 09 | Deployment & DevOps |
| 10 | User Documentation |
| 11 | Developer Technical Documentation |

---

## License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 ShivamSunny26.
