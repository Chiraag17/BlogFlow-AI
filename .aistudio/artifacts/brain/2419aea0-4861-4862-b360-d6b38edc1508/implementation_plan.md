# Implementation Plan: 3D Gutenberg Type-Block Cube & Editorial Auth UI/UX Redesign

## 1. Visual & Spatial Architecture (Aligned to the 3D Cube)
- **Replace the 3D Prism with `GutenbergTypeBlock3D`**:
  - Remove the previous blue/cyan `BF·I PRISM` sculpture and floating pill capsules from the Login/Signup portal.
  - Embed the signature **`GutenbergTypeBlock3D`** component from `/components/brand/GutenbergTypeBlock3D.tsx` in two coordinated places:
    1. **Top Header Brand Mark (`size={32}`)**: Paired with the `BlogFlow AI` serif wordmark (`Fraunces`), matching the landing page lockup.
    2. **Left Interactive 3D Cube Stage (`size={148}`)**: Mounted on a warm brass-and-forest-green archival pedestal with subtle concentric brass calibration rings and cursor-reactive tilt.
- **Warm Archival Paper, Deep Forest Green & Brushed Brass Palette**:
  - **Primary Canvas**: Warm Archival Paper (`#F7F4EC`) in light mode and Deep Forest Obsidian (`#0B1612`) in dark mode, with subtle architectural grid hairlines and warm radial brass/emerald lighting.
  - **High-Contrast Typography**: Deep Charcoal Ink (`#18211D`) headlines and prose on Warm Archival Paper (eliminating the previous white-on-light contrast issue), paired with Muted Sage-Ink (`#4A5A52`) subtitles and Brushed Brass (`#B88E44` / `#C8A15A`) accents.
  - **Zero-Pill & Anti-Slop Discipline**: Clean unboxed typographic metadata separated by `·` dividers instead of floating pill badges, and zero workflow/pipeline/SEO dashboard clutter.

## 2. Interactive 3D Cube Choreography & Form Coupling
- **Dynamic Face Rotation per Auth Mode & Focused Input**:
  - **Sign In Mode (Default)**: Cube rotates to the **`monogram`** face (`B` movable-type block).
  - **Create Account Mode**: Cube rotates to the **`nib`** face (Fountain Nib / authorship).
  - **Email / Name Input Focused**: Cube rotates to the **`loupe`** face (Optical Lens) or **`section`** face (`§` Editorial Silcrow).
  - **Password / OTP / Security Step**: Cube rotates to the **`seal`** face (Verified Stamp).
  - **Interactive Face Switcher & Click-to-Stamp**: Users can also click the 3D cube directly (or select any of the 5 faces—`Monogram`, `Loupe`, `Nib`, `Seal`, `Silcrow`—via a quiet typographic index below the stage) to inspect each carved brass/forest-green face and trigger an expanding brass ripple.
- **Live Keystroke Physics (`activityPulse`)**:
  - Every keystroke inside Email, Name, Password, or the 6-digit OTP boxes increments `activityPulse` and drives `scrollPct` based on form completion, giving the 3D Gutenberg Type-Block a crisp mechanical press impulse as the user types.

## 3. Authentication & Multi-Step Password Recovery UX (Restyled to Match Cube)
- **Editorial Auth Card**:
  - Tailored in Warm Cream (`#FCFBF7`) with `1px` Brushed Brass / Forest hairlines (`rgba(22, 63, 50, 0.14)`), Deep Forest Green primary CTA buttons (`#163F32` with `#C8A15A` brass hover highlight), and tactile brass focus rings on inputs.
- **Complete Auth Capabilities Preserved**:
  - **Sign In & Create Account**: Smooth segmented toggle with real PostgreSQL + NextAuth authentication, password visibility toggle, live 4-bar brass/emerald password strength meter, and **Instant Demo Studio Access** (`demo@blogflow.ai`).
  - **3-Step Animated Forgot Password Flow**:
    1. *Step 1 (Request Code)*: Enter email to generate a 6-digit verification code (with instant on-screen preview banner for demo testing).
    2. *Step 2 (Verify 6-Digit OTP)*: Interactive 6-box tabular OTP input with auto-advance and paste support (`seal` face active on the 3D cube).
    3. *Step 3 (New Password)*: Set and confirm new password, updating PostgreSQL via `/api/auth/reset-password` and returning to Sign In.

## 4. Files to Modify
- **`/components/auth/MorphingAuthPortal.tsx`**: Replace the 3D prism stage with the interactive `GutenbergTypeBlock3D` stage + header mark, wire form state and keystrokes to `activeFace`, `activityPulse`, and `scrollPct`, and restyle the entire portal in the Warm Archival Paper (`#F7F4EC`), Deep Forest Green (`#163F32`), and Brushed Brass (`#C8A15A`) palette with full WCAG AA contrast.
