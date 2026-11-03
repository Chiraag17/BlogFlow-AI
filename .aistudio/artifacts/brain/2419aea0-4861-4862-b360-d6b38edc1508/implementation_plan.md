# 3D Parallax Metric Monoliths Enhancement

Upgrade the 4 Dashboard Metric Monolith cards (`Articles`, `Review`, `Published`, `Sites`) with a multi-layer 3D parallax hover effect featuring independent Z-depth translation, counter-moving foreground/background planes, and dynamic brass specular glare with edge rim lighting.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following interactive 3D parallax decisions have been confirmed and govern the implementation:

- **Confirmed Decision 1 (3D Parallax Style)**: **Multi-layer depth shift with counter-moving elements** — As the cursor moves across each monolith, the outer card tilts in 3D space (`perspective(1000px) rotateX / rotateY`) while inner layers translate along the X, Y, and Z axes at distinct parallax multipliers, creating genuine stereographic depth.
- **Confirmed Decision 2 (Visual Depth Enhancements)**: **Dynamic brass specular glare & edge rim glow + Independent Z-depth parallax on ring and number** — A cursor-tracked radial specular sheen and directional rim border light up the card edges, while the tabular number, 1-word label, SVG radial ring, and center icon float at separate Z-depths (`translate3d`).

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the 4 Metric Monoliths on the dashboard into tactile, multi-plane 3D instruments. Moving the pointer across a monolith tilts the chassis while shifting the background shadow plane in the opposite direction (counter-parallax) and elevating the tabular counter and radial progress gauge at independent Z-depths.
- **Target Audience / Persona**: Editorial directors and content operators monitoring pipeline health who want responsive, physical spatial feedback without visual clutter.
- **Key Value**: Enhances spatial depth and interactivity while preserving the clean, 1-word typographic discipline and tabular numeral legibility of the dashboard.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Idle State**: Each monolith rests cleanly on the surface grid with a 1-word uppercase label, monospace tabular figure (`tabular-nums`), and animated SVG radial progress ring.
  2. **Pointer Enter & Move (Multi-Layer Parallax)**:
     - **Outer Chassis**: Smoothly tilts up to `±14deg` on the X/Y axes and lifts `translateZ(10px)` with an elevated ambient drop shadow that shifts opposite to the tilt angle.
     - **Counter-Moving Depth Plane**: A subtle recessed ambient glow layer shifts in the opposite X/Y direction (`-dx * 10px, -dy * 10px, translateZ(-12px)`) to amplify stereo separation.
     - **Independent Z-Depth Foreground Elements**:
       - **1-Word Label**: Floats at `translateZ(20px)` with slight forward XY shift (`dx * 4px, dy * 4px`).
       - **Tabular Metric Value**: Floats higher at `translateZ(36px)` with stronger XY parallax (`dx * 8px, dy * 8px`) and subtle brass text-shadow depth on hover.
       - **SVG Radial Ring**: Floats at `translateZ(28px)` with independent XY drift (`dx * 6px, dy * 6px`).
       - **Center Icon**: Floats at the highest focal plane (`translateZ(44px)`) with `dx * 10px, dy * 10px` displacement so it visibly hovers inside the ring as you tilt the card.
     - **Brass Specular Glare & Edge Rim Glow**: A dual-layer radial gradient follows the normalized cursor coordinates (`gx%`, `gy%`) across both the card surface and a `1px` perimeter rim mask, casting a warm antique-brass (`#C8A15A`) and accent-colored edge reflection near the cursor.
  3. **Pointer Leave (Spring Reset)**: Releasing or leaving the card smoothly interpolates all rotation, translation, and glare states back to neutral (`0deg`, `0px`) using an exponential ease-out curve (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Visual Identity & Theme**:
  - *Color Palette & Mood*: Warm editorial obsidian/ivory surface tokens paired with `#C8A15A` brass specular highlights and each monolith's semantic accent color (`#C8A15A`, `#D97706`, `#16A34A`, `#2563EB`).
  - *Typography & Hierarchy*: `font-mono tabular-nums` for zero-jitter counters paired with crisp uppercase tracking for the 1-word labels.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Normalized Pointer Delta (`dx`, `dy` in `[-0.5, 0.5]`) Driving Multi-Plane `translate3d`**
  - *Chosen Approach*: Compute normalized pointer offsets `dx = px - 0.5` and `dy = py - 0.5` from `getBoundingClientRect()` and drive each child layer via GPU-accelerated `translate3d(x, y, z)` transforms inside a `transform-style: preserve-3d` container.
  - *Why*: Pure CSS 3D matrix transforms run on the compositor thread at 60fps without triggering layout recalculation or text blurring.
  - *Alternatives Considered*: Heavy WebGL canvases per KPI card (excessive WebGL context overhead alongside the main 3D Editorial Orrery).
- **Decision 2: Counter-Moving Backdrop + Directional Rim Mask**
  - *Chosen Approach*: Pair a counter-translating inner glow (`-dx`, `-dy`) with a cursor-positioned radial rim highlight along the card border.
  - *Why*: Counter-motion between the recessed plane and the elevated foreground elements creates an unmistakable parallax depth illusion even with small cursor movements.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌───────────────────────────────────────────────────────────────────────┐
│                    MetricMonolith3D (preserve-3d)                     │
│  perspective(1000px) rotateX(rx) rotateY(ry) translateZ(10px)         │
├───────────────────────────────────────────────────────────────────────┤
│  ├─ Layer 0: Counter-Moving Recessed Glow (translateZ(-12px), -dx/-dy)│
│  ├─ Layer 1: Dynamic Brass Specular Glare & Perimeter Rim Light       │
│  ├─ Layer 2: 1-Word Label (translate3d(dx*4, dy*4, 20px))             │
│  ├─ Layer 3: Tabular Metric Number (translate3d(dx*8, dy*8, 36px))    │
│  ├─ Layer 4: Radial SVG Ring Gauge (translate3d(dx*6, dy*6, 28px))    │
│  └─ Layer 5: Floating Center Icon (translate3d(dx*10, dy*10, 44px))   │
└───────────────────────────────────────────────────────────────────────┘
```
- **Interactive Component & State Mapping**:
  - `tilt` state tracks `{ rx, ry, dx, dy, gx, gy, hovered }`.
  - `onPointerMove` updates normalized cursor coordinates `(px, py)` and derives rotation (`rx`, `ry`), directional parallax deltas (`dx`, `dy`), and glare percentages (`gx`, `gy`).
  - `onPointerLeave` resets all axes to `0` and `hovered: false`, activating a `450ms cubic-bezier(0.16, 1, 0.3, 1)` return transition across all child planes.
  - Existing click filtering (`Articles`, `Review`, `Published`) and navigation (`Sites` -> `/websites`) remain fully intact.
