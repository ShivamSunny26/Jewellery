# UI/UX Design Document
## Shree Om Jwellers — Jewellery Showcase Website

**Version:** 1.0
**Date:** August 15, 2026
**Design target:** Mobile-first only (≈360–430px), realistic/premium jewellery-brand feel

---

## 1. Design Principles

1. **Premium & realistic** — dark/rich backgrounds, gold-foil accent color, elegant serif for headings, generous product photography — should feel like a real jewellery brand, not a generic template.
2. **Mobile-only mindset** — every screen designed for one-thumb use on a phone; no requirement to gracefully scale to desktop.
3. **No transactional pressure** — visual language nudges toward "Enquire" / "Visit Store," never "Buy Now."
4. **3D as the hero moment** — the ornament detail page's 3D viewer is the single most important interaction in the product; it gets the most screen real estate and least visual clutter around it.

## 2. Visual Style

- **Color palette:** Deep maroon/charcoal black background (`#1A1210` / `#0F0D0C`), warm gold accent (`#C9A227` / `#E5C158`), ivory/cream text (`#F5EFE6`), silver accent (`#C7CCD1`) for the silver rate bubble.
- **Typography:** Elegant serif (e.g., "Playfair Display"-style) for shop name/headings; clean sans-serif for body text and admin UI.
- **Imagery:** Full-bleed, high-quality ornament photography; soft shadows; subtle gold-foil dividers.
- **Motion:** Gentle fade/scale transitions; the 3D model should auto-rotate slowly when idle to invite interaction.

## 3. Customer App — Screens

### 3.1 Home
- Sticky top header: "Shree Om Jwellers" logo/wordmark + hamburger menu.
- Hero banner (rotating featured ornaments).
- Horizontally scrollable category chips (Rings, Necklaces, Bangles, Earrings, Bridal…).
- Featured ornaments grid (2 columns on mobile).
- Rate bubbles visible (bottom-right, floating over content).

### 3.2 Category Listing
- Category title + chip filter row.
- 2-column ornament card grid: photo, name, purity, approx. weight.
- Infinite scroll or "Load more."

### 3.3 Ornament Detail (key screen)
- Top: **3D Viewer** (full-width, ~60% viewport height) using `<model-viewer>` with touch rotate/pinch-zoom; small "Tap & drag to rotate" hint overlay on first view.
- Thumbnail strip below viewer to switch to static photos if user prefers.
- Name, category, purity, approx. weight, description.
- "Making charges applicable — ask in store" note (if present).
- Two CTAs: **Enquire About This Piece** (opens form/WhatsApp) and **Visit Our Store** (opens Store Info / map).
- No price-to-cart, no "Add to bag."

### 3.4 Enquiry
- Minimal form: Name, Phone, Message (pre-filled with ornament name if opened from detail page).
- Alternate one-tap **WhatsApp** and **Call Shop** buttons above the form.

### 3.5 Store Info
- Address, embedded map, opening hours, phone/WhatsApp buttons.

### 3.6 Rate Bubbles (global component)
- Two small circular bubbles stacked vertically at bottom-right, offset from screen edge (safe-area aware for iOS).
- Gold bubble: gold-gradient background, "₹ Gold" label + rate.
- Silver bubble: silver-gradient background, "₹ Silver" label + rate.
- Tap → expands into a small card: full rate, unit, purity reference, "Updated: today, 8:30 AM."
- Bubbles must not overlap primary CTAs; on the ornament detail page they float above the 3D viewer's lower-right, kept small (56px) to avoid blocking gestures.

## 4. Admin App — Screens

### 4.1 Login
- Simple centered form: username, password, "Login" button. Shop name/logo above.

### 4.2 Dashboard
- 3 large tap targets: "Update Rates," "Manage Ornaments," "Enquiries" (with unread badge).

### 4.3 Rate Manager
- Two large numeric input fields (Gold ₹/gram, Silver ₹/gram), optional purity reference field, big "Save Rate" button.
- Below: recent history list (last 10 updates with timestamp).

### 4.4 Ornament Manager
- List view with search + visibility toggle switch per row.
- Add/Edit form: name, category (dropdown), purity, approx. weight, description, making-charge note, photo upload (multi), 3D model upload (single GLB), visibility toggle, Save.

### 4.5 Category Manager
- Simple list + add/edit/delete.

### 4.6 Enquiries
- List sorted newest-first; unread highlighted; tap to view full message + customer_phone with a "Call" quick-action; mark as resolved.

## 5. Interaction / Gesture Notes for 3D Viewer

- One-finger drag → rotate.
- Two-finger pinch → zoom.
- Auto-rotate when idle (~3s of no interaction), pauses on touch.
- Loading state: skeleton/shimmer placeholder while GLB loads; graceful fallback to photo gallery on load failure or unsupported browser.

## 6. Accessibility

- Minimum tap target size 44×44px (bubbles sized just above this floor).
- Sufficient contrast between gold/cream text and dark backgrounds (WCAG AA where feasible).
- Alt text on all ornament photos.

## 7. Explicitly Excluded UI Elements

- No cart icon, no "items in bag" badge, no checkout stepper, no price-and-buy button anywhere in the customer app.
