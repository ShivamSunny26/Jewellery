# API Specification
## Shree Om Jwellers — Jewellery Showcase Website

**Version:** 1.0 | **Base URL:** `/api/v1` | **Format:** JSON over HTTPS
**Auth:** Admin endpoints require a valid session (JWT in HTTP-only cookie). Public endpoints require no auth.

---

## 1. Public Endpoints (Customer App)

### 1.1 Categories
`GET /categories`
Returns all categories, ordered by `display_order`.
```json
[{ "id": 1, "name": "Necklaces", "slug": "necklaces" }]
```

### 1.2 Ornament Listing
`GET /ornaments?category=necklaces`
Returns visible ornaments (optionally filtered by category slug).
```json
[{
  "id": 12, "name": "Temple Gold Necklace", "category": "Necklaces",
  "purity": "22K", "approx_weight_grams": 24.5,
  "thumbnail_url": "https://.../photo1.jpg"
}]
```

### 1.3 Ornament Detail
`GET /ornaments/{id}`
```json
{
  "id": 12, "name": "Temple Gold Necklace", "category": "Necklaces",
  "description": "Handcrafted temple-style necklace...",
  "purity": "22K", "approx_weight_grams": 24.5,
  "making_charge_note": "Making charges applicable, ask in store",
  "model_url": "https://.../models/necklace-12.glb",
  "photos": ["https://.../photo1.jpg", "https://.../photo2.jpg"]
}
```
Returns `404` if not found or `is_visible = false`.

### 1.4 Current Rates (powers the two bubbles)
`GET /rates/current`
```json
{
  "gold": { "rate_value": 7185.00, "unit": "per gram", "purity_reference": "22K", "updated_at": "2026-08-15T08:30:00Z" },
  "silver": { "rate_value": 92.50, "unit": "per gram", "purity_reference": "92.5", "updated_at": "2026-08-15T08:30:00Z" }
}
```

### 1.5 Submit Enquiry
`POST /enquiries`
```json
{ "ornament_id": 12, "customer_name": "Riya Shah", "customer_phone": "9876543210", "message": "Is this available in 18K?" }
```
Response: `201 Created` with the created enquiry `id`. `ornament_id` is optional (omit for general enquiries).

## 2. Admin Endpoints (`/admin/*`, auth required)

### 2.1 Auth
`POST /admin/login` → `{ username, password }` → sets HTTP-only session cookie, returns admin profile.
`POST /admin/logout` → clears session.
`GET /admin/me` → returns current admin profile (session check).

### 2.2 Ornament Management
`POST /admin/ornaments` — create ornament (JSON body: name, category_id, description, purity, approx_weight_grams, making_charge_note, is_visible).
`PUT /admin/ornaments/{id}` — update fields.
`DELETE /admin/ornaments/{id}` — delete ornament (and cascade media).
`PATCH /admin/ornaments/{id}/visibility` — `{ "is_visible": true|false }`.

### 2.3 Media Upload
`POST /admin/ornaments/{id}/media` — multipart form upload; `media_type` = `photo` or `model` (GLB). Returns stored `url`. On `model` upload, also updates `ornaments.model_url`.
`DELETE /admin/media/{media_id}` — remove a photo/model.

### 2.4 Category Management
`POST /admin/categories` / `PUT /admin/categories/{id}` / `DELETE /admin/categories/{id}`.

### 2.5 Rate Management
`GET /admin/rates/history?metal=gold&limit=30` — recent rate history for a metal.
`POST /admin/rates` — set a new active rate:
```json
{ "metal": "gold", "rate_value": 7190.00, "unit": "per gram", "purity_reference": "22K" }
```
Server marks previous active row for that metal `is_active=false`, inserts the new active row, stamps `created_at` and `set_by_admin_id`.

### 2.6 Enquiry Management
`GET /admin/enquiries?status=new` — list enquiries.
`PATCH /admin/enquiries/{id}` — `{ "status": "read" | "resolved" }`.

## 3. Standard Error Format
```json
{ "error": { "code": "NOT_FOUND", "message": "Ornament not found" } }
```

## 4. Rate Limiting

- `POST /enquiries` — rate-limited per IP (e.g., 5/min) to prevent spam.
- `POST /admin/login` — rate-limited per IP (e.g., 5 attempts/15 min) to resist brute force.

## 5. Explicitly Absent Endpoints

There is **no** `/cart`, `/checkout`, `/orders`, or `/payments` namespace anywhere in this API — by design, matching the no-delivery business constraint.
