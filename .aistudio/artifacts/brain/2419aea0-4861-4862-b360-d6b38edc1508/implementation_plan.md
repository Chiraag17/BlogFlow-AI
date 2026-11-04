# 3D Astrolabe & Volumetric Nebula Login Background

Elevate the login and signup portal background by layering a **3D Orbital Brass Astrolabe** around the Gutenberg Cube, **Volumetric Gold & Emerald Nebula Clouds** with diagonal god-rays, and **Keystroke Shockwave Ripples** on top of the existing 60fps 3D starfield and post-login warp transition.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user-confirmed choices govern this background upgrade:

- **Confirmed Decision 1 (3D Background Centerpiece)**: **3D Orbital Brass Astrolabe Rings around the Cube** — Multi-axis tilted 3D brass gyroscope rings (`rotateX`, `rotateY`, `rotateZ` in `preserve-3d` space) with degree ticks, orbital nodes, and engraved SVG markings that react to cursor parallax, input field focus, and warp lock.
- **Confirmed Decision 2 (Interactive Lighting & Reactive Effects)**:
  1. **Volumetric Gold & Emerald Nebula Clouds**: Animated multi-layer volumetric nebula plumes (`#C8A15A` antique brass, `#E5C98B` champagne gold, and `#163F32` forest emerald) paired with soft diagonal light beams radiating from behind the 3D Cube stage.
  2. **Keystroke Shockwave Ripples**: Every keystroke emits an expanding 3D perspective shockwave ring across the background canvas from the active input and around the 3D Cube, gently displacing nearby stardust particles as the wave passes.
- **Confirmed Decision 3 (Integration with Existing Starfield & Warp)**: **Layered on top of existing 3D starfield and warp jump** — Preserves the 260-star 3D cosmos, keystroke energy comet trails, and post-login starfield warp jump while syncing the astrolabe rings to lock and accelerate during warp.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the authentication backdrop into a living, celestial mechanical observatory. Behind the form and around the 3D Gutenberg Cube, concentric 3D brass astrolabe rings rotate on tilted axes inside swirling gold-and-emerald volumetric nebula clouds, while typing sends luminous golden shockwaves rippling across the cosmos.
- **Target Audience / Persona**: Writers, editors, and publishing teams signing into their studio.
- **Key Value**: Creates an unforgettable, tactile first impression where every cursor movement, field focus, and keystroke visibly energizes the 3D environment.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Ambient Cosmic Observatory**:
     - Swirling **Volumetric Gold & Emerald Nebula Clouds** breathe slowly in the deep background (`#050B09` in dark mode, `#F5F2E8` in light mode) with subtle diagonal volumetric light rays behind the left 3D stage.
     - Around the 3D Gutenberg Cube, a **Large-Scale 3D Brass Astrolabe** (spanning `520px × 520px` in the background plane plus inner gyroscope rings) orbits on three intersecting 3D planes (`rotateX(62deg)`, `rotateY(-38deg)`, `rotateZ`) with SVG degree ticks, cardinal markers, and glowing brass satellites.
  2. **Field Focus & Typing Reactivity**:
     - Focusing `Email`, `Password`, or `OTP` smoothly shifts the tilt angles of the 3D Astrolabe rings into distinct geometric alignments.
     - Each keystroke triggers a **Background Shockwave Ripple** in the 60fps canvas—an expanding golden elliptical wave that radiates across the viewport and pushes nearby 3D stars outward with a brief luminous flare.
  3. **Post-Login Warp Climax**:
     - When login or signup succeeds, the 3D Astrolabe rings snap into concentric alignment around the centering Cube, spin up to high speed, and fire a multi-ring golden shockwave burst as the 3D starfield accelerates into warp streaks.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hybrid CSS `preserve-3d` SVG Astrolabe + 60fps Canvas Shockwaves**
  - *Chosen Approach*: Render the tilted 3D Astrolabe rings with crisp SVG degree markings inside Framer Motion `preserve-3d` planes (synced to `stageRotateX`/`stageRotateY` and `focusedField`), while rendering the expanding keystroke shockwaves and star displacement directly inside the existing 60fps `<canvas>` loop.
  - *Why*: SVG rings stay razor-sharp at any scale and tilt angle in 3D CSS space, while canvas shockwaves can directly interact with the 260 3D star coordinates at zero extra DOM cost.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MorphingAuthPortal Background                       │
├─────────────────────────────────────────────────────────────────────────┤
│  ├─ Layer 1A: Volumetric Gold & Emerald Nebula Clouds + God-Ray Beams   │
│  ├─ Layer 1B: 60fps 3D Canvas                                           │
│  │    ├─ 260 3D Stars (react to Shockwave Ripples + Warp Streaks)       │
│  │    ├─ Keystroke Shockwave Ripples (expanding golden radial waves)    │
│  │    └─ Keystroke Energy Comet Particles & Cube Absorption Rings       │
│  └─ Layer 1C: 3D Orbital Brass Astrolabe (preserve-3d gyroscope rings)  │
│       ├─ Equatorial Degree Ring (SVG ticks + cardinal brass nodes)      │
│       ├─ Tilted Meridian Ring (rotateX 64deg, rotateY -28deg)           │
│       └─ Ecliptic Gyroscope Ring (reacts to focusedField & isWarping)   │
└─────────────────────────────────────────────────────────────────────────┘
```
- **Interactive Component & State Mapping**:
  - `shockwavesRef`: Array of active `BackgroundShockwave` objects (`{ x, y, radius, maxRadius, alpha, color, speed }`) spawned inside `pulseCube()` on every keystroke and mode switch, and in a triple burst inside `triggerWarpToStudio()`.
  - Star-wave interaction: In the 60fps canvas loop, stars near an active shockwave wavefront (`|dist - wave.radius| < 36`) receive a subtle radial push and brightness boost.
  - 3D Astrolabe rings respond dynamically to `focusedField` (`name` | `email` | `password` | `otp`), `completionPct`, and `isWarping`.
