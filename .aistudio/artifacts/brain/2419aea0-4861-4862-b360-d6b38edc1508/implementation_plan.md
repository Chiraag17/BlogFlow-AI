# Login & Signup Background and UI Simplification Plan

## Overview
We will refine the Login & Signup experience (`/login` and `/signup`) to feature an atmospheric **Warm Ambient Brass Spotlight** background with subtle depth and dramatically declutter the interface by unboxing the 3D Gutenberg cube, removing all decorative technical/foundry jargon, and adopting clean, everyday labels.

---

## 1. Atmospheric Background Upgrade
- **Warm Ambient Brass Spotlight**: Replace the flat square grid with a layered atmospheric backdrop featuring:
  - A soft, multi-layered warm radial spotlight (`#C8A15A` brushed brass and deep forest emerald `#163F32` glow) positioned behind the 3D cube and authentication card to create natural visual depth.
  - Smooth cursor-reactive ambient lighting that gently shifts warmth across the canvas as the user moves their pointer.
  - Subtle vignette framing and soft architectural light falloff (with crisp support for both Light and Dark themes).

## 2. Unboxed 3D Cube Stage & Decluttered Left Column
- **Unbox the 3D Cube**: Remove the heavy bordered pedestal box around the 3D Gutenberg Type-Block cube so it floats naturally over the warm brass spotlight with subtle orbital rings and a soft ambient plinth shadow.
- **Remove All Unnecessary Words & Telemetry**:
  - Strip out `MATRIX FACE · I (MONOGRAM)`, `STAMP PULSE · 00`, `Movable-Type Matrix · Sign In`, `CLICK CUBE TO ROTATE`, the 5-face numeral index bar (`I · Monogram / II · Loupe...`), `FOLIO I · ATELIER ENTRY`, and the bottom hex/cipher row (`ALLOY: #163F32 · COMPLETION · CIPHER: AES-GCM`).
  - Strip out the noisy bottom colophon footer bar (`COLOPHON · GUTENBERG TYPE-BLOCK EDITION...`) and header subtitle (`EST. 1450 · TYPE FOUNDRY`).
- **Short, Focused Welcome Copy**: Pair the floating interactive 3D cube with a concise 1-line serif heading and a brief 1-sentence subtitle:
  - **Sign In**: *"Welcome back."* — *"Sign in to continue to your writing studio."*
  - **Sign Up**: *"Create your account."* — *"Start drafting and publishing in your personal studio."*
  - **Forgot Password**: *"Reset your password."* — *"Verify your email to set a new password."*

## 3. Clean Form Card with Simple Everyday Labels
- **Remove Card Header Telemetry**: Remove the `PRESS REGISTER · LOGIN` and `CUBE SYNC: MONOGRAM` top bar inside the card, as well as the `FACE II · LOUPE` and `FACE V · SILCROW` side tags next to input labels.
- **Everyday Human Labels & Buttons**:
  - Tabs: **Sign In** and **Sign Up**
  - Inputs: **Full Name**, **Email**, **Password**, **Confirm Password**
  - Links & Actions: **Forgot password?**, **Sign In**, **Create Account**, **Try Demo Account** (clean 1-click guest login), and **Google** / **GitHub** buttons.
  - Forgot Password Steps: Clean, plain-language steps (*"Reset Password"* $\rightarrow$ *"Enter 6-Digit Code"* $\rightarrow$ *"Set New Password"* $\rightarrow$ *"Password Updated"*).
- **Preserved 3D Cube Interactivity**: The 3D Gutenberg cube will continue to smoothly rotate faces as you focus different fields or switch between Sign In, Sign Up, and Reset Password, and gently pulse as you type.
