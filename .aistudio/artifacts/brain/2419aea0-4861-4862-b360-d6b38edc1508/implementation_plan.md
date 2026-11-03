# Spatial 3D Dashboard Redesign Plan

Transform `/dashboard` (and `/studio`) from a text-heavy admin page into a visual-first **3D Spatial Studio** featuring an interactive **3D Coverflow Manuscript Carousel**, **3D Metric Monoliths** with radial progress rings and 1-word labels, and a **Clean 3D Command Header** stripped of instructional and telemetry clutter.

## User Review & Critical Decisions

> [!IMPORTANT]
> Summary of choices confirmed for the Dashboard UI/UX redesign:

- **Confirmed Decision 1 (3D Coverflow Manuscript Carousel)**: Replace the vertical text list of articles and wordy side tables with an interactive **3D Coverflow Carousel** (`perspective: 1400px`, `preserve-3d`) that users can click, drag/swipe, or flip through with left/right controls. Each 3D card displays a visual circular SEO ring gauge, clean title, publication tag, and one-click 3D Stamp/Publish or Unfold actions.
- **Confirmed Decision 2 (3D Metric Monoliths with Radial Rings & 1-Word Labels)**: Replace the wordy KPI boxes (`01 · Total Manuscripts ... Filter all ->`) with 4 cursor-tilted **3D Metric Monoliths** displaying an animated SVG radial ring, bold tabular number, and a 1-word label (`Articles`, `Review`, `Published`, `Sites`).
- **Confirmed Decision 3 (Clean 3D Command Header & 70% Word Reduction)**: Remove all instructional subtext (*"Typing spins the 3D Research Calibration Ring..."*, *"Switch between manuscript velocity..."*, *"Daily generation vs. WordPress..."*, *"PostgreSQL Persistent Mode"*, and wordy audit tables) across the dashboard and inside the 3D Orrery header so visuals and 3D interactions lead.

---

## 1. Overview & Core Concept

- **What It Does**: Elevates the main dashboard into a tactile, low-text 3D command studio where users launch drafts, orbit the 3D Editorial Orrery, inspect 3D radial metric monoliths, and flip through their manuscripts in a 3D Coverflow stage.
- **Target Audience / Persona**: Creators and editors who want an inspiring, visual-first workspace without walls of repetitive text.
- **Key Value**: Cuts ~70% of static text labels while making every primary workflow (launching a brief, filtering by stage, approving/publishing articles) tactile and immediate in 3D space.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Clean 3D Command Stage**: A concise greeting (`Good morning, [Name]`), a single-line prompt bar (`Topic` + `Site` + `Create`), and 3 compact 1-word topic pills sit beside the interactive 3D WebGL Editorial Orrery (with its top-left text badge simplified to a clean `Stamp` button).
  2. **3D Metric Monoliths**: Four 3D cursor-tracked monolith cards (`Articles`, `Review`, `Published`, `Sites`). Each monolith renders a 3D floating SVG radial ring gauge around a large tabular figure. Clicking a monolith filters the 3D Coverflow deck below.
  3. **3D Coverflow Manuscript Deck**:
     - Displays manuscripts in a 3D perspective Coverflow fan: the active center card faces forward at `translateZ(60px) scale(1.04)`, while adjacent cards angle outward in 3D space (`rotateY(±38deg) translateZ(-90px)`).
     - Users can click any side card to bring it center-stage, use Previous/Next buttons, or filter by stage (`All`, `Review`, `Approved`, `Published`).
     - The center 3D card features a circular SVG SEO ring, word count, and direct **Approve** / **Publish** / **Preview** buttons with a 3D brass stamp animation.
  4. **Streamlined Visual Telemetry**: Clean chart headers (`Output`, `Cadence`) with zero subtitle paragraphs or footer explanations.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: 3D Coverflow Carousel Over Flat Table Rows**
  - *Chosen Approach*: Render filtered manuscripts inside a `transform-style: preserve-3d` stage where each card's `x`, `z`, `rotateY`, and `opacity` are driven by its offset from `activeIndex`.
  - *Why*: Eliminates repetitive row metadata and turns manuscript triage into a spatial, tactile flip-through experience.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────┐
│                         DashboardPage (/dashboard)                   │
├──────────────────────────────────┬───────────────────────────────────┤
│  1. Clean 3D Command Stage       │  2. 4x 3D Metric Monoliths        │
│  • Concise greeting + input      │  • Cursor 3D tilt + SVG radial    │
│  • 3D WebGL EditorialOrrery3D    │    ring + 1-word label            │
├──────────────────────────────────┴───────────────────────────────────┤
│  3. 3D Coverflow Manuscript Carousel                                 │
│  • Interactive 3D perspective deck (prev/next, click card, filter)   │
│  • Visual SEO ring gauge + 1-click 3D Brass Stamp Approve/Publish    │
├──────────────────────────────────┬───────────────────────────────────┤
│  4. Clean Telemetry (Output)     │  5. Clean Cadence + Site Pills    │
└──────────────────────────────────┴───────────────────────────────────┘
```
