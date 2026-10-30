# Implementation Plan: Interactive 3D Morphing Auth Portal & Multi-Step Password Recovery

## 1. Aesthetic & Creative Direction (Zero Workflow Elements)
We will completely replace the archival press-pass/folio UI and remove **all** workflow, dashboard, or pipeline elements. In their place, `/login` and `/register` will share an **Interactive 3D Glassmorphic Morphing Portal** experience built with `motion/react` spring physics:

- **Cursor-Reactive Aurora & Prismatic Mesh Canvas**:
  - A full-viewport dark obsidian canvas (`#06070B`) illuminated by dynamic, cursor-tracked bioluminescent aurora ribbons (indigo, violet, cyan, and warm rose-gold accents) that shift smoothly using `useMotionValue` and `useSpring` as the user moves their mouse or types.
  - Interactive keystroke resonance: typing into inputs sends subtle chromatic ripples and light pulses across the glass portal border.
- **Floating Kinetic Typography Sculpture (Artistic Showcase)**:
  - Instead of product workflow widgets or SEO gauges, the ambient space features floating, depth-layered kinetic typography and refractive glass prism rings that tilt in 3D perspective (`rotateX`, `rotateY`, `translateZ`) in response to cursor movement.
  - Smoothly morphs its visual mood and color temperature depending on the active mode:
    - **Sign In Mode**: Deep electric indigo & cyan aura.
    - **Sign Up Mode**: Vibrant emerald-teal & violet creative aura.
    - **Forgot Password / Recovery Mode**: Warm amber-gold & magenta security vault aura.
- **3D Glassmorphic Morphing Portal Card**:
  - A central/split refractive glass portal (`backdrop-blur-2xl`, specular border highlights, subtle 3D tilt with toggleable/gentle perspective) that fluidly morphs height, layout, and header states using Framer Motion `AnimatePresence` and `layoutId` shared element transitions—allowing instant, zero-flicker switching between **Sign In**, **Create Account**, and **Forgot Password** without full page reloads.

---

## 2. Complete Authentication & Multi-Step Forgot Password Architecture

### A. Multi-Step In-Card Forgot Password Flow
Inside the morphing portal, clicking **"Forgot password?"** transitions smoothly into a 3-step animated recovery wizard:
1. **Step 1 — Account Lookup (Email Entry)**:
   - User enters their registered email address.
   - Calls `POST /api/auth/forgot-password`, which verifies the user in Prisma (or auto-provisions the demo user if testing with the demo email) and generates a 6-digit verification code (with an instant on-screen preview banner for seamless testing in the preview environment, plus copy/auto-fill button).
2. **Step 2 — 6-Digit OTP Verification**:
   - Interactive 6-slot OTP input with auto-advance on keypress, backspace navigation, paste support, and animated active-slot glow.
   - Verifies the 6-digit code before unlocking the password reset step.
3. **Step 3 — Set New Password & Database Update**:
   - New Password + Confirm Password inputs with real-time 4-bar strength physics and requirement badges.
   - Calls `POST /api/auth/reset-password`, which verifies the OTP, hashes the new password with `bcrypt.hash(newPassword, 10)`, updates `user.passwordHash` in Prisma, and offers a one-click auto-sign-in or smooth morph back to Sign In with a confirmed state.

### B. Sign In & Sign Up Enhancements
- **Sign In**:
  - Floating-label glass inputs with focus light beams, password visibility toggle, "Remember me" session toggle, and animated error shake feedback on invalid credentials.
  - **1-Click Instant Studio Demo Access**: A dedicated button that signs into a real database-backed demo account (`demo@blogflow.ai`) and redirects straight to the app.
  - **Social Auth Buttons**: Google and GitHub OAuth sign-in triggers with graceful toast feedback if OAuth credentials are not configured in `.env`.
- **Sign Up**:
  - Real-time password strength meter (length, uppercase, number, symbol) with animated progress bars.
  - **Auto-Login after Registration**: Creating an account via `POST /api/auth/register` immediately signs the user in via `signIn('credentials')` and transitions straight into the workspace.

---

## 3. Planned File Changes

1. **`/components/auth/MorphingAuthPortal.tsx` (New Component)**
   - Unified interactive 3D/glassmorphic authentication experience supporting `login`, `register`, and `forgot-password` (Steps 1–3) modes, cursor-reactive aurora background, kinetic typography sculpture, and Framer Motion choreographed transitions.
2. **`/app/api/auth/forgot-password/route.ts` (New API Route)**
   - Validates email against Prisma `user` table, generates a signed/time-bound 6-digit OTP token, and returns the verification challenge.
3. **`/app/api/auth/reset-password/route.ts` (New API Route)**
   - Validates email + 6-digit OTP code + new password, updates `passwordHash` in Prisma using `bcrypt`, and returns success.
4. **`/lib/authOptions.ts` (Update)**
   - Add auto-provisioning for the demo account (`demo@blogflow.ai`) so 1-click demo login and password reset always work reliably, plus optional Google/GitHub providers and resilient secret configuration.
5. **`/app/login/page.tsx` & `/app/register/page.tsx` (Update)**
   - Replace the old archival press-pass pages with `MorphingAuthPortal` initialized to `initialMode="login"` and `initialMode="register"` respectively.
