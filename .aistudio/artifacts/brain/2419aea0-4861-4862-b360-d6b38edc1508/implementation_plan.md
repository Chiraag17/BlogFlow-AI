# Remove Chiaroscuro Dark-Room Intro & Pull-Chain Lamp Ignition

This update removes the **Chiaroscuro Dark-Room Intro Veil** and the **Pull-Chain Banker's Lamp Ignition** sequence from the Hero section and 3D Editorial Desk, restoring steady, warm museum and banker's lamp illumination from the very first frame while keeping the **Molten Gold *Kintsugi* seams**, **Volumetric God-Rays**, **Magnetic 3D Shard Forge**, and **Anamorphic Depth-of-Field Rack Focus**.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Requested Removal**:
> - **Remove Chiaroscuro Dark-Room Veil**: The Hero stage will no longer start darkened under an obsidian-emerald chiaroscuro overlay; the warm museum spotlight and floor reflection pool remain consistently illuminated throughout the sequence.
> - **Remove Pull-Chain Tug & Delayed Bulb Surge**: Inside `FloatingEditorialDesk`, the brass pull-chain geometry/tug animation and delayed filament warm-up are removed so the 3D Emerald Banker's Lamp and studio key light shine steadily at full warm tungsten brightness from frame zero.
> - **Retained Cinematic Upgrades**: The Molten 24K Gold *Kintsugi* fracture seams, Volumetric God-Ray cones, 32 Magnetic 3D Shards flying to forge the headline and 3D desk, Anamorphic Rack Focus, and the Freeze Bullet-Time / Replay Cinema controls remain intact.

---

## 1. Overview & Core Concept

- **What It Does**: Eliminates the initial dark-room chiaroscuro dimming and pull-chain lamp switch choreography so the Hero page opens immediately in a bright, inviting, museum-lit editorial studio.
- **Key Value**: Preserves full visual clarity and theme consistency (especially in light and dark modes) from the moment the page loads while showcasing the molten *Kintsugi* cube and magnetic shard forge.

---

## 2. User Experience & Visual Design

- **Updated 3-Act Hero Timeline**:
  1. **Act I — Molten *Kintsugi* Cube & Volumetric God-Rays (0.0s – 0.92s)**:
     - The Hero stage is brightly lit by the top-down museum spotlight and floor reflection pool from the start.
     - The 6-faced 3D Gutenberg Cube spins as glowing 24K *Kintsugi* fracture veins and 12 volumetric God-ray cones build up pressure across its seams.
  2. **Act II — Bullet-Time Detonation & Magnetic Shard Forge (0.92s – 1.92s)**:
     - The cube shatters into 32 extruded 3D metallic shards that pause in bullet-time and then split into two magnetic streams—16 curving left to forge *"Research. Think. Publish."* with a golden anvil flash, and 16 spiraling right into the 3D Editorial Desk.
  3. **Act III — Anamorphic Rack-Focus Reveal (1.92s+)**:
     - The camera completes its smooth optical rack focus (`blur(18px) → blur(0px)`) onto the headline and the already-illuminated 3D Editorial Desk as the cinema letterbox bars retract.

---

## 3. Technical Architecture & Changes

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   HeroSection (/app/landing/page.tsx)                      │
├──────────────────────────────────────┬─────────────────────────────────────┤
│  • Remove Chiaroscuro Dark-Room Veil │  • Keep Molten Kintsugi Seams &     │
│  • Keep Museum Spotlight & Floor     │    12 Volumetric God-Ray Cones      │
│    Reflection Pool at steady opacity │  • Keep 32 Magnetic 3D Shards       │
│  • Keep Anamorphic Rack Focus &      │    forging Headline & 3D Desk       │
│    Bullet-Time / Replay Controls     │                                     │
├──────────────────────────────────────┴─────────────────────────────────────┤
│             FloatingEditorialDesk (/components/3d/FloatingEditorialDesk)   │
│  • Remove pullChainGroup (cord, collar, acorn) & spring tug kinematics     │
│  • Remove lampIgnited prop & delayed filament surge state                  │
│  • Keep Banker's Lamp SpotLight, volumetric cone & studio key light steady │
└────────────────────────────────────────────────────────────────────────────┘
```
