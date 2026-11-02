# 3D Gutenberg Cube Spin & Shatter Hero Reveal Plan

Make the landing page Hero entrance a signature spatial experience by removing the `"AI-Powered Editorial Automation · Interactive 3D Studio"` text entirely and replacing the initial load stage with a **3D Gutenberg Type-Block Cube** that spins across its 6 engraved faces, shatters outward in 3D space with golden stardust, and unveils the Hero headline (*"Research. Think. Publish."*) and 3D Editorial Desk from within its core.

## User Review & Critical Decisions

> [!IMPORTANT]
> Summary of choices confirmed for the Hero redesign:

- **Confirmed Decision 1 (3D Cube Spin & 6-Face Shatter Reveal)**: On load, a large 3D Gutenberg Type-Block cube (`168px` in 3D perspective space) spins rapidly at the center of the Hero, builds up golden orbital energy, and shatters outward — its 6 engraved brass and forest-emerald faces (`B` Monogram, Fountain Nib, `§` Silcrow, Optical Loupe, Fluted Brass Seal, and `1450` Base Plate) separate along 3D vectors (`translate3d` + `rotate3d`) with golden stardust particles and a shockwave ring as the Hero stage crystallizes into view.
- **Confirmed Decision 2 (Zero Kicker Clutter)**: Completely remove `"AI-Powered Editorial Automation · Interactive 3D Studio"` from both the intro overlay and the split Hero column so the left column leads directly with the serif headline **"Research. Think. Publish."**
- **Confirmed Decision 3 (Auto-Play + Click Logo to Replay Anytime)**: The 3D cube spin-and-shatter sequence plays automatically on load, and clicking the 3D Gutenberg cube brand logo in the top navigation bar smoothly scrolls to the top and replays the full 3D shatter reveal on demand.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the landing page arrival into a tactile 3D choreography where the signature 6-faced Gutenberg Type-Block cube is the focal anchor that physically breaks open to reveal the editorial studio.
- **Target Audience / Persona**: Writers, content leads, and editorial teams arriving on the landing page.
- **Key Value**: Eliminates generic SaaS kicker text and replaces it with an unforgettable, brand-native 3D reveal tied directly to the Gutenberg Type-Block identity.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Phase 1 — 3D Cube Spin & Charge (`0.0s – 0.95s`)**: The large 6-faced 3D Gutenberg cube materializes at the center of the Hero surrounded by dual counter-rotating golden vernier rings, tumbling smoothly through its engraved emerald and brushed-brass faces.
  2. **Phase 2 — 6-Face 3D Shatter & Shockwave (`0.95s – 1.65s`)**: At peak spin, a golden shockwave ring expands from the core and all 6 faces detach outward in 3D perspective space (`translateZ`, radial `X/Y` trajectories, and 3D tumble angles) accompanied by a burst of 24 golden stardust fragments.
  3. **Phase 3 — Hero Crystallization (`1.35s+`)**: As the 6 shattered brass/emerald plates disperse and dissolve into the periphery, the split Hero stage (*"Research. Think. Publish."* on the left, interactive 3D `FloatingEditorialDesk` on the right) emerges from the center with zero layout jump.
  4. **Replay Anytime**: Clicking the top-left `BlogFlow AI` 3D cube logo in the navbar triggers a replay of the 3D cube spin-and-shatter reveal.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Tactile archival typography meets spatial 3D mechanics.
  - *Color Palette & Mood*: Warm Archival Paper (`#F7F4EC`) and Deep Forest Obsidian (`#0C1511`) canvas, Forest Green (`#163F32`) relief plates, and Brushed Brass (`#C8A15A` / `#E5C98B`) bevels and stardust particles.
  - *Typography & Hierarchy*: Leads immediately with the `Fraunces` display headline (*"Research. Think. Publish."*) with no uppercase kicker above it.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: True 6-Face CSS 3D Matrix Explosion (`preserve-3d`)**
  - *Chosen Approach*: Build a dedicated 3D shattering cube stage where each of the 6 faces is an independent 3D-transformed plate inside a `transform-style: preserve-3d` scene. During the `spin` phase, the 6 faces form a sealed cube; during the `shatter` phase, each face animates along its own outward normal vector and 3D rotation vector while golden shard particles radiate outward.
  - *Why*: Gives authentic 3D depth and physical weight while running at a locked 60fps and respecting `prefers-reduced-motion`.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────┐
│                         LandingPage Root                             │
│   [replayTrigger state] ──► Passed to LandingNavbar & HeroSection    │
└───────────────────┬──────────────────────────────────┬───────────────┘
                    │                                  │
                    ▼                                  ▼
┌───────────────────────────────────┐  ┌───────────────────────────────┐
│           LandingNavbar           │  │          HeroSection          │
│ • Clicking 3D Cube Logo scrolls   │  │ • Phase 1: 'spin' (0–0.95s)   │
│   to top & increments             │  │ • Phase 2: 'shatter' (0.95–   │
│   replayTrigger                   │  │   1.65s) — 6 faces explode    │
│                                   │  │   outward + stardust shards   │
│                                   │  │ • Phase 3: 'split' — Headline │
│                                   │  │   (no kicker) + 3D Desk       │
└───────────────────────────────────┘  └───────────────────────────────┘
```

- **Interactive Component & State Mapping**:
  - `HeroStage`: `'spin' | 'shatter' | 'split'`
  - Clicking the navbar brand logo or pressing the subtle replay button resets `HeroStage` to `'spin'`, sequences `'shatter'` at `950ms`, and settles into `'split'` at `1650ms`.
