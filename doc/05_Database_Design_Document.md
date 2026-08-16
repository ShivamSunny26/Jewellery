# Database Design Document
## Shree Om Jwellers — Jewellery Showcase Website

**Version:** 1.0
**Date:** August 15, 2026
**Engine:** PostgreSQL (relational — suits rate history, ornament/category relations)

---

## 1. Entity Overview

- `admins` — shop owner/staff accounts.
- `categories` — ornament categories (Rings, Necklaces, Bangles, etc.).
- `ornaments` — individual jewellery items.
- `ornament_media` — photos and 3D model files per ornament.
- `rates` — gold/silver rate history, with one "active/current" row per metal.
- `enquiries` — customer enquiries.

## 2. Table Definitions

### 2.1 `admins`
| Column | Type | Notes |
|---|---|---|
| id | UUID / SERIAL PK | |
| username | VARCHAR(50) UNIQUE NOT NULL | |
| password_hash | VARCHAR(255) NOT NULL | bcrypt/argon2 hash |
| full_name | VARCHAR(100) | |
| created_at | TIMESTAMP DEFAULT now() | |
| last_login_at | TIMESTAMP NULL | |

### 2.2 `categories`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(80) UNIQUE NOT NULL | e.g. "Necklaces" |
| slug | VARCHAR(80) UNIQUE NOT NULL | for URLs |
| display_order | INT DEFAULT 0 | |
| created_at | TIMESTAMP DEFAULT now() | |

### 2.3 `ornaments`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| category_id | INT FK → categories.id | |
| name | VARCHAR(150) NOT NULL | |
| description | TEXT | |
| purity | VARCHAR(20) | e.g. "22K", "92.5 Silver" |
| approx_weight_grams | DECIMAL(8,2) | |
| making_charge_note | VARCHAR(255) NULL | free-text note, not a computed price |
| is_visible | BOOLEAN DEFAULT true | controls customer-site visibility |
| model_url | VARCHAR(500) NULL | path/URL to GLB 3D model, nullable |
| created_at | TIMESTAMP DEFAULT now() | |
| updated_at | TIMESTAMP DEFAULT now() | |

### 2.4 `ornament_media`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| ornament_id | INT FK → ornaments.id | |
| media_type | ENUM('photo','model') | |
| url | VARCHAR(500) NOT NULL | |
| sort_order | INT DEFAULT 0 | |
| created_at | TIMESTAMP DEFAULT now() | |

*(Photos live here as `media_type='photo'`; the primary 3D model may also be duplicated here as `media_type='model'` for gallery consistency, while `ornaments.model_url` remains the canonical field the 3D viewer reads.)*

### 2.5 `rates`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| metal | ENUM('gold','silver') NOT NULL | |
| rate_value | DECIMAL(10,2) NOT NULL | e.g. per gram |
| unit | VARCHAR(20) DEFAULT 'per gram' | |
| purity_reference | VARCHAR(20) NULL | e.g. "22K" for gold |
| is_active | BOOLEAN DEFAULT false | only one active=true row per metal at a time |
| set_by_admin_id | INT FK → admins.id | |
| created_at | TIMESTAMP DEFAULT now() | acts as "last updated" for active row |

**Rule:** On insert of a new active rate for a metal, the previous active row for that metal is set `is_active = false` (kept for history). `GET /rates/current` reads the two `is_active=true` rows.

### 2.6 `enquiries`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| ornament_id | INT FK → ornaments.id NULL | nullable for general enquiries |
| customer_name | VARCHAR(100) NOT NULL | |
| customer_phone | VARCHAR(20) NOT NULL | |
| message | TEXT | |
| status | ENUM('new','read','resolved') DEFAULT 'new' | |
| created_at | TIMESTAMP DEFAULT now() | |

## 3. Relationships (ER Summary)

```
categories (1) ──── (many) ornaments
ornaments  (1) ──── (many) ornament_media
ornaments  (1) ──── (many) enquiries
admins     (1) ──── (many) rates   [set_by_admin_id]
```

No relationship to any `orders`/`cart` table exists by design — this schema has none.

## 4. Indexing Strategy

- `ornaments(category_id)` — fast category listing.
- `ornaments(is_visible)` — fast public catalogue filtering.
- `rates(metal, is_active)` — fast lookup of current rate.
- `enquiries(status)` — fast admin inbox filtering.

## 5. Notes on Media Storage

Actual binary files (photos, GLB models) are **not** stored in the database — only their URLs/paths are. Files live on disk/object storage as described in the SAD and DevOps documents.
