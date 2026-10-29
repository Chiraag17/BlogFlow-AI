# Tactile Archival Ledger Inputs & Live Keystroke Physics for Studio Auth

Upgrade the **BlogFlow AI** Login and Register experiences by transforming standard web inputs into **Archival Ledger Fields** equipped with animated **Brass Caliper Focus Brackets**, **Live Keystroke Physics**, and a **Synchronized Optical Engraving Bridge** that connects every keystroke to the interactive 3D Press Pass stage.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and aesthetic choices were confirmed in Phase 1 and govern this implementation:

- **Confirmed Decision 1 — Brass Caliper Inputs & Live Keystroke Physics**: Replace standard bordered form fields with custom **Archival Ledger Inputs** featuring spring-animated brass corner calipers (`┌ ┐ └ ┘`), keystroke velocity micro-recoil, live character carriage progress rails, and keystroke spark pulses that travel into the 3D Press Pass.
- **Confirmed Decision 2 — Split Studio Layout Supercharged on Both Sides**: Preserve the 12-column asymmetric split layout (7-column Warm Archival Paper form canvas on the left, 5-column Deep Forest Ink 3D Press Pass vault on the right) while introducing a central **Optical Brass Telemetry Spine** that visually links the active input field to the 3D Press Pass.
- **Confirmed Decision 3 — Unified Upgrade Across Login & Register**: Apply the reusable Archival Ledger Input system, keystroke physics engine, and upgraded 3D Press Pass engraving reactivity across both the Sign In and Create Studio Account flows.

---

### 1. Overview & Core Concept

- **What It Does**: Elevates authentication from a static web form into a tactile, mechanical editorial ritual. As the user focuses a field and types their credentials, precision brass corner calipers snap around the active input, each keystroke triggers a subtle mechanical type-bar impulse and ink-density progress bar, and a synchronized brass light pulse travels across the split-screen boundary to engrave the 3D Press Pass or rotate its rear cryptographic tumbler in real time.
- **Target Audience / Persona**: Managing editors, content strategists, and SEO publishers entering their autonomous editorial studio.
- **Key Value**: Establishes immediate curatorial authority and tactile craftsmanship from the very first keystroke without sacrificing zero-latency form usability, keyboard accessibility, or authentication speed.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Arrival & Field Inspection**: The user lands on the 12-column split canvas. Each input field is rendered as a numbered **Archival Ledger Entry** (`01 · CREDENTIAL IDENTIFIER`, `02 · CRYPTOGRAPHIC CIPHER`) with fine millimeter ruler ticks along its bottom baseline.
  2. **Brass Caliper Lock-On (`onFocus`)**: Focusing an input smoothly expands four L-shaped **Brass Corner Calipers** (`#C8A15A`) around the field within `160ms`, illuminates the field's index number, and aligns the central **Optical Brass Bridge** with the focused input row.
  3. **Live Keystroke Physics (`onKeyDown` / `onChange`)**:
     - Each typed character triggers a composable GPU `transform` micro-impulse (`scale(1.006)` settling back in `120ms`) and advances an **Ink Carriage Progress Indicator** along the bottom millimeter scale of the input.
     - Typing velocity (characters per second) and last-keystroke pulse are passed to both the **3D Gutenberg Type Block** crest and the **3D Editorial Press Pass**, causing the embossed brass lettering on the card to shimmer with a warm specular flash on every keystroke.
  4. **180° Cryptographic Flip & Tumbler Keystroke Physics**: Focusing the password or confirm-password field flips the 3D Press Pass 180° to its rear vault view. Each password keystroke physically steps the dual counter-rotating brass lock rings forward by `24°` with a spring-damped mechanical settle and updates the 4-stage entropy gauge in real time.
  5. **Sliding Studio Doors Departure (`onSubmit`)**: Submitting valid credentials locks the brass calipers in emerald-gold verification state and parts the left and right studio doors smoothly into the workspace.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Museum-Grade Editorial Press & Precision Horology — combining archival paper warmth with calibrated brass instruments.
  - *Color Palette & Mood* (60-30-10 Discipline):
    - **60% Dominant Neutral Canvas**: Warm Archival Alabaster (`#F7F4EC`) in light mode; Deep Obsidian Pine (`#101714`) in dark mode.
    - **30% Structural Surfaces**: Crisp Ledger Paper (`#FFFFFF` / `#17211D`), Deep Forest Ink Stage (`#163F32` / `#0C1210`), and muted stone metadata (`#68736D` / `#8E9E95`) with `1px` hairline dividers.
    - **10% Accent Budget**: Burnished Brass Gold (`#C8A15A` / `#D4AF67`) reserved strictly for active caliper brackets, keystroke carriage ticks, optical bridge pulses, and verified seals.
  - *Typography & Hierarchy* (2+1 Font Rule):
    - **Display Serif**: `Fraunces` / `Playfair Display` for main studio titles and live-engraved Press Pass holder names (`text-wrap: balance`).
    - **Body & UI Controls**: Clean neo-grotesque sans for labels, helper descriptions, and action buttons.
    - **Monospace Telemetry**: `JetBrains Mono` (`tabular-nums`) for field index coordinates, keystroke cadence counters, accession numbers, and tumbler degree readouts.
  - *Component Styling & Layout*:
    - Unboxed metadata with middle-dot (`·`) separators (strict zero-pill discipline).
    - Single-elevation containers separated by generous whitespace and hairline rules (no thick left borders or nested card clutter).

- **Interactive Feedback & Motion**:
  - **Compositor-Only Animations**: All keystroke recoils, caliper bracket locks, carriage ruler fills, and 3D Press Pass rotations animate strictly via `transform` and `opacity` (`cubic-bezier(0.16, 1, 0.3, 1)`), settling within `120ms–180ms`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Reusable `ArchivalLedgerInput` Component vs. Inline Input Markup**
  - *Chosen Approach*: Extract a dedicated, accessible client component that encapsulates the brass corner calipers, millimeter carriage ruler, keystroke impulse physics, password visibility toggle, and inline validation state.
  - *Why*: Guarantees identical tactile physics, WCAG AA focus visibility, and zero code duplication across both Login (2 fields) and Register (4 fields).
  - *Alternatives Considered*: Duplicating Framer Motion wrappers around each `<input>` in both pages, which makes keystroke timing and caliper alignment harder to keep consistent.

- **Decision 2: Deterministic Keystroke Pulse Counter for Cross-Column Synchronization**
  - *Chosen Approach*: Track a lightweight `keystrokePulse` counter and `lastKeyTimestamp` in parent form state and pass them into both the central Optical Brass Spine and the `EditorialPressPass3D` stage.
  - *Why*: Allows every keystroke on the left paper canvas to trigger an immediate, zero-lag specular brass ripple and mechanical tick on the right 3D Press Pass without heavy global state or DOM timers.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                   AUTH SPLIT STUDIO CANVAS (Login & Register)                │
├───────────────────────────────────┬──────┬───────────────────────────────────┤
│   LEFT: 7-COL ARCHIVAL PAPER      │SPINE │    RIGHT: 5-COL 3D VAULT STAGE    │
│                                   │      │                                   │
│  ┌─────────────────────────────┐  │      │  ┌─────────────────────────────┐  │
│  │ Studio Header & Theme Switch│  │      │  │ Accession Header & 180° Flip│  │
│  └──────────────┬──────────────┘  │      │  └──────────────┬──────────────┘  │
│                 ▼                 │      │                 ▼                 │
│  ┌─────────────────────────────┐  │      │  ┌─────────────────────────────┐  │
│  │ GutenbergTypeBlock3D Crest  │◄─┼──────┼─►│   EditorialPressPass3D      │  │
│  └──────────────┬──────────────┘  │      │  │  • Front: Live Foil Engrave │  │
│                 ▼                 │      │  │    + Keystroke Strike Sheen │  │
│  ┌─────────────────────────────┐  │      │  │  • Rear: Dual Brass Tumbler │  │
│  │   ArchivalLedgerInput (xN)  │  │      │  │    + 4-Bar Entropy Matrix   │  │
│  │  • Brass Corner Calipers    │──┼─────►│  └──────────────┬──────────────┘  │
│  │  • Keystroke Recoil Physics │  │Optical                 ▼                 │
│  │  • Millimeter Carriage Rail │  │Bridge│  ┌─────────────────────────────┐  │
│  └──────────────┬──────────────┘  │Pulse │  │ Live Keystroke Telemetry Bar│  │
│                 ▼                 │      │  └─────────────────────────────┘  │
│  ┌─────────────────────────────┐  │      │                                   │
│  │ Studio Doors Submit Trigger │  │      │                                   │
│  └─────────────────────────────┘  │      │                                   │
└───────────────────────────────────┴──────┴───────────────────────────────────┘
```

- **Data Model & State**:
  - `activeFieldIndex` (`number | null`): Tracks which ledger input (`01` through `04`) currently holds focus so the Brass Calipers lock onto that field and the Optical Bridge aligns with its vertical position.
  - `keystrokePulse` (`number`): Monotonically increments on every key event, driving the GPU micro-recoil on the active input, the millimeter carriage ruler tick, and the live engraving flash on the 3D Press Pass.
  - `typingCadence` (`'idle' | 'typing' | 'locked'`): Derived transient state that illuminates the optical bridge and Press Pass engraving head while keys are actively struck.

- **Interactive Component & State Mapping**:
  - **Archival Ledger Input (`ArchivalLedgerInput`)**:
    - `onFocus`: Sets `activeFieldIndex`, snaps the 4 brass corner calipers inward (`scale(1)`), and flips the 3D Press Pass to `0°` (identity fields) or `180°` (cipher fields).
    - `onChange` / `onKeyDown`: Increments `keystrokePulse`, updates the bottom millimeter ruler fill (`tabular-nums` character counter + tick marks), and triggers a `120ms` vertical type-bar strike animation on the active field badge.
    - `onBlur`: Releases caliper lock to subtle resting state (`opacity: 0.25`) while preserving filled ledger checkmarks.
  - **3D Press Pass Stage (`EditorialPressPass3D`)**:
    - Reacts to `keystrokePulse` with a localized gold foil strike flare over the engraved name/email (front face) or a calibrated ratchet pulse on the mechanical tumbler rings (rear face).
    - Displays a bottom **Live Keystroke & Engraving Telemetry Strip** showing active field coordinate, character count, and cipher entropy status in `tabular-nums`.
