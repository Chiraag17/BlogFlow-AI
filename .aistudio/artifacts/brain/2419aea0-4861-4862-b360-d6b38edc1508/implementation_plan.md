# Interactive Headline-to-3D-Desk Choreography & Living Golden Ink Fountain Pen

This upgrade connects the Hero's monumental typography (*"Research. Think. Publish."*) directly to the 3D Editorial Desk and brings the 3D desk instruments to life with continuous subtle motion, hover/click reactions, and a **glowing golden ink trail** beneath the 3D fountain pen nib.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Phase 1 Choices**:
> - **Interactive Headline Words Driving the 3D Desk**: Hovering or clicking **"Research."**, **"Think."**, or **"Publish."** in the Hero headline immediately drives the 3D Editorial Desk camera and instruments to the corresponding stage (`research`, `draft`, or `publish`), with visual brass underline feedback and an inline stage readout.
> - **Continuous Subtle Motion + Hover & Click Reactions**: The 3D Editorial Desk instruments (magnifying loupe, fountain pen, approval seal, and bound folio) perform continuous, organic studio motion once revealed, and amplify their physical choreography when hovered or selected via the headline words.
> - **Glowing Golden Ink Trail Under the 3D Fountain Pen Nib**: As the 3D fountain pen writes across the manuscript, its gold nib emits a warm micro-spotlight and leaves a shimmering 24K golden calligraphy ink trail across the paper surface.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the Hero headline from static display text into an interactive spatial controller for the 3D Editorial Desk, while making the 3D desk itself feel like a living, breathing writer's atelier.
- **Target Audience / Persona**: Visitors who land on the Hero and instinctively move their cursor over *"Research. Think. Publish."* or inspect the 3D desk.
- **Key Value**: Creates an immediate, memorable "aha" moment—demonstrating how BlogFlow AI unifies research, long-form thinking, and publishing through direct tactile interaction.

---

## 2. User Experience & Visual Design

- **Interactive Headline Choreography (*"Research. Think. Publish."*)**:
  1. **"Research." (`stage = 'research'`)**:
     - Hovering or clicking **"Research."** highlights the word with a warm brushed-brass underline glow and swings the 3D desk camera toward the fanned MIT/Nature citation dossiers.
     - The 3D brass magnifying loupe sweeps in a figure-8 optical scan over the primary sources.
  2. **"Think." (`stage = 'draft'`)**:
     - Hovering or clicking **"Think."** shifts focus to the central archival manuscript stack.
     - The 3D fountain pen drops into writing posture and glides across the page in a live calligraphy motion, illuminating a **glowing golden ink trail** directly beneath the gold nib.
  3. **"Publish." (`stage = 'publish'`)**:
     - Hovering or clicking **"Publish."** transitions the 3D desk to the bound publication folio and brass approval seal, triggering a smooth stamp-and-levitate motion.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Tactile Editorial Atelier—clean unboxed typography with subtle `·` separators and warm 24K gold-and-emerald studio accents.
  - *Interactive Affordance*: Each of the three headline words displays a subtle brass baseline indicator when active or hovered, accompanied by a quiet 1-line unboxed status readout right below the headline (`Active on 3D Desk: 02. Think · Gemini Long-Form Writer drafting with live golden ink`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Continuous Clock-Driven Kinematics with Active Stage Amplification**
  - *Chosen Approach*: Use the Three.js `clock.getElapsedTime()` inside `FloatingEditorialDesk` to drive smooth sine/figure-8 oscillations on the loupe, fountain pen, and seal, scaling the motion amplitude by `2.2×` on whichever instrument matches the active headline word (`research`, `draft`, or `publish`).
  - *Why*: Ensures the 3D desk never looks frozen or static, while giving a clear, unmistakable physical response when the user hovers **"Research."**, **"Think."**, or **"Publish."**
- **Decision 2: Procedural 3D Golden Ink Ribbon + Nib PointLight**
  - *Chosen Approach*: Attach a short-range warm `THREE.PointLight` (`0xffdf80`) to the tip of `penNib` and render a multi-stroke golden calligraphy trail (`inkTrailGroup`) on the top surface of `heroSheet` whose emissive glow pulses and tracks the pen nib's horizontal sweep.
  - *Why*: Delivers realistic specular ink shimmer and warm light pooling on the paper grain at 60fps with zero external texture dependencies.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   HeroSection (/app/landing/page.tsx)                      │
│  Props: activeDeskStage, onSelectDeskStage                                 │
├──────────────────────────────────────┬─────────────────────────────────────┤
│                                      │                                     │
│  ┌────────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │  Interactive Headline Trigger  │  │  │    FloatingEditorialDesk      │  │
│  │  • "Research." -> 'research'   ├──┼─►│  • Continuous 60fps studio    │  │
│  │  • "Think."    -> 'draft'      │  │  │    kinematics loop            │  │
│  │  • "Publish."  -> 'publish'    │  │  │  • Loupe figure-8 scan        │  │
│  │  • Brass active underline &    │  │  │  • Pen calligraphy sweep      │  │
│  │    unboxed stage telemetry     │  │  │  • Glowing Golden Ink Trail + │  │
│  └────────────────────────────────┘  │  │    Nib PointLight on paper    │  │
│                                      │  └───────────────────────────────┘  │
└──────────────────────────────────────┴─────────────────────────────────────┘
```

### Interactive Component & State Mapping

1. **`HeroSection` (`/app/landing/page.tsx`)**:
   - Wraps **"Research."**, **"Think."**, and **"Publish."** inside interactive `<button>` / `<span role="button">` triggers with `onMouseEnter`, `onFocus`, and `onClick` handlers that call `onSelectDeskStage('research' | 'draft' | 'publish')` and pulse a `deskInteractionPulse` counter.
   - Renders an animated brushed-brass underline indicator beneath the currently active headline word and a quiet unboxed inline readout showing the synchronized 3D Desk instrument and live metric.
2. **`FloatingEditorialDesk` (`/components/3d/FloatingEditorialDesk.tsx`)**:
   - Adds `penNibLight` (`THREE.PointLight(0xffdf80, 0.9, 0.32)`) at the fountain pen nib tip and `inkTrailGroup` (6 glowing golden calligraphy strokes + live nib ink droplet mesh with `polygonOffset` on `heroSheet`) that shimmer and reveal progressively as `penGroup` sweeps across the manuscript.
   - Updates the render loop so continuous subtle motion runs smoothly whenever the scene is visible, with amplified calligraphy writing on `'draft'`, figure-8 optical scanning on `'research'`, and seal stamping / folio levitation on `'review'` & `'publish'`.
