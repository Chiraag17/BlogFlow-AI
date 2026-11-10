# Hero Visual & Architectural Polish Plan: Open Borderless 3D Stage, Flagship Typography & Editorial Medallion Avatars

## 1. Architectural Vision
Transform the Hero section from a boxed two-column layout into an unobstructed, gallery-grade flagship showcase by resolving the three visual friction points selected in our audit:
1. **Open Borderless 3D Desk Stage & Minimal HUD (`FloatingEditorialDesk.tsx` & `landing.css`)**: Dissolve the heavy rectangular card box (`.lp-desk-studio` border, boxed background, and wide multi-row bottom dock) so the 3D Walnut & Forest Leather Editorial Desk, Articulated Brass Banker's Lamp, and Glowing Golden Ink Trail float seamlessly inside the Hero atmosphere. Replace the intrusive top/bottom chrome with a whisper-quiet, ultra-compact floating studio control pill (Camera Angle: *Iso / Top / Macro* + *Explode* toggle) tucked neatly at the bottom-right of the 3D pedestal.
2. **Flagship Editorial Typography Upgrade (`landing.css`)**: Upgrade the Hero font stack from `Instrument Serif` + `Inter` to **`Fraunces`** (optical-size variable old-style display serif with sculpted calligraphic terminals), **`Plus Jakarta Sans`** (crisp humanist UI & body sans), and **`JetBrains Mono`** (tabular technical telemetry), refining the optical weight, tracking, and italic contrast of *"Research. Think. Publish."*.
3. **Bespoke Editorial Medallion Avatars (`AvatarCircles.tsx` & `page.tsx`)**: Replace the broken Next.js boilerplate file icons (`/window.svg`, `/globe.svg`, `/file.svg`) in `CREATOR_AVATARS` with high-craft **Editorial Portrait & Monogram Medallions** (engraved brass-rimmed SVG/canvas editorial badges with publication insignia, role tooltips, and rich forest/amber/burgundy palettes).

---

## 2. File-by-File Implementation Details

### A. `/app/landing/landing.css`
1. **Typography Token & Google Fonts Upgrade**:
   - Update the Google Fonts import at the top of `landing.css` to load `Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600`, `Plus+Jakarta+Sans:wght@400;500;600;700`, and `JetBrains+Mono:wght@500;600;700`.
   - Set `--font-serif: 'Fraunces', Georgia, serif;`, `--font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;`, and `--font-mono: 'JetBrains Mono', monospace;`.
   - Refine `.lp-hero-h1` with `font-variation-settings: 'opsz' 144, 'SOFT' 30;`, `font-weight: 500;`, and tighter `-0.03em` tracking so *"Research. Think. Publish."* commands museum-grade authority.
2. **Open Borderless 3D Stage (`.lp-hero-right-3d .lp-desk-studio`)**:
   - In the Hero context (`.lp-hero-right-3d`), remove the rectangular card border, solid radial box fill, and clipped drop-shadow from `.lp-desk-studio` and `.lp-desk-studio-wrap`.
   - Apply a soft radial atmospheric floor shadow and subtle warm tungsten aura behind the 3D canvas so the floating walnut desk blends organically into both Daytime Parchment (`#F7F4EC`) and Midnight Forest (`#101714`) Hero backdrops.

### B. `/components/3d/FloatingEditorialDesk.tsx`
1. **Frameless Hero Mode & Minimal Studio Pill (`heroFrameless?: boolean` prop)**:
   - Add a `heroFrameless?: boolean` prop (enabled by default in the Hero section).
   - When `heroFrameless` is active:
     - Omit the bulky top-left/top-right dark HUD bars (since the Hero headline's interactive stage readout on the left already displays the active stage and live instrument telemetry).
     - Replace the wide multi-row bottom dock with a sleek, minimal floating studio bar at the bottom of the 3D stage containing compact camera view switches (`Iso` · `Top` · `Macro`) and a single-click `Explode View` toggle, keeping 92%+ of the 3D canvas completely unobstructed.

### C. `/components/ui/avatar-circles.tsx` & `/app/landing/page.tsx`
1. **Bespoke Editorial Medallion Avatars**:
   - Extend `AvatarItem` in `AvatarCircles` to support rich bespoke SVG/monogram editorial medallions (`initials`, `accentColor`, `bgGradient`, `role`, `publication`) or high-craft inline SVG portrait data URLs so it never falls back to generic `/window.svg`, `/globe.svg`, or `/file.svg` icons.
   - Update `CREATOR_AVATARS` in `/app/landing/page.tsx` with 4 distinct editorial creator medallions:
     - **SC** — *Sarah Chen · Head of Editorial, Meridian Press* (Deep Forest & Burnished Gold)
     - **AR** — *Alex Rivera · Managing Tech Editor, Vector Journal* (Oxblood Crimson & Warm Brass)
     - **ER** — *Elena Rostova · Principal SEO Strategist, Archive Labs* (Slate Indigo & Champagne Gold)
     - **MV** — *Marcus Vance · Executive Publisher, Monograph Studio* (Espresso Walnut & 24K Gold)

---

## 3. Verification & Quality Gates
- **Headline & 3D Synchronization**: Verify *"Research. Think. Publish."* remains the exact opening headline, now rendered in `Fraunces` with interactive hover/click stage choreography and the glowing golden ink trail under the 3D fountain pen nib.
- **Frameless 3D Stage Clarity**: Confirm the 3D Editorial Desk floats seamlessly in the Hero without a rectangular card border or heavy HUD covering the desk.
- **Build & Lint Verification**: Run `compile_applet` and `lint_applet` together to guarantee zero TypeScript or ESLint errors.
