# Security & Bug Remediation Plan — BlogFlow AI

## Overview
This plan addresses the security vulnerabilities and functional bugs identified during the codebase audit. It hardens authentication, enforces tenant isolation across API routes, prevents credential leakage, blocks Server-Side Request Forgery (SSRF), enforces database-verified editorial approvals before publishing, and adds rate limiting and HTTP security headers.

---

## 1. Access Control (IDOR) & Credential Leakage Prevention
- **Header Spoofing Prevention (`proxy.ts`)**:
  - Explicitly delete any incoming client-supplied `x-user-id`, `x-user-role`, and `x-user-email` headers before injecting verified JWT session claims so unauthenticated or malicious requests cannot spoof identity headers.
- **Tenant Isolation with Demo Seed Fallback (`services/db/website.service.ts`, `services/db/blog.service.ts`, `services/db/approval.service.ts`)**:
  - Scope queries to the authenticated user's websites (`userId`), while permitting read access to demo/seeded records where appropriate if the user has no personal websites yet, and enforcing strict ownership on mutations (`POST`, `PUT`, `PATCH`, `DELETE`).
  - Enforce ownership verification in `/api/blogs` (`GET`, `POST`), `/api/blogs/[id]` (`GET`, `PUT`), `/api/websites/[id]` (`GET`, `PATCH`, `DELETE`), and `/api/approvals` (`GET`).
- **Strip `encryptedCredentials` from API Responses**:
  - Update Prisma `include`/`select` projections in `DbWebsiteService.getWebsiteById`, `DbBlogService.getBlogById`, and `/api/websites/[id]` so `cmsIntegrations` never returns the `encryptedCredentials` column to the client.

---

## 2. SSRF Protection & Outbound Request Hardening
- **External URL Validator (`services/security/url-validator.ts`)**:
  - Create `validateExternalUrl(rawUrl: string)` that:
    - Enforces `http:` or `https:` protocol only.
    - Blocks `localhost`, `.local`, `.internal`, and IPv6 loopback (`::1`).
    - Blocks private, loopback, and link-local IPv4 ranges (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16` cloud metadata service, `0.0.0.0/8`).
- **Apply SSRF Guard & Timeouts**:
  - Integrate `validateExternalUrl()` and `AbortSignal.timeout(15000)` across `WordPressService` (`services/cms/wordpress.service.ts` and `services/cms/wordpress-service.ts`), website registration (`/api/websites`), and website analysis routes.

---

## 3. Database-Verified Approval Enforcement in `/api/publish`
- **Eliminate Client-Trusted Approval Bypass (`app/api/publish/route.ts`)**:
  - When a `blog.id` is provided, query PostgreSQL via `DbBlogService.getBlogById(blog.id)` to verify:
    1. The blog belongs to a website owned by the authenticated user (or valid demo workspace).
    2. The blog's server-side status in PostgreSQL is `APPROVED` (or has an `APPROVED` record in `BlogApproval`), rather than trusting the client-supplied `blog.status` JSON property.
  - Validate `config.siteUrl` through the SSRF validator before making outbound WordPress REST API calls.

---

## 4. Authentication, Encryption & Input Validation Hardening
- **Email Normalization & Password Bounds (`app/api/auth/register/route.ts`, `lib/authOptions.ts`)**:
  - Normalize emails with `.trim().toLowerCase()` during both registration and login to prevent case-variant duplicate accounts and login failures.
  - Cap password length at 72 characters in Zod schemas (`z.string().min(8).max(72)`) to prevent bcrypt truncation bugs and CPU exhaustion attacks.
- **Encryption Key Hardening (`services/security/encryption.service.ts`)**:
  - Replace the static plaintext fallback string with a fallback derived via SHA-256 from `NEXTAUTH_SECRET` / environment context if `ENCRYPTION_KEY` is not explicitly configured, and log a single clear startup warning in production if `ENCRYPTION_KEY` is missing.

---

## 5. In-Memory Rate Limiting & Security Headers
- **Sliding-Window Rate Limiter (`services/security/rate-limiter.ts`)**:
  - Implement a lightweight in-memory rate limiter keyed by client IP / user ID.
  - Apply rate limits to:
    - `/api/auth/register` (e.g., 10 requests / 15 minutes per IP)
    - AI generation & research endpoints (`/api/generate`, `/api/ai/*` — e.g., 20 requests / minute per user/IP)
- **HTTP Security Headers & Error Sanitization (`next.config.ts`)**:
  - Configure `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-DNS-Prefetch-Control: on`, and `Permissions-Policy: camera=(), microphone=(), geolocation=()` (while keeping iframe embedding enabled for the preview environment).
  - Sanitize unhandled database errors in API routes so raw SQL/Prisma stack traces are not leaked to clients.
