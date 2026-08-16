# Product Requirements Document (PRD)
## Shree Om Jwellers — Jewellery Showcase Website

**Version:** 1.0
**Date:** August 15, 2026
**Document Owner:** Shivam (Product/Developer)

---

## 1. Purpose

This document defines the product requirements for the **Shree Om Jwellers** website — a digital showcase for the shop's jewellery catalogue. The website is **not a transactional e-commerce store**. It exists to let customers browse, view ornaments in 3D, check live gold/silver rates, and enquire — while the actual sale happens in-store, since the shop does not offer delivery.

## 2. Background & Problem Statement

Shree Om Jwellers is a physical jewellery shop with no online presence. Customers currently cannot preview the shop's collection before visiting, and have no easy way to check today's gold/silver rate without calling. A digital catalogue with a realistic, premium look builds trust and drives footfall, without requiring the shop to build logistics/delivery capability it doesn't have.

## 3. Goals

- Give customers a realistic, trustworthy digital preview of the shop's jewellery.
- Let customers rotate/zoom ornaments in 3D before visiting in person.
- Display today's Gold and Silver rate, kept current by the admin.
- Give the shop owner (admin) a simple mobile panel to manage the catalogue and rates — no desktop dependency.
- Avoid any commitment to online transactions, cart, checkout, or delivery.

## 4. Non-Goals

- No shopping cart, checkout, payment gateway, or order management.
- No delivery/shipping tracking of any kind.
- No desktop-optimized layout — both customer site and admin panel are mobile-first only (desktop is best-effort, not a requirement).
- No multi-store / multi-vendor support (single shop only).

## 5. Target Users

| User | Description |
|---|---|
| **Customer** | Prospective buyer browsing on their phone, deciding whether to visit the shop. Wants to see designs, weight/purity info, and current rates. |
| **Admin (Shop Owner/Staff)** | Owns the catalogue and rates. Uses a phone to add/edit ornaments, upload photos/3D models, and update gold/silver rates daily. Not necessarily very technical. |

## 6. Key Features

### 6.1 Customer-Facing Site
1. **Home page** — shop branding, hero banner, featured collections, categories (e.g., Rings, Necklaces, Bangles, Earrings, Bridal Sets).
2. **Catalogue / Category browsing** — grid of ornaments with photo, name, category, approx. weight, purity (22K/18K etc.).
3. **Ornament Detail Page** — on opening a specific ornament, an **interactive 3D view** loads (rotate/pinch-zoom/pan) alongside standard photos, description, weight, purity, and making details.
4. **Gold/Silver Rate Bubbles** — two floating, always-visible bubbles pinned to the **bottom-right corner** on every page: one shows today's **Gold rate**, one shows today's **Silver rate**. Tapping a bubble expands a small card with rate detail and last-updated time.
5. **Enquire / Contact** — a simple "Enquire about this piece" / "Visit Us" action (WhatsApp/call/contact form) — explicitly **not** an "Add to Cart" or "Buy Now" flow.
6. **Store Info** — address, map, hours, contact — since customers must visit in person.

### 6.2 Admin Panel
1. **Secure login** (owner/staff only).
2. **Manage Ornaments** — add/edit/delete ornaments: photos, 3D model upload, name, category, weight, purity, description, making charges note, visibility (show/hide).
3. **Manage Rates** — a simple form to manually set today's Gold rate and Silver rate (per gram, by purity if needed). This is what drives the two bubbles on the customer site.
4. **Manage Categories** — create/edit ornament categories.
5. **View Enquiries** — list of customer enquiries/contact submissions.
6. **Mobile-first dashboard** — designed to be run entirely from the admin's phone.

## 7. User Stories

- As a customer, I want to rotate a necklace in 3D so I can see how it actually looks before visiting the shop.
- As a customer, I want to see today's gold rate at a glance without navigating anywhere, so I know current pricing context.
- As a customer, I want to enquire about a piece via WhatsApp/call instead of being forced into a cart/checkout I don't need.
- As the shop owner, I want to update today's gold and silver rate from my phone in under 30 seconds every morning.
- As the shop owner, I want to upload a new ornament with photos and a 3D model without needing a computer.

## 8. Success Metrics

- % of ornament detail pages where the 3D viewer is engaged (rotated/zoomed).
- Daily rate-update compliance (admin updates rates each business day).
- Number of enquiries generated per week.
- Mobile page-load performance (see NFRs in SRS).

## 9. Constraints

- No delivery capability → no cart/checkout by design decision, not a technical limitation.
- Mobile-first only for both customer and admin surfaces.
- 3D assets must be lightweight enough for average Indian mobile networks (3G/4G).

## 10. Assumptions

- Admin will supply real photographs and, over time, 3D models (or a 3D model can be approximated from photos using a documented pipeline — see SAD).
- Gold/silver rates are **manually entered by the admin**, not pulled from a live market feed (per explicit requirement).

## 11. Release Scope (v1)

In scope: catalogue browsing, ornament 3D view, rate bubbles, enquiry contact, admin CRUD for ornaments/categories/rates, mobile-first responsive UI for both panels.

Out of scope (v1): cart, checkout, payments, delivery, multi-language, multi-store, live market rate integration, desktop-specific layouts.
