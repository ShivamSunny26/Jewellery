# Business Requirements Document (BRD)
## Shree Om Jwellers — Jewellery Showcase Website

**Version:** 1.0
**Date:** August 15, 2026

---

## 1. Business Overview

Shree Om Jwellers is a local jewellery retailer selling gold and silver ornaments (rings, necklaces, bangles, earrings, bridal sets, etc.) from a physical store. The business does not currently have an online presence and has **no delivery infrastructure**, so all sales must conclude with an in-person store visit.

## 2. Business Objectives

| # | Objective | Business Value |
|---|---|---|
| 1 | Build an online catalogue to showcase inventory | Increases discoverability and pre-visit trust |
| 2 | Offer an immersive 3D preview of ornaments | Differentiates from competitors who only show flat photos |
| 3 | Display daily Gold/Silver rates prominently | Builds transparency and repeat visits (customers checking rates) |
| 4 | Avoid online transactions entirely | Matches actual business capability — no delivery, no logistics overhead |
| 5 | Keep operations simple for non-technical staff | Owner/staff can run the whole site from a phone |

## 3. Stakeholders

| Stakeholder | Role |
|---|---|
| Shop Owner | Business decision-maker, primary admin user, sets rates and catalogue |
| Shop Staff (optional) | May also act as admin for day-to-day catalogue/rate updates |
| Customers | End users browsing on mobile devices |
| Developer (Shivam) | Designs, builds, and maintains the platform |

## 4. Business Requirements

### BR-1: Digital Catalogue
The business requires a categorized, browsable listing of all ornaments currently available in-store, presented attractively enough to substitute for an in-person first look.

### BR-2: 3D Product Visualization
The business requires that when a customer opens a specific ornament, they can view it in 3D (rotate/zoom) rather than only static photographs, to increase confidence before an in-store visit.

### BR-3: No Transaction Capability
The business explicitly requires **no cart, checkout, order, or payment functionality**, since it cannot fulfill delivery. All purchase intent must be redirected to an in-store visit or a direct enquiry (call/WhatsApp).

### BR-4: Manual Daily Rate Display
The business requires a highly visible, always-on display (two floating bubbles, bottom-right corner) of the day's Gold rate and Silver rate. Rates must be **manually entered by the admin** — no automatic market-data integration is required or desired at this stage (keeps costs and complexity down, and matches how many local jewellers price against their own quoted rate rather than a live index).

### BR-5: Two Distinct Access Roles
The business requires two separate interfaces:
- **Customer-facing** site — public, no login required.
- **Admin panel** — private, login-protected, used to manage catalogue, categories, and rates.

### BR-6: Mobile-First Operation
Both the customer site and the admin panel must work well on mobile phones, since customers browse on mobile and the owner/staff will manage the shop from a phone. Desktop support is not a business requirement.

## 5. Business Rules

1. A rate bubble always shows the **most recently saved** admin value — there is no automatic recalculation.
2. Ornaments not marked "visible" by admin must not appear on the customer site.
3. No ornament page may present a "Buy," "Add to Cart," or "Checkout" call-to-action; only "Enquire" / "Visit Store" / "Call" / "WhatsApp".
4. Admin login is required for any create/edit/delete action; customers never authenticate.

## 6. Cost & Resource Considerations

- No payment gateway integration cost (explicitly out of scope).
- 3D assets should be optimized (compressed glTF/GLB) to control hosting/bandwidth cost on mobile networks.
- Manual rate entry avoids recurring cost/complexity of a live market-data subscription.

## 7. Risks

| Risk | Mitigation |
|---|---|
| Admin forgets to update rates → stale info shown as current | Show a "Last updated" timestamp on each rate bubble |
| 3D models are hard/costly to produce for every ornament | Start with a subset of flagship ornaments in 3D; fall back to photo gallery for others |
| Customers expect to buy online and are confused by no cart | Clear "Visit our store to purchase" messaging throughout |

## 8. Success Criteria

- Catalogue live with categorized ornaments and working 3D views on flagship pieces.
- Admin can update gold/silver rate independently, without developer help.
- Increase in in-store footfall / enquiries attributable to the website (qualitative, tracked via enquiry form).
