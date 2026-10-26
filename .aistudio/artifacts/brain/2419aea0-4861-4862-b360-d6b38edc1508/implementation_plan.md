# Apple-Caliber Scroll & Spatial Transitions for Landing Page

This plan introduces four interconnected, GPU-accelerated scroll-scrubbed transitions across the BlogFlow AI landing page—combining Framer Motion `useScroll`, `useSpring`, and `useTransform` choreography so every section handoff feels like an Apple Pro keynote reveal while remaining fast, native-scrolling, and responsive to direct cursor/click overrides.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following transition mechanics and performance boundaries were confirmed in our planning interview:

- **Confirmed Decision 1 (4 Bespoke Spatial Transitions)**:
  1. **Hero-to-Product 3D Manuscript Dive & Unfold**: Scrolling out of `#hero` smoothly pitches and zooms the Hero stage in 3D space (`rotateX`, `scale`, `y`) while unfolding the `#product` Galley Proof card from a tilted 3D manuscript plane (`rotateX(24deg) scale(0.90)` → `rotateX(0deg) scale(1)`).
  2. **Scroll-Driven Automated X-Ray Loupe Sweep**: Scrolling through `#product` automatically glides the **2.4× Brass Optical Loupe** along a calibrated S-curve across the Galley Proof—revealing primary citations and SEO telemetry hands-free—while immediately handing control over to the user's cursor on hover or locking on click.
  3. **Architectural Aperture Scale & Midnight Studio Shift**: `#workflow` and `#features` expand through a precision camera-aperture frame (`scale: 0.92 → 1.0`, `borderRadius: 36px → 16px`), with `#features` shifting the atmosphere into a high-contrast **Midnight Forest Studio Vault** (`#0D1B15` with brushed-brass rim lighting) before returning to warm archival vellum.
  4. **Optical Camera Rack-Focus & Specular Brass Light Sweep**: Section transitions apply a subtle optical depth-of-field rack-focus (`blur(5px) → blur(0px)`) and sweep a diagonal brushed-brass specular light beam across card bevels and display headings in sync with scroll progress.
- **Confirmed Decision 2 (Interaction Model)**: Continuous scroll-position scrubbing (`useScroll` + spring damping) paired with instant hover and click overrides.
- **Confirmed Decision 3 (Performance Budget)**: Lightweight GPU-composited transforms (`transform`, `opacity`, `clip-path`, subtle `filter`) with zero scroll-jacking traps and automatic `prefers-reduced-motion` fallback.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces static vertical section stacking with a continuous optical and spatial camera journey through the BlogFlow AI studio:
  - **Act I (`#hero` → `#product`)**: The camera recedes from the Hero headline and dives toward the 3D Editorial Desk, unfolding the live Galley Proof sheet into a flat, inspectable surface.
  - **Act II (`#product`)**: As the visitor scrolls past the Galley Proof, the Brass Optical Loupe autonomously scans across the article paragraphs along an S-curve, exposing the underlying verified sources (`MIT Technology Review`, `Stanford HAI`, `NIST`) even on touch devices or without mouse movement. Hovering immediately enslaves the loupe to the pointer; clicking locks the full X-Ray blueprint.
  - **Act III (`#workflow` → `#features`)**: Each major chapter opens like a precision optical aperture, culminating in the **Midnight Forest Studio** shift for `#features` where brushed-brass specular beams sweep across the capability cards as you scroll.
- **Target Audience / Persona**: Visitors who expect flagship Apple-grade polish, fluid physics, and tactile visual storytelling without sluggish heavy video embeds.
- **Key Value**: Elevates the landing page into an interactive product film driven entirely by the user's natural scroll wheel and cursor.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Hero Exit & Product Unfold**: Between `0%` and `100%` of the Hero-to-Product transition zone, the Hero container scales gently (`1 → 0.95`) with a subtle optical rack-out while the `#product` Galley Proof card unfolds from a `22°` 3D tilt into a crisp, flat editorial spread.
  2. **Autonomous + Interactive X-Ray Loupe**: When the user is not hovering over the Galley Proof card, the loupe coordinates `(x, y)` are driven by a smooth parametric curve mapped to `#product` scroll progress (`0.15 → 0.85`), accompanied by a subtle `SCROLL-SCRUBBING X-RAY · HOVER TO TAKE CONTROL` indicator. Moving the mouse onto the proof card instantaneously switches to 1:1 cursor tracking.
  3. **Midnight Studio Aperture (`#features`)**: As `#features` enters the viewport, its outer architectural vault container expands from `scale(0.92)` with `36px` rounded corners into a full-bleed dark-emerald studio showcase (`#0D1B15`), while a diagonal brushed-brass specular glint sweeps across the bento cards.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Apple Pro Hardware Keynote meets High-Craft Archival Editorial Studio.
  - *Color Palette & Mood*: Alternates rhythmically between Warm Archival Paper (`#F7F4EC`) and Deep Midnight Forest Studio (`#0D1B15`), unified by Brushed Brass (`#C8A15A`) specular highlights.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Parametric Scroll-Scrubbed Loupe + Instant Pointer Takeover**
  - *Chosen Approach*: Compute scroll-driven loupe coordinates `(scrollLoupeX, scrollLoupeY)` from the `#product` section's scroll progress whenever `!loupeState.active && !xrayPinned`. The moment `onMouseMove` fires, `loupeState.active` becomes `true` and overrides the scroll path with exact cursor coordinates.
  - *Why*: Many visitors scroll down a landing page without deliberately hovering over every card; autonomous scroll-scrubbing guarantees 100% of visitors witness the X-Ray citation reveal while preserving full manual control.
- **Decision 2: Native Scroll with Spring-Damped `useScroll` Transforms (Zero Scroll-Jacking)**
  - *Chosen Approach*: Use Framer Motion's `useScroll({ target, offset })` and `useSpring(..., { stiffness: 120, damping: 24 })` on section wrappers rather than hijacking `window.onwheel`.
  - *Why*: Preserves native trackpad momentum, scrollbar dragging, and anchor-link jumps (`#product`, `#workflow`, `#features`) with zero lag.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                Apple-Caliber Scroll & Spatial Choreography              │
├─────────────────────────────────────────────────────────────────────────┤
│  1. HeroSection (#hero)                                                 │
│     • useScroll(heroRef) -> Hero receding scale (1 -> 0.94),            │
│       perspective rotateX (0° -> 8°), & optical rack-focus blur         │
├─────────────────────────────────────────────────────────────────────────┤
│  2. ProductXRaySection (#product)                                       │
│     • 3D Manuscript Unfold: rotateX(22° -> 0°), scale(0.9 -> 1.0),      │
│       blur(5px -> 0px) + Specular Brass Glint Sweep                     │
│     • Autonomous Scroll-Scrubbed Loupe S-Curve (when !hover && !pinned) │
│     • Instant Cursor Override onPointerMove + Click-to-Lock Toggle      │
├─────────────────────────────────────────────────────────────────────────┤
│  3. WorkflowSection (#workflow)                                         │
│     • Optical Rack-Focus Entrance + Scroll-Linked Brass Progress Beam   │
│     • Interactive 5-Stage Agent Pipeline + Click Override               │
├─────────────────────────────────────────────────────────────────────────┤
│  4. FeatureSection (#features — Architectural Aperture & Studio Shift)  │
│     • Aperture Expansion: scale(0.92 -> 1.0), radius(36px -> 20px)      │
│     • Chromatic Shift into Midnight Forest Vault (#0D1B15)              │
│     • Scroll-Scrubbed Specular Brass Rim Sweep across Bento Cards       │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Interactive Component & State Mapping**:
  - `HeroSection`: Uses `heroRef` with `useScroll({ target: heroRef, offset: ['start start', 'end start'] })` to drive receding 3D perspective and rack-focus as the user scrolls toward `#product`.
  - `ProductXRaySection`: Uses `productRef` with `useScroll({ target: productRef, offset: ['start end', 'end start'] })` to:
    1. Unfold the 3D Galley Proof card (`rotateX`, `scale`, `y`, `filter`).
    2. Drive `autoLoupePos` (`{ x, y, active }`) along a smooth sinusoidal path across the proof card during the central scroll window (`scrollYProgress` `0.22` → `0.78`), automatically yielding to `loupeState` when hovered or `xrayPinned` when locked.
  - `WorkflowSection` & `FeatureSection`: Use section-scoped `useScroll` hooks to drive the **Architectural Aperture** container (`scale`, `borderRadius`), **Optical Rack-Focus**, and **Specular Brass Light Sweep** (`--brass-sweep-pos` / motion overlay).
