# 3D Editorial Orrery & Archival Folio Physics for BlogFlow AI Dashboard

This upgrade introduces two bespoke, tactile 3D experiences to the BlogFlow AI Overview dashboard: a compact **Three.js 3D Brass Editorial Orrery & Press** centerpiece inside the Command Desk, and **3D Archival Folio Stack & Unfolding Manuscript Physics** across the 4-Stage Pipeline Board, KPI Ledger, and Inspector Modal. Both systems react dynamically to user typing, stage switching, manuscript approvals, and cursor perspective without cluttering the daily editorial workflow.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and interaction choices have been confirmed from your answers and will guide the implementation:

- **Confirmed Decision 1 — Dual 3D System (Idea 1 + Idea 2)**: Combine the **3D Brass Editorial Orrery & Press** (compact WebGL/Three.js instrument) with **3D Archival Folio Stack & Unfolding Manuscript Cards** (hardware-accelerated 3D CSS perspective transforms with physical paper depth).
- **Confirmed Decision 2 — Action-Reactive Kinematics**: All 3D motion responds directly to workflow events—typing a brief in the Quick-Dispatch bar spins and locks the outer research ring, clicking a pipeline stage (`01 Research` through `04 Publish`) rotates the 3D brass press to that chapter angle, and approving or publishing a manuscript animates a 3D folio stamp-and-glide transition.
- **Confirmed Decision 3 — Compact Focal Centerpiece + 3D CSS Cards**: The WebGL 3D Orrery lives in a dedicated, framed studio stage inside the Executive Command Desk alongside the Quick-Dispatch Launcher, while the KPI Ledger cards, Pipeline Folio Stack, and Unfolding Manuscript Inspector use zero-overhead 3D CSS (`perspective: 1400px`, `transform-style: preserve-3d`, and cursor-tracked specular lighting).

---

### 1. Overview & Core Concept

- **What It Does**: Elevates the dashboard from a flat 2D admin screen into a tactile **Spatial Editorial Studio** where the multi-agent pipeline (`01 Research · 02 Draft · 03 Review · 04 Publish`) is represented as a physical 3D brass-and-forest mechanical instrument and manuscripts behave like stacked archival broadsheets with real depth, thickness, and unfolding choreography.
- **Target Audience / Persona**: Editorial directors, content engineers, and publications managers who want executive-grade spatial feedback as they dispatch topics, inspect SEO quality, and approve manuscripts.
- **Key Value**: Provides immediate, tangible visual confirmation of pipeline state transitions—every keystroke, stage filter, approval, and publication triggers coordinated 3D mechanical alignment and paper-stack physics.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Typing & Dispatching in the Command Desk**:
     - As the user types a topic into the Quick-Dispatch input or selects a suggested brief, the **3D Brass Editorial Orrery** accelerates its outer calibrated brass ring (`01 Research`), elevates the central 3D archival manuscript platen, and angles its indicator arm toward the selected publication.
     - Clicking a stage button (`01 Research`, `02 Draft`, `03 Review`, `04 Publish`) on the Orrery HUD or the Pipeline Chapter Index smoothly rotates the 3D concentric rings to lock that chapter into the foreground focal plane while filtering the manuscript stack below.
  2. **3D Perspective KPI Ledger**:
     - Moving the cursor across any of the 4 KPI Ledger cards tilts the block in 3D space (`rotateX` / `rotateY` within `±6°`) with a dynamic warm-brass specular highlight (`radial-gradient` tracking pointer coordinates) and elevated Z-translated numerical counters.
  3. **3D Archival Folio Stack & Inline Approval Choreography**:
     - The 4-Stage Pipeline Board renders manuscripts as layered 3D folio cards with visible multi-sheet paper edge thickness and depth-graded shadows.
     - Hovering a manuscript lifts it along the Z-axis (`translateZ(18px) rotateX(1.5deg)`) while subtle adjacent rows recede.
     - Clicking **Approve** or **Publish** triggers a **3D Brass Seal & Tray Glide** animation—tilting the folio, stamping its status, and smoothly sliding it in 3D space toward the target stage while pulsing the 3D Orrery centerpiece.
  4. **3D Unfolding Broadsheet Inspector**:
     - Clicking **Inspect** on any manuscript opens the Inspector Modal using a **3D Book/Folio Unfold** choreography (`rotateX(-22deg) rotateY(14deg) translateZ(-120px)` unfolding to `0deg`) with a 3D layered SEO & Readability telemetry header.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Tactile Horological & Archival Publishing Studio (inspired by precision brass astrolabes, Monocle editorial folios, and Teenage Engineering mechanical instruments).
  - *Color Palette & Mood*:
    - Light Paper Mode: Warm Archival Paper (`#F6F3EC`), Crisp Folio White (`#FFFFFF`), Deep Forest Anodized Metal (`#163F32`), Brushed Brass (`#C8A15A`), Soft Sage (`#DCE8DC`).
    - Dark Studio Mode: Midnight Forest Studio (`#101714`), Elevated Slate-Pine (`#151E1A`), Muted Sage (`#B8D5C5`), Warm Gold Brass (`#D4AF67`).
  - *Typography & Hierarchy*: `Fraunces` for editorial titles, `Plus Jakarta Sans` for workspace controls, and `JetBrains Mono` (`tabular-nums`) for calibrated ring indices and telemetry readouts.
  - *Interactive Feedback & Motion*: Exponential damping (`THREE.MathUtils.damp`) in the 3D WebGL scene and spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`) on 3D CSS perspective cards.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hybrid WebGL Centerpiece + 3D CSS Perspective Architecture**
  - *Chosen Approach*: Use a single, self-contained Three.js WebGL canvas (`RoomEnvironment` PBR lighting, brushed brass & forest anodized materials, software-WebGL guard) for the **3D Brass Editorial Orrery & Press** in the Command Desk, paired with hardware-accelerated CSS 3D transforms (`perspective`, `preserve-3d`, Framer Motion 3D springs) for the KPI cards, Folio Stack, and Unfolding Inspector.
  - *Why*: A single WebGL context guarantees 60fps performance and instant page responsiveness without hitting browser WebGL context limits, while CSS 3D transforms give crisp, sub-pixel typography on every manuscript card and modal.
  - *Alternatives Considered*: Rendering all cards inside a full-page WebGL canvas (rejected because DOM text accessibility, searchability, and crispness degrade when text is rasterized into textures).

- **Decision 2: Shared Reactive Pipeline State Between 3D Orrery and 2D/3D Workspace**
  - *Chosen Approach*: Bind the 3D Orrery directly to the dashboard's active `statusFilter`, `quickTopic` typing energy, and recent `Approve`/`Publish` actions via React refs so state changes drive smooth mechanical transitions without remounting the WebGL canvas.
  - *Why*: Ensures the 3D instrument is a functional, living reflection of the user's editorial workflow rather than a disconnected decorative loop.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD OVERVIEW WORKSPACE                        │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │               EXECUTIVE COMMAND DESK (2-COLUMN SPLIT)                │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────┐  ┌────────────────────────────┐  │  │
│  │  │ Quick-Dispatch Brief Launcher  │  │ 3D Brass Editorial Orrery  │  │  │
│  │  │ • Topic Input (Typing Energy) ─┼─►│ & Multi-Agent Press Stage  │  │  │
│  │  │ • Publication & Length Select  │  │ • 4 Concentric Brass Rings │  │  │
│  │  │ • Suggested Briefs Radar       │  │ • Central 3D Folio Platen  │  │  │
│  │  └────────────────────────────────┘  │ • Interactive Stage Dock   │  │  │
│  │                                      └─────────────┬──────────────┘  │  │
│  └────────────────────────────────────────────────────┼─────────────────┘  │
│                                                       │                    │
│                                      Shared Stage & Action Pulse           │
│                                                       ▼                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │            3D PERSPECTIVE KPI LEDGER (4-COLUMN TILT BLOCKS)          │  │
│  │  • Cursor-tracked rotateX/rotateY + specular brass light reflection  │  │
│  │  • Z-elevated tabular counters & 1-click stage filter binding        │  │
│  └────────────────────────────────────────────────────┬─────────────────┘  │
│                                                       │                    │
│                                                       ▼                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │          3D ARCHIVAL FOLIO STACK & UNFOLDING INSPECTOR               │  │
│  │  • 3D Stacked Paper Edges & Depth-Fanned Stage Transitions           │  │
│  │  • Inline Approve / Publish 3D Stamp-and-Glide Choreography          │  │
│  │  • 3D Unfolding Broadsheet Modal (preserve-3d book-open physics)     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - **Orrery Telemetry State**: Tracks `activeStageIndex` (`0` = Research, `1` = Drafts/Pending, `2` = Approved, `3` = Published), `typingImpulse` (boosted on keystrokes in the Quick-Dispatch input and decaying smoothly via exponential damping), and `sealPulse` (triggered when an article is approved or published).
  - **3D Card Pointer State**: Tracks normalized pointer coordinates `(x, y)` per card to compute real-time 3D tilt (`rotateX`, `rotateY`) and specular highlight offsets without triggering global React re-renders.

- **Interactive Component & State Mapping**:
  - **3D Brass Orrery Stage**: Composite 10-part procedural `THREE.Group` (stepped forest base plinth, 4 calibrated concentric brass/sage chapter rings with tick marks, 4 orbital stage nodes, gimbaled press arch, and central floating archival folio sheets with engraved lines). Clicking the stage pills (`01`–`04`) or dragging the viewport orbits/rotates the rings and updates `statusFilter` in the Pipeline Board.
  - **3D Archival Folio Rows**: Each manuscript row sits inside a `perspective: 1400px` stage container. Switching filter tabs animates a 3D Z-axis fan-in cascade; hovering elevates the folio with layered paper-edge borders; clicking **Approve** or **Publish** plays a 3D stamp-and-glide keyframe before committing the status update to the store.
  - **3D Unfolding Inspector Modal**: Opens with a 3D perspective hinge unfold (`rotateX` + `rotateY` + `translateZ`) and renders 3D extruded metric blocks for Word Count, SEO Score, and Readability.
