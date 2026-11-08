# Bespoke Cinematic Hero Upgrade: Molten Kintsugi Forge, Magnetic Shard Assembly & Chiaroscuro Lamp Ignition

This upgrade transforms the existing Landing Page Hero into an original, non-generic 3-Act editorial cinema piece: the 3D Gutenberg Cube heats up with glowing **Molten Gold *Kintsugi* seams and volumetric God-rays** in a dark chiaroscuro room, shatters into **magnetic 3D brass shards that fly left and right to physically forge the headline and 3D Editorial Desk**, and triggers the **physical brass pull-chain on the 3D Emerald Banker's Lamp** to flood the stage with warm tungsten light as the camera executes an **anamorphic depth-of-field rack focus**.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Bespoke Cinematic Choices (from Phase 1)**:
> - **Molten Gold *Kintsugi* Fracture Seams & Volumetric God-Rays**: Before the cube shatters, pressurized 24K molten gold light builds inside the core—etching glowing *Kintsugi* fracture veins across the six brass plates and projecting rotating volumetric God-ray shafts through the seams.
> - **Magnetic 3D Shard Re-Assembly (Forging Headline & Desk)**: Instead of fading into empty space, the 32 extruded 3D metallic shards pause in bullet-time and then curve along magnetic trajectories—half snapping into the left column to forge *"Research. Think. Publish."* with a golden anvil flash, and half spiraling into the right column to assemble and ignite the 3D Editorial Desk.
> - **Chiaroscuro Dark-Room Intro to Banker's Lamp Pull-Chain Ignition**: The Hero opens in dramatic dark-room chiaroscuro lit only by the molten cube. As the magnetic shards reach the desk, the 3D banker's lamp brass pull-chain physically tugs downward and clicks the tungsten bulb on (with a warm filament warm-up curve), lifting the dark-room veil and illuminating the walnut desk and stage.
> - **Anamorphic Depth-of-Field Rack Focus**: Synchronized optical focus pull (`filter: blur(...)` + Z-plane scale) that shifts camera focus from the foreground molten cube to the mid-ground serif headline and background 3D Editorial Desk.
> - **Playback Control (Recommended Default)**: Seamless auto-play cinema paired with a compact **Freeze Bullet-Time / Replay Cinema** studio control bar in the bottom-right corner so visitors can pause the mid-air shard forge or replay the sequence on demand.

---

## 1. Overview & Core Concept

- **What It Does**: Elevates the existing Gutenberg Type-Block Hero from a standard explosion reveal into a cohesive narrative of *craftsmanship and illumination*—showing raw molten metal and light literally forging the typography (*"Research. Think. Publish."*) and awakening the writer's desk.
- **Target Audience / Persona**: Editorial directors, founders, and content teams evaluating BlogFlow AI's craft, precision, and polish within the first two seconds of landing.
- **Key Value**: Replaces generic particle effects with purposeful, story-driven choreography where every visual element (seams, shards, lighting, camera focus, and 3D desk hardware) is causally connected.

---

## 2. User Experience & Visual Design

- **3-Act Bespoke Choreographed Timeline**:
  1. **Act I — Chiaroscuro & Molten *Kintsugi* Pressure (0.0s – 0.95s)**:
     - The Hero stage is cloaked in a deep obsidian-emerald chiaroscuro veil (`#040A08` at 82% opacity) framed by 2.39:1 widescreen cinema letterbox bars.
     - At the center, as the 6-faced 3D Gutenberg Cube rotates, an internal molten furnace core intensifies from warm amber (`#C8A15A`) to incandescent white-gold (`#FFFDF7`).
     - Glowing SVG *Kintsugi* fracture veins spider across the 6 brass faces while 12 conical **Volumetric God-Ray shafts** burst outward through the plate seams.
  2. **Act II — Bullet-Time Detonation & Magnetic Shard Forge (0.95s – 1.85s)**:
     - At peak pressure, the cube unlatches in a brief bullet-time suspension alongside an anamorphic horizontal gold lens flare.
     - Rather than vanishing, the **32 thick 3D brass shards** split into two magnetic streams:
       - **Stream A (Left Forge — 16 Shards)**: Arcs into the left column (`translate3d(-320px, -20px, 60px)`), triggering a brief golden forge-flash as *"Research. Think. Publish."* crystallizes out of the bokeh.
       - **Stream B (Right Forge — 16 Shards)**: Spirals into the right column (`translate3d(+310px, +10px, 80px)`), converging directly onto the 3D Editorial Desk's banker's lamp.
  3. **Act III — Pull-Chain Lamp Ignition & Anamorphic Rack Focus (1.85s+)**:
     - Upon shard arrival, the 3D Banker's Lamp brass pull-chain in `FloatingEditorialDesk` physically tugs down (`y` displacement with spring rebound).
     - The lamp bulb ignites with a realistic warm tungsten filament surge (`intensity: 0 → 3.4 → 2.1 → 2.85`), illuminating the emerald glass shade, volumetric light cone, walnut wood grain, and manuscript.
     - Simultaneously, the Hero's chiaroscuro dark-room veil dissolves, the widescreen letterbox bars retract, and the camera completes an **anamorphic rack focus** from foreground (`z: 220px`) to the split-column stage (`blur(16px) → blur(0px)`).
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-Craft Editorial Atelier (*Gutenberg Linotype Forge meets Leica Noctilux Cinema*).
  - *Color Palette & Mood*: Chiaroscuro Obsidian (`#040A08`), Incandescent Molten Gold (`#FFFDF7` / `#F5E1A4`), Machined Brass (`#C8A15A`), British Racing Emerald (`#163F32`), and Warm 2700K Tungsten (`#FFE4A0`).
  - *Typography & Hierarchy*: Leads directly with *"Research. Think. Publish."* in `Fraunces` display serif (`clamp(2.5rem, 4.5vw, 4.25rem)`), with a molten-gold-to-ink cooling shimmer as the headline is forged by the arriving shards.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Two-Stage Keyframe Trajectory for Magnetic Shards**
  - *Chosen Approach*: Drive each of the 32 3D shards through a 3-point keyframe array (`[Origin → Bullet-Time Apex → Magnetic Target (Left Headline or Right Desk)]`) using Framer Motion hardware-accelerated `transform` and `opacity` keyframes.
  - *Why*: Achieves unmistakable magnetic convergence into the headline and 3D desk at 60fps without expensive per-frame DOM layout reads.
- **Decision 2: Synchronized Chiaroscuro-to-Tungsten Lamp Ignition Across React & Three.js**
  - *Chosen Approach*: Pass a `lampIgnited` boolean prop from `HeroSection` into `FloatingEditorialDesk` (defaulting to `true` when scrolled or in reduced-motion mode, and transitioning `false → true` as the magnetic shards strike the desk). Inside Three.js, animate the brass pull-chain mesh, emerald shade emissive glow, volumetric light cone opacity, and `deskLampLight.intensity` along a tungsten warm-up curve.
  - *Why*: Connects the 2D/CSS Hero choreography directly to the physical 3D WebGL scene so the banker's lamp feels like the true light source of the entire Hero page.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   HeroSection (/app/landing/page.tsx)                      │
│  State: heroStage ('spin' | 'shatter' | 'split'), isBulletTimePaused       │
├──────────────────────────────────────┬─────────────────────────────────────┤
│                                      │                                     │
│  ┌────────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │   HeroChiaroscuroLightingRig   │  │  │     HeroShatterCube3D         │  │
│  │ • Dark-room chiaroscuro veil   │  │  │ • Molten 24K Kintsugi SVG     │  │
│  │ • Ignites on Act III lamp pull │  │  │   vein fractures on 6 faces   │  │
│  │ • 2700K Tungsten bloom wash    │  │  │ • 12 Volumetric God-Ray cones │  │
│  │ • 60fps 3D Museum Dust Canvas  │  │  │ • 32 Magnetic 3D Shards:      │  │
│  └────────────────────────────────┘  │  │   - 16 → Left Headline Forge  │  │
│                                      │  │   - 16 → Right 3D Desk Forge  │  │
│                                      │  └───────────────────────────────┘  │
│                                      │                                     │
│  ┌────────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │   Anamorphic Rack-Focus Rig    │  │  │    FloatingEditorialDesk      │  │
│  │ • Left Column: Forge flash +   │  │  │ • Prop: lampIgnited (boolean) │  │
│  │   "Research. Think. Publish."  │  │  │ • Pull-chain tug kinematics   │  │
│  │   molten-to-ink cooling glow   │  │  │ • Tungsten filament surge on  │  │
│  │ • Corner Bullet-Time / Replay  │  │  │   THREE.SpotLight + shade     │  │
│  └────────────────────────────────┘  │  └───────────────────────────────┘  │
└──────────────────────────────────────┴─────────────────────────────────────┘
```

### Interactive Component & State Mapping

1. **`HeroShatterCube3D` (Molten *Kintsugi* & Volumetric God-Rays + Magnetic Shards)**:
   - Adds `CubeFaceKintsugiVeins`: glowing SVG fracture paths across each of the 6 cube faces that animate `strokeDashoffset` and `opacity` during `phase === 'spin'`, accompanied by 12 rotating 3D volumetric God-ray cones (`HeroVolumetricGodRays`) projecting out of the cube core.
   - Upgrades `CUBE_SHATTER_SHARDS` (32 extruded 3D metallic shards) with `targetForge: 'headline' | 'desk'` and magnetic destination coordinates (`forgeX`, `forgeY`, `forgeZ`) so during `phase === 'shatter'`, each shard bursts outward to its bullet-time apex (`[0, apexX, forgeX]`) and then curves into either the headline on the left or the 3D desk on the right.
2. **`FloatingEditorialDesk` (Chiaroscuro Pull-Chain & Tungsten Filament Surge)**:
   - Accepts optional `lampIgnited?: boolean` prop (defaults to `true`).
   - When `lampIgnited` transitions from `false` to `true`, triggers a physical downward tug and spring rebound on the brass pull-chain (`chainCord` + `chainAcorn`), ramps `deskLampLight.intensity` through a realistic tungsten filament surge, and illuminates the emerald glass shade and volumetric light cone.
3. **Anamorphic Rack-Focus & Forge Flash (`HeroSection`)**:
   - Coordinates the dark-room chiaroscuro overlay opacity (`0.82 → 0`), a warm golden forge-flash behind *"Research. Think. Publish."* when the left shard stream arrives, and an optical depth-of-field blur transition (`blur(16px) → blur(0px)`) synchronized with a bottom-right **Pause Bullet-Time / Replay Cinema** control bar.
