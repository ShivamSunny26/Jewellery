# Software Requirements Specification (SRS)
## Shree Om Jwellers — Jewellery Showcase Website

**Version:** 1.0
**Date:** August 15, 2026
**Standard reference:** Structured per IEEE 830 conventions (adapted)

---

## 1. Introduction

### 1.1 Purpose
Specifies functional and non-functional requirements for the Shree Om Jwellers website: a mobile-first, catalogue-only jewellery showcase with 3D ornament viewing, manual gold/silver rate display, and a separate admin panel. No cart/checkout/delivery.

### 1.2 Scope
Two applications:
1. **Customer Web App** — public, mobile-first, browsing + 3D view + rate bubbles + enquiry.
2. **Admin Web App** — private, mobile-first, catalogue/category/rate/enquiry management.

### 1.3 Definitions
- **Ornament** — an individual jewellery item (SKU) shown in the catalogue.
- **Rate Bubble** — the floating UI element (bottom-right) showing Gold or Silver rate.
- **Admin** — authenticated shop owner/staff user.

## 2. Overall Description

### 2.1 Product Perspective
Standalone web application, no integration with any existing shop system. Backend serves both the public site and the admin panel from one API.

### 2.2 Product Functions (summary)
- Browse ornaments by category.
- View ornament detail with 3D model + photos.
- View live-updated (admin-set) Gold/Silver rate bubbles.
- Submit an enquiry for an ornament.
- Admin: authenticate, manage ornaments, categories, rates, view enquiries.

### 2.3 User Classes
- **Anonymous Customer** — read-only, can submit enquiries.
- **Admin** — full CRUD on catalogue/categories/rates, read on enquiries.

### 2.4 Operating Environment
- Mobile browsers (Chrome/Safari on Android/iOS) — primary target.
- Desktop browsers — not a design target; layout should not break, but no dedicated desktop optimization is required.

### 2.5 Design & Implementation Constraints
- No payment/cart/order subsystems permitted anywhere in the app.
- 3D rendering must run acceptably on mid-range Android phones.
- Rate values are entered manually only; no external market data API required.

## 3. Functional Requirements

### FR-1 Catalogue Browsing
FR-1.1 The system shall display ornaments grouped by category on the home/catalogue page.
FR-1.2 The system shall allow filtering by category.
FR-1.3 The system shall show, per ornament card: primary photo, name, category, approx. weight, purity.

### FR-2 Ornament Detail & 3D View
FR-2.1 When a customer opens a specific ornament's detail page, the system shall load an interactive 3D view of that ornament if a 3D model is available.
FR-2.2 The 3D view shall support rotate, pinch-zoom, and pan via touch gestures.
FR-2.3 If no 3D model exists for an ornament, the system shall fall back to a standard photo gallery.
FR-2.4 The detail page shall display name, category, purity, approx. weight, description, and making-charge note (if provided).
FR-2.5 The detail page shall NOT display any purchase/cart/checkout control.

### FR-3 Gold/Silver Rate Bubbles
FR-3.1 The system shall display two floating bubbles fixed to the bottom-right corner of the viewport on every customer-facing page.
FR-3.2 One bubble shall show the current Gold rate; the other shall show the current Silver rate.
FR-3.3 Tapping a bubble shall expand it to show rate value, unit (e.g., per gram), purity reference (e.g., 22K), and last-updated date/time.
FR-3.4 Rate values shall be sourced from the value most recently saved by an admin — no automatic recalculation or external fetch.
FR-3.5 Bubbles shall remain visible while scrolling (fixed position) but must not block primary content or navigation controls.

### FR-4 Enquiry
FR-4.1 The system shall let a customer submit an enquiry (name, phone, message) tied to a specific ornament, or a general enquiry.
FR-4.2 The system shall optionally offer a direct WhatsApp/call link as an alternative to the form.
FR-4.3 The system shall NOT collect payment information at any point.

### FR-5 Admin Authentication
FR-5.1 The system shall require login (username/password) for all admin routes.
FR-5.2 The system shall issue a secure session (JWT in HTTP-only cookie) upon successful login.
FR-5.3 The system shall log out the admin and invalidate the session on request.

### FR-6 Admin — Ornament Management
FR-6.1 Admin shall be able to create, edit, delete, and show/hide ornaments.
FR-6.2 Admin shall be able to upload one or more photos and, optionally, a 3D model file (GLB/glTF) per ornament.
FR-6.3 Admin shall be able to assign an ornament to a category.

### FR-7 Admin — Category Management
FR-7.1 Admin shall be able to create, edit, and delete categories.

### FR-8 Admin — Rate Management
FR-8.1 Admin shall be able to enter/update today's Gold rate and Silver rate via a simple form.
FR-8.2 The system shall timestamp every rate update and retain the current value as "active."
FR-8.3 The system shall keep a history log of past rate entries (for admin reference).

### FR-9 Admin — Enquiry Review
FR-9.1 Admin shall be able to view a list of customer enquiries with contact details and associated ornament (if any).
FR-9.2 Admin shall be able to mark an enquiry as read/resolved.

## 4. Non-Functional Requirements

### NFR-1 Usability / Mobile-First
The customer and admin UIs shall be designed mobile-first (target viewport ~360–430px width); all core actions must be completable one-handed on a phone. Desktop is not a required breakpoint.

### NFR-2 Performance
NFR-2.1 Catalogue pages should be interactive within ~2.5s on a 4G connection.
NFR-2.2 3D models should be compressed (Draco/KTX2 where applicable) and lazy-loaded only on the ornament detail page that needs them.

### NFR-3 Availability
Standard single-server small-business availability target (no formal SLA); admin can update content without developer involvement.

### NFR-4 Security
See Security Design Document — admin auth via JWT + HTTP-only cookies, input validation, rate limiting on login and enquiry endpoints.

### NFR-5 Maintainability
Codebase organized so a single developer can extend it (add categories, tweak UI) without major refactors.

### NFR-6 Compatibility
Must render correctly on the last 2 major versions of Chrome (Android) and Safari (iOS).

## 5. External Interface Requirements

- **UI**: Responsive mobile-first web UI (React).
- **API**: REST/JSON API (FastAPI) consumed by both customer and admin front ends.
- **Storage**: Media (photos, 3D models) stored on disk/object storage, served via CDN-friendly static URLs.

## 6. Explicit Exclusions

- No shopping cart, checkout, order, invoice, or payment gateway of any kind.
- No delivery/shipping/tracking features.
- No automated/live gold-silver market rate feed.
- No dedicated desktop layout requirement.
