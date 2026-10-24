# 3D Gutenberg Movable-Type Brass Block Logo & Spatial Animations

This plan introduces a bespoke **3D Gutenberg Movable-Type Brass Block Logo** and reactive 3D mechanical animations across BlogFlow AI, replacing flat 2D icons with a physical cast-brass and deep-forest letterpress type-block that responds to hover, click, scroll velocity, and route transitions.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design and interaction choices were confirmed during our planning interview and govern the implementation:

- **Confirmed Decision 1 (3D Logo Concept)**: **3D Gutenberg Movable-Type Brass Block (`B·F` Letterpress Cube)** — a true 6-faced 3D cast-brass and deep-forest enamel movable-type block with raised relief glyphs on its faces (`B` serif monogram on the front, Fountain Nib on the right, Optical Loupe on the top, Wax Seal on the left, and Editorial Section Mark `§` on the back).
- **Confirmed Decision 2 (Placement & Integration)**: Integrated across the **Landing Page Navbar**, the **App Sidebar Header** (expanding and collapsing gracefully with the sidebar), and the **Login & Signup 3D Press Pass Crest**.
- **Confirmed Decision 3 (Interactive Choreography)**: Reactive to **hover, click, scroll velocity, and route transitions**, including a mechanical `90°` face-indexing tumble, a downward letterpress ink-stamping plunge (`translateZ`), and a live brass specular sheen.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces static brand icons with a tactile, six-sided 3D movable-type printing block crafted in CSS `preserve-3d` and SVG relief plates. Each face of the 3D cube represents a pillar of the BlogFlow AI editorial pipeline:
  - **Front Face (`0°`)**: Raised Brushed-Brass `B` Editorial Serif Monogram with alignment nicks (the signature notch on physical Gutenberg metal type).
  - **Right Face (`90° Y`)**: Engraved Fountain Pen Nib (`Drafting & Synthesis`).
  - **Back Face (`180° Y`)**: Typographic Section Sign `§` (`Semantic Structure`).
  - **Left Face (`-90° Y`)**: Calibration Optical Loupe (`Citation Research`).
  - **Top Face (`90° X`)**: Fluted Brass Approval Seal (`Editorial Sign-Off`).
  - **Bottom Face (`-90° X`)**: Machined Cast-Iron Foundry Base with serial stamp.
- **Target Audience / Persona**: Editorial directors, technical writers, and SaaS founders who appreciate tactile archival craftsmanship and Swiss-watch mechanical responsiveness.
- **Key Value**: Gives BlogFlow AI an unmistakable, memorable spatial brand signature that physically embodies the transition from classical movable-type craftsmanship to autonomous AI publishing.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Landing Navbar Masthead**: As the visitor scrolls down the page, the 3D Gutenberg Type-Block subtly pitches and indexes its faces proportional to scroll velocity, while hovering tilts the cube toward the cursor and reveals a miniature brass foundry tooltip (`INDEX FACE · CLICK TO STAMP`). Clicking triggers a crisp 3D letterpress downward stamp (`translateZ(-8px)`) with an expanding brass ink-ring ripple.
  2. **App Sidebar Header (`/dashboard`, `/generator`, `/research`, etc.)**: Navigating between routes automatically rotates the 3D Type-Block to the face matching the active workspace mode (e.g., Loupe face on *Research*, Nib face on *Generator*, Seal face on *Approval Center*, and `B` Monogram on *Overview*). Clicking the logo or collapsing the sidebar smoothly animates the 3D cube and its adjacent foundry wordmark.
  3. **Login & Signup 3D Press Pass Crest**: Embeds the 3D Gutenberg Type-Block into the top crest of the 3D Editorial Press Pass so typing in form fields or flipping the pass to the password vault causes the 3D type-block to rotate and lock into its cryptographic seal face.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Tactile Gutenberg Foundry meets High-Craft Editorial Studio.
  - *Color Palette & Mood*: Deep Forest Lacquer (`#163F32`), Brushed Brass (`#C8A15A`), Polished Gold Specular Highlights (`#E5C98B`), Warm Archival Paper (`#F7F4EC`), and Cast-Iron Shadow (`#0D1612`).
  - *Typography & Hierarchy*: High-contrast editorial serif (`Fraunces` / `Playfair Display`) for the raised relief `B` and `§` glyphs paired with monospaced foundry registration marks (`JetBrains Mono`, `tabular-nums`).
- **Interactive Feedback & Motion**:
  - Spring-damped 3D gimbal rotation (`rotateX`, `rotateY`, `rotateZ`, `translateZ`) using compositor-friendly transforms.
  - Respects `prefers-reduced-motion` by providing instant face switching without rapid spinning.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: True 6-Faced CSS 3D Volumetric Geometry (`preserve-3d`) vs. Heavy WebGL Canvas per Icon**
  - *Chosen Approach*: Build the reusable 3D Gutenberg Movable-Type Block using hardware-accelerated CSS 3D volumetric planes (`transform-style: preserve-3d`), recessed bevel layers, and precision SVG relief plates.
  - *Why*: Since the logo appears simultaneously in persistent chrome (Navbar, Sidebar, and inside the 3D Press Pass), CSS `preserve-3d` delivers zero-latency instant rendering on page load, razor-sharp vector typography at any DPI, and zero WebGL context-limit conflicts with the existing Three.js 3D Desk on the landing page.
  - *Alternatives Considered*: Spawning multiple `<Canvas>` instances for small navbar/sidebar logos would add unnecessary GPU memory overhead and WebGL context pressure.
- **Decision 2: Route-Aware & Scroll-Velocity Reactive Choreography**
  - *Chosen Approach*: Connect the 3D Type-Block to both scroll velocity (on the landing page) and Next.js `usePathname()` (in the dashboard sidebar) plus direct pointer hover/click stamping.
  - *Why*: Ensures the 3D animation feels purposefully wired to the user's workflow rather than a disconnected looping gimmick.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│             GutenbergTypeBlock3D (Reusable 3D Brand Emblem)             │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  6-Faced preserve-3d Cube + Recessed Brass Relief & Ink Ripple    │  │
│  │  • Front (0°):   Raised 'B' Serif Relief + Gutenberg Type Nick    │  │
│  │  • Right (90°):  Engraved Fountain Pen Nib (Draft / Generator)    │  │
│  │  • Back (180°):  Section Sign '§' (Content / Architecture)        │  │
│  │  • Left (-90°):  Brass Optical Loupe (Research & Citations)       │  │
│  │  • Top (+90°X):  Editorial Approval Seal (Approvals / Security)   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└───────────────┬─────────────────────────┬───────────────────────────────┘
                │                         │
   ┌────────────▼────────────┐ ┌──────────▼─────────────┐ ┌───────────────▼──────────────┐
   │  LandingNavbar Masthead │ │   App Sidebar Header   │ │  EditorialPressPass3D Crest  │
   │  • Scroll-velocity tilt │ │  • Route-synced face   │ │  • Synced with keystrokes &  │
   │  • Hover 3D gimbal      │ │    indexing on nav     │ │    password vault 180° flip  │
   │  • Click ink-stamp      │ │  • Collapsed state     │ │  • Clearance seal lock       │
   └─────────────────────────┘ └────────────────────────┘ └──────────────────────────────┘
```

- **Interactive Component & State Mapping**:
  - `faceIndex` (`'monogram' | 'nib' | 'section' | 'loupe' | 'seal'`): Maps to target `(rotateX, rotateY)` angles in 3D space.
  - `scrollVelocity` (Landing Navbar): Applies dynamic pitch/yaw offset as the user scrolls and settles smoothly back to the active section face.
  - `isStamping` (Click handler): Animates `translateZ(-7px) scale(0.94)` followed by a spring rebound and a radial brass ink-impression ring.
  - `pathname` (App Sidebar): Automatically indexes the 3D block to `'loupe'` on `/research`, `'nib'` on `/generator`, `'seal'` on `/approvals`, `'section'` on `/content`, and `'monogram'` on `/dashboard`.
