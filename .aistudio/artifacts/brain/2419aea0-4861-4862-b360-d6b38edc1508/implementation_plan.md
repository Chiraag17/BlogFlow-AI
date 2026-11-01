# Fix Post-Login 404 Not Found Error

## Overview
Currently, after a successful login, signup, demo login, or password reset, the authentication portal redirects to `/studio`, which does not exist in the Next.js App Router (the main workspace route is `/dashboard` inside `/app/(dashboard)/dashboard/page.tsx`). We will update the redirect target to `/dashboard` (respecting any `callbackUrl` query parameter) and add a `/studio` route alias so both `/dashboard` and `/studio` resolve cleanly without a 404.

---

## 1. Root Cause & Fix Strategy
- **Update Post-Login Redirect Target**:
  - Update the post-login 3D warp redirect, initial session check, and OAuth `callbackUrl` in the authentication portal to navigate to `searchParams.get('callbackUrl') || '/dashboard'`.
- **Add `/studio` Route Alias**:
  - Add `/app/(dashboard)/studio/page.tsx` that renders the main dashboard workspace so any bookmark or navigation to `/studio` also loads the dashboard without a 404 error.
