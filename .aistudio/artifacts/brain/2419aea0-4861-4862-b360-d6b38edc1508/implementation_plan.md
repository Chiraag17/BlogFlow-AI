# Volumetric Atelier Light Beams & 3D Gold Dust Dashboard Atmosphere

Transform the Dashboard backdrop into a living **Volumetric Atelier** featuring diagonal museum-grade golden light beams ("god-rays"), a **60fps 3D Gold Dust Mote & Reactive Ripple Canvas** that responds to prompt keystrokes, 3D Coverflow card flips, and **Approve / Publish** stamps, and **subtle frosted glass cards** (`backdrop-blur-md`) so the warm 3D atmosphere glows softly through the workspace.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user-confirmed choices govern this dashboard background upgrade:

- **Confirmed Decision 1 (3D Background Atmosphere)**: **Volumetric Atelier Light Beams with Floating 3D Gold Dust Motes** — Diagonal volumetric golden and emerald light shafts slant across the workspace while 3D depth-of-field brass dust motes drift through the illuminated beams.
- **Confirmed Decision 2 (Reactive Workspace Events)**:
  1. **Approve / Publish Stamp Ripple Waves**: Clicking **Approve** or **Publish** (or dispatching a brief) emits a multi-ring golden shockwave across the background canvas that accelerates and brightens nearby 3D gold dust motes.
  2. **3D Coverflow Flip Energy Pulse**: Flipping or swiping between manuscripts in the 3D Coverflow carousel sends a horizontal kinetic wave and directional breeze through the floating 3D dust motes.
  3. **Prompt Bar Keystroke Ripples**: Typing in the command prompt bar emits soft champagne-gold ripple rings from the top command stage.
- **Confirmed Decision 3 (Surface Materiality)**: **Subtle Frosted Glass Cards (`backdrop-blur-md`)** — Dashboard containers (Command Stage, 3D Metric Monoliths, 3D Coverflow Stage, and Telemetry Charts) use translucent frosted glass surfaces with delicate brass-tinted borders so the volumetric light shafts and drifting 3D gold dust glow through without sacrificing tabular numeral contrast.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces the flat dashboard background with a multi-layered 3D Atelier environment (`DashboardAtelierBackdrop3D`). Warm volumetric light shafts shine diagonally from the top-left studio canopy across a 60fps 3D canvas of floating gold dust motes, while user actions inside the dashboard send visible energy ripples through the space.
- **Target Audience / Persona**: Editorial directors and creators working inside the studio who want tactile, atmospheric depth that responds to their publishing workflow.
- **Key Value**: Unifies the 3D Gutenberg Cube, 3D Editorial Orrery, 3D Metric Monoliths, and 3D Coverflow Carousel inside a cohesive, luminous 3D room.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Ambient Volumetric Atelier**:
     - Three layered diagonal light shafts (`-28deg` to `-22deg`) in warm antique brass (`#C8A15A`), champagne gold (`#E5C98B`), and forest emerald (`#163F32`) breathe slowly across the viewport.
     - Inside the light shafts, **110 3D Gold Dust Motes** float at varying Z-depths (`z` from `0.15` to `1.0`). Foreground motes render with soft bokeh halos while mid-plane motes shimmer as they pass through the diagonal light beams.
  2. **Action-Driven Reactive Ripples**:
     - **Keystroke Ripple (`typingPulse`)**: Typing in the prompt bar spawns a soft golden ripple wave (`#E5C98B`) radiating from the upper command stage.
     - **3D Coverflow Flip Pulse (`coverflowIndex`)**: Navigating Previous/Next or swiping the 3D Coverflow carousel triggers a central emerald-brass energy ring (`#52B788` / `#C8A15A`) and imparts a smooth horizontal momentum impulse to all 3D dust motes.
     - **Approve / Publish Stamp Shockwave (`stampPulse`)**: Stamping **Approve** or **Publish** fires a double concentric antique-brass shockwave across the entire dashboard that displaces and illuminates dust motes along the wavefront.
  3. **Subtle Frosted Glass Surfaces**:
     - All dashboard cards use translucent glass styling (`bg-[var(--color-surface)]/72 dark:bg-[#0D1A14]/68 backdrop-blur-xl border-[#C8A15A]/20`) so the moving volumetric beams and golden dust motes remain subtly visible behind every card while keeping WCAG AA contrast on all text and numbers.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Fixed Full-Viewport 3D Canvas (`pointer-events-none fixed inset-0 z-0`) Behind Elevated Frosted Content (`relative z-10`)**
  - *Chosen Approach*: Mount the volumetric light shafts and 60fps 3D dust/ripple canvas as a fixed background layer inside the dashboard view, driven directly by existing dashboard state (`typingPulse`, `stampPulse`, `coverflowIndex`, and `isDark`).
  - *Why*: Guarantees zero interference with clicks, drags, or scroll performance while allowing ripples to react instantaneously to every dashboard interaction.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌──────────────────────────────────────────────────────────────────────────┐
│                        DashboardPage (relative)                          │
├──────────────────────────────────────────────────────────────────────────┤
│  ├─ Layer 0: DashboardAtelierBackdrop3D (fixed inset-0 z-0)              │
│  │    ├─ Volumetric Atelier Light Beams (3 animated diagonal shafts)     │
│  │    └─ 60fps 3D Canvas                                                 │
│  │         ├─ 110 3D Gold Dust Motes (depth-of-field bokeh + beam glow)  │
│  │         ├─ Keystroke Ripples (triggered by typingPulse)               │
│  │         ├─ Coverflow Flip Pulse & Breeze (triggered by coverflowIndex)│
│  │         └─ Stamp Shockwave Burst (triggered by stampPulse)            │
│  └─ Layer 1: Frosted Glass Workspace (relative z-10, backdrop-blur-xl)   │
│       ├─ Clean 3D Command Stage + 3D Editorial Orrery                    │
│       ├─ 4x 3D Parallax Metric Monoliths (frosted glass chassis)         │
│       ├─ 3D Coverflow Manuscript Carousel (frosted glass stage)          │
│       └─ Output & Cadence Telemetry Charts (frosted glass cards)         │
└──────────────────────────────────────────────────────────────────────────┘
```
- **Interactive Component & State Mapping**:
  - `typingPulse` increments when typing in the prompt bar -> spawns a `keystroke` ripple at `(width * 0.38, height * 0.24)`.
  - `coverflowIndex` changes when flipping/swiping 3D Coverflow cards -> spawns a `coverflow` energy pulse at `(width * 0.52, height * 0.58)` and adds horizontal drift velocity to the 3D dust motes.
  - `stampPulse` increments on **Approve**, **Publish**, or **Draft** dispatch -> spawns a multi-ring `stamp` shockwave burst that radially pushes and brightens 3D gold dust motes.
