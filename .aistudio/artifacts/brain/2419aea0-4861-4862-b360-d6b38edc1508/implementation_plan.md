# Photorealistic Materials & Museum Studio Lighting for the Hero Stage

Upgrade the Landing Page Hero section with physical, photorealistic materials and lighting: **realistic brushed brass metal and embossed 3D cube faces** that fracture into **thick, beveled 3D metallic fragments with specular reflections**, a **photorealistic 3D Editorial Desk** featuring a sculpted **Articulated Brass Banker's Desk Lamp** casting warm directional light and soft shadows, a **warm museum spotlight environment with floor reflections and floating 3D dust motes**, and **live specular light glints** sweeping across the headline and brass edges on hover.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user-confirmed realism upgrades govern this implementation:

- **Confirmed Decision 1 (Physical Materials)**:
  1. **Realistic Brushed Brass Metal & Embossed 3D Cube Faces**: Each of the 6 Gutenberg Cube faces receives multi-layer anisotropic brushed metal sheen, machined chamfered inner bezels, recessed corner hex rivets, and deep letterpress embossing/debossing shadows.
  2. **Photorealistic 3D Editorial Desk with Warm Lamp Light & Shadows**: Upgrade `/components/3d/FloatingEditorialDesk.tsx` with procedural walnut wood grain and pebble-leather blotter bump/roughness textures, plus a multi-part **Articulated Brass & Emerald Glass Banker's Desk Lamp** that casts a real Three.js `SpotLight` (`castShadow: true`) and a soft volumetric light cone across the manuscript and fountain pen.
- **Confirmed Decision 2 (Studio Lighting Environment)**:
  - **Warm Museum Spotlight with Realistic Floor Reflections & Dust Motes**: A top-down museum spotlight cone illuminates the Hero stage, accompanied by a realistic perspective-foreshortened floor reflection plane and 60fps floating 3D golden dust motes drifting through the beam.
- **Confirmed Decision 3 (Physical Animation Realism)**:
  1. **Thick 3D Shards with Specular Reflections on Shatter**: Replace flat 2D dots with multi-layered 3D extruded brass & emerald fragments (`preserve-3d` with front/side bevel thickness and animated metallic specular flash as they tumble).
  2. **Live Specular Light Glints on Headline & Brass Edges**: Moving the cursor sweeps a realistic metallic specular highlight across *"Research. Think. Publish."* and illuminates the chamfered brass edges of the Hero CTA buttons and stage frames.

---

## 1. Overview & Core Concept

- **What It Does**: Brings tactile, museum-grade physical realism to every object in the Hero section. Metal surfaces exhibit anisotropic brushed reflections and machined bevels; the 3D Gutenberg Cube shatters into thick, tumbling metallic ingots and slabs; and the 3D WebGL Editorial Desk is lit by a physical brass banker's lamp casting warm tungsten shadows across grained walnut wood and archival paper.
- **Target Audience / Persona**: Visitors, writers, and editorial leaders evaluating the craft and quality of the platform.
- **Key Value**: Bridges the gap between digital web UI and physical industrial design—making the Hero stage feel like a real, touchable object filmed under studio lights.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Machined Brushed Brass 3D Cube & Thick 3D Fragment Shatter**:
     - Each of the 6 Cube faces displays fine anisotropic brushed-metal grain (`repeating-linear-gradient`), a double-chamfered inner bezel (`inset` highlight + shadow), 4 machined corner hex screws, and a dynamic diagonal specular sheen.
     - On shatter, each face reveals a thick 3D metallic edge rim while **32 Thick 3D Extruded Brass & Emerald Fragments** tumble in 3D space (`rotateX`, `rotateY`, `rotateZ`), flashing bright specular highlights (`#FFFDF7` → `#C8A15A`) as their facets catch the museum spotlight.
  2. **Warm Museum Spotlight, Floor Reflection & 3D Dust Motes**:
     - A warm museum spotlight beam descends from the top canopy onto the Hero stage, casting a soft elliptical floor reflection pool at the base of the viewport while 60fps 3D dust motes drift through the illuminated air.
  3. **Photorealistic 3D Editorial Desk with Banker's Lamp (`FloatingEditorialDesk.tsx`)**:
     - Procedural high-resolution canvas textures generate realistic **walnut wood grain** and **pebble-grain forest leather** roughness/bump maps for the desk plinth and blotter.
     - A multi-part **Articulated Brass Banker's Desk Lamp** (weighted turned-brass base, twin tubular brass arms, emerald glass shade with inner warm emissive bulb, and a real shadow-casting `THREE.SpotLight` + translucent volumetric light cone) sits at the upper-left corner of the desk, bathing the manuscript, brass loupe, and fountain pen in warm 2900K light.
  4. **Live Specular Light Glints on Headline & Brass Edges**:
     - Moving the cursor across the Hero stage drives a real-time specular light glint across the serif letterforms of *"Research. Think. Publish."* and along the brushed-brass borders of the primary CTA and stage cards.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Procedural PBR Bump/Roughness Maps + Real `THREE.SpotLight` in `FloatingEditorialDesk`**
  - *Chosen Approach*: Generate procedural wood-grain and leather-grain textures on HTML5 `<canvas>` at initialization (`Zero External File / 404 Dependencies`) and attach them as `bumpMap`/`roughnessMap` on `MeshStandardMaterial` and `MeshPhysicalMaterial`, illuminated by a shadow-casting `SpotLight` inside the Banker's Lamp shade.
  - *Why*: Delivers unmistakable close-up surface texture and warm tungsten lamp shadows at 60fps with zero network download latency or broken asset URLs.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌───────────────────────────────────────────────────────────────────────────┐
│                   Photorealistic Hero Stage Architecture                  │
├───────────────────────────────────────────────────────────────────────────┤
│  ├─ Museum Spotlight Environment (HeroSection in /app/landing/page.tsx)   │
│  │    ├─ Top-Down Conical Museum Spotlight + Floor Reflection Pool        │
│  │    ├─ 60fps 3D Museum Dust Motes Canvas (drifting through light beam)  │
│  │    └─ Live Cursor-Driven Specular Glint on Headline & Brass Borders    │
│  ├─ Physical Brushed-Brass 3D Cube (HeroShatterCube3D)                    │
│  │    ├─ 6 Embossed Faces (anisotropic grain, chamfer bezel, hex rivets)  │
│  │    └─ 32 Thick 3D Extruded Fragments (preserve-3d + specular flash)    │
│  └─ Photorealistic 3D WebGL Desk (FloatingEditorialDesk.tsx)              │
│       ├─ Procedural Walnut Grain & Pebble Leather Bump/Roughness Maps     │
│       ├─ Multi-Part Articulated Brass & Emerald Glass Banker's Lamp       │
│       └─ Warm 2900K THREE.SpotLight (castShadow) + Volumetric Light Cone  │
└───────────────────────────────────────────────────────────────────────────┘
```
- **Interactive Component & State Mapping**:
  - `HeroDustMotesCanvas`: Renders 55 3D depth-of-field dust motes that brighten when passing through the museum spotlight cone and react to the Cube shatter shockwave.
  - `HeroShatterCube3D`: Upgrades `CUBE_SHATTER_SHARDS` to 3D faceted polygonal ingots (`clipPath` + dual-layer thickness + keyframed specular flash) and adds machined metal textures, corner rivets, and embossed inner frames to all 6 cube faces.
  - `FloatingEditorialDesk`: Adds `createWalnutGrainTexture()`, `createLeatherBumpTexture()`, and the 7-part `lampGroup` (`lampBase`, `lampStem`, `lampJoint`, `lampArm`, `lampShade`, `lampBulb`, `lampVolumetricCone`, and `lampSpotLight`).
