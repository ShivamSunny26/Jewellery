# Security Design Document
## Shree Om Jwellers — Jewellery Showcase Website

**Version:** 1.0
**Date:** August 15, 2026

---

## 1. Security Objectives

- Protect the admin panel (the only privileged surface) from unauthorized access.
- Prevent tampering with the publicly displayed Gold/Silver rates.
- Prevent abuse of public endpoints (enquiry spam, brute force).
- Since there is **no payment or personal financial data**, PCI-DSS-style concerns don't apply — but customer contact info (name/phone from enquiries) is still handled carefully.

## 2. Authentication & Authorization

- **Admin-only auth.** Customers never authenticate — all customer-facing endpoints are public/read (plus enquiry submission).
- Passwords stored with **bcrypt/argon2** hashing (never plain text).
- On login, issue a **JWT** stored in an **HTTP-only, Secure, SameSite=Strict cookie** — not accessible to JavaScript, mitigating XSS-based token theft.
- Session/token expiry (e.g., 8–24 hours), with re-login required after expiry.
- All `/admin/*` routes verify the session server-side before processing; no client-side-only gating.

## 3. Input Validation & Injection Protection

- All API inputs validated with strict schemas (Pydantic models in FastAPI) — reject malformed/oversized payloads.
- Parameterized queries / ORM usage only — no raw string-built SQL, preventing SQL injection.
- File uploads (photos, GLB models) validated by MIME type and extension allow-list; size-capped; stored outside the web root with randomized filenames to prevent path traversal or overwrite attacks.

## 4. Abuse Prevention

- **Rate limiting**: login attempts (e.g., 5/15 min per IP) and enquiry submissions (e.g., 5/min per IP) to blunt brute force and spam.
- **CAPTCHA (optional, if spam becomes an issue)** on the enquiry form.
- CORS restricted to the site's own domains (customer app + admin app origins only).

## 5. Data Integrity — Rates

- Only authenticated admins can call `POST /admin/rates`; the public `GET /rates/current` endpoint is read-only.
- Every rate change is logged with `set_by_admin_id` and timestamp, giving an audit trail (see Database Design Document, `rates` table) — so any suspicious change is traceable.

## 6. Transport & Infrastructure Security

- **HTTPS everywhere** (TLS via Let's Encrypt or hosting provider), HTTP requests redirected to HTTPS.
- Security headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or `frame-ancestors 'none'`), `Referrer-Policy: strict-origin-when-cross-origin`.
- Admin panel served on a distinct path/subdomain (e.g., `/admin` or `admin.shreeomjwellers.com`) — not indexed by search engines (`robots.txt` disallow).
- Regular dependency updates (FastAPI, React, and libraries) to patch known CVEs.

## 7. Privacy — Customer Data

- Enquiry data (name, phone, message) is the only personal data collected; stored only as long as operationally needed, accessible only to admin.
- No third-party trackers/ads that would leak customer data; analytics (if added) should be privacy-respecting (e.g., no cross-site tracking).

## 8. What's Deliberately Out of Scope

- No payment data of any kind is ever collected or stored — eliminates PCI-DSS and card-fraud surface entirely, consistent with the no-cart/no-checkout business decision.
- No customer account system/passwords to protect, since customers never log in.

## 9. Incident Response (lightweight, small-business scale)

- Admin credentials rotated immediately if device (owner's phone) is lost/stolen.
- Regular database backups (see DevOps document) so the catalogue/rates can be restored if compromised.
