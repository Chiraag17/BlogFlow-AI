# 3-Act "Director's Cut" Cinematic Hero Experience

Transform the existing Landing Page Hero section (*3D Shattering Gutenberg Cube → "Research. Think. Publish." + 3D Floating Editorial Desk*) into a **3-Act "Director's Cut" Cinema Sequence** with retracting widescreen cinema letterbox bars, a bullet-time 6-face shatter with anamorphic golden lens flare and dual shockwave rings, a **3D Cursor-Tilted Camera Rig** across the entire Hero stage, and a subtle **Replay Cinema** control.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user-confirmed choices and recommended pacing defaults govern this cinematic Hero upgrade:

- **Confirmed Decision 1 (Primary Cinematic Upgrade)**: **3-Act Director's Cut with Bullet-Time Shatter & Lens Flare**
  - **Act I — Ignition (`0ms – 950ms`)**: Widescreen 2.39:1 cinema letterbox bars frame the dark/ivory stage as three orbital brass gyroscope rings lock around the spinning 6-faced 3D Gutenberg Cube and an anamorphic horizontal gold lens streak sweeps across the viewport.
  - **Act II — Bullet-Time Shatter (`950ms – 1850ms`)**: At the moment of fracture, the 6 engraved cube faces and 32 golden shards burst outward in a "bullet-time" deceleration curve (`cubic-bezier(0.08, 0.92, 0.18, 1)`) while a dual concentric brass shockwave and horizontal anamorphic lens flare flash across the center of the frame.
  - **Act III — Camera Dolly Reveal (`1850ms+`)**: The top and bottom widescreen cinema letterbox bars smoothly retract (`height: 0`) as the camera dollies forward (`scale: 1.08 -> 1`, `translateZ`) into *"Research. Think. Publish."* and the interactive **3D Floating Editorial Desk**.
- **Confirmed Decision 2 (Cinematic Visual Effects)**:
  1. **Retracting Widescreen Cinema Letterbox Bars**: Top and bottom matte obsidian cinema bars (`11vh` height) with subtle brass hairline inner borders frame Acts I & II, then glide open on Act III reveal.
  2. **Anamorphic Golden Lens Flare & Shockwave Burst**: A screen-wide horizontal anamorphic streak (`#FFFDF7` core with `#E5C98B` and `#C8A15A` wings) + dual expanding shockwave rings + radial volumetric god-rays ignite when the 3D Cube shatters.
  3. **3D Cursor-Tilted Camera Rig**: Once revealed, moving the cursor across the Hero section subtly pitches and yaws the entire 3D Hero stage (`rotateX`, `rotateY` in `preserve-3d` space) while shifting a live anamorphic brass spotlight reflection across the background.
- **Confirmed Decision 3 (Recommended Pacing & Replay Control)**: Fast ~1.9s theatrical pacing that never blocks interaction, paired with both the existing click-logo-to-replay in the navbar and a subtle **Replay Cinema** button (`RotateCcw` icon) in the bottom-right corner of the Hero stage.

---

## 1. Overview & Core Concept

- **What It Does**: Elevates the Hero entrance from a simple overlay animation into a choreographed 3-act film sequence. Viewers experience a widescreen theatrical framing, an anamorphic lens flare and time-dilated 3D fracture of the 6-faced Gutenberg Cube, a camera dolly-in reveal as the letterbox bars open, and continuous 3D camera parallax controlled by their cursor.
- **Target Audience / Persona**: Visitors, creators, and editorial teams arriving on the landing page.
- **Key Value**: Delivers a memorable, studio-grade 3D theatrical reveal while keeping *"Research. Think. Publish."* and the **3D Floating Editorial Desk** immediately accessible and interactive.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Act I — Widescreen Ignition**:
     - Top and bottom widescreen letterbox bars (`11vh`) frame the viewport with a `1px` antique-brass (`#C8A15A/35`) inner edge.
     - The 6-faced 3D Gutenberg Cube accelerates inside multi-axis orbital brass rings as a pre-shatter golden core builds energy.
  2. **Act II — Anamorphic Flash & Bullet-Time Shatter**:
     - A razor-sharp horizontal **Anamorphic Golden Lens Flare** (`100vw` wide, tapered diamond profile) flashes across the center of the Cube.
     - Two concentric shockwave rings (`#E5C98B` and `#52B788`) and 8 radial volumetric light rays burst outward.
     - The 6 engraved faces (`B`, Nib, `§`, Loupe, Seal, `1450`) and 32 brass/emerald shards launch into deep 3D space (`translate3d`) and hang in a dramatic bullet-time deceleration before dissolving as the camera pushes through them.
  3. **Act III — Letterbox Retraction & 3D Camera Rig**:
     - The cinema letterbox bars retract smoothly to reveal the full viewport.
     - The Hero stage dollies into focus with *"Research. Think. Publish."* (no kicker text above it) on the left and the interactive **3D Floating Editorial Desk** on the right.
     - Moving the pointer tilts the entire Hero camera rig (`±4.5deg` X/Y spring-smoothed parallax) with a counter-drifting anamorphic light reflection.
     - Clicking either the navbar 3D Cube logo or the subtle **Replay Cinema** button in the Hero corner re-triggers the full 3-Act Director's Cut anytime.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Spring-Smoothed `useMotionValue` 3D Camera Rig Combined with Scroll-Driven Recession**
  - *Chosen Approach*: Combine Framer Motion `useSpring` cursor coordinates (`cameraRotateX`, `cameraRotateY`, `anamorphicGlowX`) with the existing scroll-driven 3D recession (`heroStageScale`, `heroStageRotateX`, `heroStageY`).
  - *Why*: Gives the Hero section tactile 3D depth on mouse movement at the top of the page while preserving the smooth Apple-style 3D scroll transition into the `#product` section.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌──────────────────────────────────────────────────────────────────────────┐
│                     HeroSection (3-Act Cinema Stage)                     │
├──────────────────────────────────────────────────────────────────────────┤
│  ├─ Cinema Letterbox Bars (Top & Bottom 11vh, retract on Act III)        │
│  ├─ Anamorphic Spotlight & Volumetric Backdrop (reacts to cursor X/Y)    │
│  ├─ Act I & II: HeroShatterCube3D ('spin' -> 'shatter' bullet-time)      │
│  │    ├─ 3D Tilted Gyroscope Rings + Radial Volumetric God-Rays          │
│  │    ├─ Horizontal Anamorphic Golden Lens Flare + Dual Shockwave Burst  │
│  │    └─ 6 Engraved 3D Faces + 32 Shards (bullet-time 3D trajectories)   │
│  ├─ Act III: 3D Camera Rig Stage (cursor rotateX/rotateY + scroll dolly) │
│  │    ├─ Left: "Research. Think. Publish." + CTAs + Social Proof         │
│  │    └─ Right: 3D FloatingEditorialDesk (4 interactive stages)          │
│  └─ Replay Cinema Trigger (Navbar 3D Logo + Corner Replay Button)        │
└──────────────────────────────────────────────────────────────────────────┘
```
- **Interactive Component & State Mapping**:
  - `heroStage`: `'spin'` (`0ms–900ms`) → `'shatter'` (`900ms–1850ms`, bullet-time fracture + anamorphic flare) → `'split'` (`1850ms+`, letterbox bars retract, 3D camera rig active).
  - `camX` / `camY` (`useMotionValue` + `useSpring`): Tracks normalized cursor position across `#hero` and drives 3D camera rig rotation (`cameraRotateX`, `cameraRotateY`) and anamorphic background light shift.
  - `onReplayHero`: Increments `replayKey` from either the Navbar logo or the Hero **Replay Cinema** button to replay Acts I–III on demand.
