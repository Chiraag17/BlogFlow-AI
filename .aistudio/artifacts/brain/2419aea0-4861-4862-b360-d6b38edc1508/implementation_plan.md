# Remove Hero Stage Readout Line Below Headline

## 1. Change Overview
Per the attached screenshot, remove the telemetry readout row directly beneath the Hero headline (`"3D Desk Focus: 02. Draft · 1,840 Words · 6 H2 Sections · 5 FAQs · Hover or click headline words to drive 3D instruments"`) so the Hero headline (**"Research. Think. Publish."**) flows cleanly and directly into the editorial lead paragraph.

## 2. File-by-File Modifications

### `/app/landing/page.tsx`
- **Remove Stage Readout Block (Lines 1502–1522)**:
  - Delete the `<motion.div>` rendering `3D Desk Focus: {activeChapter.num}. {activeChapter.label} · {activeChapter.hudMetric} · Hover or click headline words to drive 3D instruments`.
  - Keep the interactive hover/focus/click choreography and animated brushed-brass underline on the **"Research."**, **"Think."**, and **"Publish."** headline words intact so they continue to drive the 3D Editorial Desk seamlessly without extra text clutter.

## 3. Verification
- Run `compile_applet` and `lint_applet` to ensure zero build or lint issues.
