# Remove "Freeze Bullet-Time" & "Replay Cinema" Buttons from Hero

## 1. Change Overview
Per the attached screenshot, remove the bottom-right Corner Director's Control Cluster (`"Freeze Bullet-Time"` and `"Replay Cinema"` buttons) from the Hero section so the bottom-right of the Hero stage remains completely clean and uncluttered.

## 2. File-by-File Modifications

### `/app/landing/page.tsx`
- **Remove Corner Director's Control Cluster (Lines 1612–1642)**:
  - Delete the `<motion.div>` containing the `Freeze Bullet-Time` (`handleToggleBulletTime`) and `Replay Cinema` (`onReplayHero`) buttons at the bottom-right of `HeroSection`.
  - Clean up unused `bulletTimeFrozen` state and `handleToggleBulletTime` handler in `HeroSection` so the 3-Act Kintsugi Cube → Magnetic Shard Forge → Hero Reveal plays smoothly and automatically on entry without floating debug/replay buttons.

## 3. Verification
- Run `compile_applet` and `lint_applet` to ensure zero build or lint issues.
