# 📖 शायरी by Shazo (شازیہ)

> **"तहरीर एक खामोश आवाज़ और क़लम हाथ की जबान है।"**  
> *A modern, atmospheric handwritten shayari web experience built with Vite, React, TypeScript, Tailwind CSS, and GSAP.*  
> **शायर / Poet:** شازیہ ("Shazo") • **Portfolio:** [abutalha09.vercel.app](https://abutalha09.vercel.app) • **Route:** NH 48 · कानपुर–मुंबई

---

## 🌟 Architecture & Component Design

The entire website is built with a modern React + TypeScript + Vite architecture adhering to the exact physics, timings, and easing of two flagship interactive components:

### 1. 🧥 ClothingRailHero (`src/components/ui/product-rail-gallery.tsx`)
- **Digital Diary on Brass Hangers:** 59 authentic handwritten notebook pages hanging on a physics-driven horizontal rail with realistic brass/wood clips.
- **Physics Simulation:** Damped harmonic spring physics (`stiffness: 0.055`, `damping: 0.86`, `mass: 1.15`) that react dynamically to pointer drag, velocity, and inertia.
- **Spiral Notebook Paper Aesthetics:** Perforated spiral holes, ruled line paper watermark, authentic Urdu/Hindi handwritten page photos.
- **Front / Back Flip:**
  - **Front:** Authentic handwritten diary page photo (`01.webp` to `59.webp`).
  - **Back:** Clean typed Devanagari Hindi text card for effortless reading and accessibility.
- **Pagination Sets:** 10 pages per set with "सफ़ा 1–10 / 59" and previous/next set navigation.
- **FLIP Modal View:** Click to zoom, inspect handwriting, play audio, toggle favorite, and generate Instagram Story cards.

### 2. 🪐 DishOrbitCarousel (`src/components/ui/dish-orbit-carousel.tsx`)
- **5 Moods Orbiting Wheel:** 5 moods mapped to top-down circular illustrations:
  1. **पहला / इश्क़ (Ishq)** - Rose gold velvet lotus & crescent moon.
  2. **तन्हा / जुदाई (Judaai & Dard)** - Midnight indigo solitary branch and rain mist.
  3. **रात की / चाय (Chai-wali-raatein)** - Hot kulhad clay cup with ambient steam curls.
  4. **रौशन / उम्मीद (Umeed)** - Radiant dawn sunrise of faith over emerald mountains.
  5. **सफ़र / NH 48 (Safar)** - Nocturnal highway headlights curving into the horizon.
- **Bidirectional GSAP ScrollTrigger:** Infinite snap timeline with seamless orbital rotation.
- **Devanagari 2-Weight Title Wiping:** Clean contrast using Google Font "Mukta" (weights 200 Thin to 800 ExtraBold) with directional clip-path wiping (`CLIP_WIPE_OUT_LEFT`, `CLIP_WIPE_IN`).
- **Dynamic Arc Color Morphing:** Background SVG arc dynamically morphs color to match each mood.
- **Chef / Poet Card:** Rating, mood tags, lyrical excerpt, listen button, and "शेर / अल्फ़ाज़" tabs.

### 3. 🌌 Midnight Sky (`src/components/sections/SkySection.tsx`)
- All 59 shayaris mapped to twinkling celestial stars with mood-colored glow rings.
- SVG constellation lines connecting stars of matching moods.
- Interactive hover cards and click-to-listen.

### 4. 📌 Chai Tapri Wall (`src/components/sections/TapriWallSection.tsx`)
- Pinned notes on a rustic highway tapri wall.
- Slight organic rotations (`-2°` to `+2°`) with brass pushpins, paper elevation, and instant mood filtering.

### 5. 🎙️ Floating Music Player & Intelligent "AI पाठ" (Speech Synthesis)
- **Audio File Playback:** Automatically plays recorded voice files (`01.mp3`, etc.) when present.
- **Intelligent Voice Synthesis Fallback:** If an audio recording is not yet present, Web Speech API (`SpeechSynthesis`) automatically activates with natural Hindi voice (`hi-IN`) and rhythmic poetic pace.
- **Waveform & Vinyl Spin:** Rotating record thumbnail and responsive sound equalizer animation.
- **Collapsible Mini-Mode:** Toggle between compact floating pill and expanded control bar.
- **Desktop Keyboard Shortcuts (Hidden on Mobile):**
  - `[SPACE]` Play / Pause
  - `[N]` Next Sher
  - `[P]` Previous Sher
  - `[M]` Mini / Expand Mode
  - `[R]` Random Sher
- **Zero Content Overlap:** Bottom padding added so floating player never obstructs diary content.

### 6. 📱 Instagram Story Card Generator (`src/components/ShareStoryModal.tsx`)
- Generates a full 1080×1920 Instagram Story / WhatsApp status image on HTML5 `<canvas>`.
- One-click Download and native Web Share integration.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn / pnpm

### Installation & Local Run
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

### Production Build
```bash
# Build static bundle to /dist
npm run build

# Preview production build locally
npm run preview
```

The output in `/dist` is 100% client-side and configured with `base: "./"`, meaning it can be deployed on Vercel, Netlify, GitHub Pages, or even viewed locally directly!

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com):
   - Click **Add New Project**.
   - Import your repository.
   - Framework Preset: **Vite**.
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Click **Deploy** — your site will be live globally in seconds!

---

## ✍️ Adding New Shayaris

To add a new shayari:
1. Add your handwritten page image into `images/` (e.g. `images/60.webp` or `images/60.jpg`).
2. (Optional) Add your voice recording into `audio/` (e.g. `audio/60.mp3`). If skipped, the "AI पाठ" voice reader will automatically read the text.
3. Open `src/data/shayari.ts` and append a new entry to the `SHAYARIS_DATA` array:
```ts
{
  id: 60,
  page: 60,
  title: "आपकी नज़्म का उनवान",
  mood: "Chai-wali-raatein", // "Ishq" | "Judaai" | "Dard" | "Umeed" | "Chai-wali-raatein"
  image: "images/60.webp",
  fallbackImage: "images/60.jpg",
  audio: null, // or "audio/60.mp3"
  text: "यहाँ आपकी नज़्म के मुद्रित अल्फ़ाज़ आएँगे...",
  likes: 120
}
```
That's it! Everything in the Digital Diary, 5 Moods Carousel, Midnight Sky, Tapri Wall, and Floating Player is generated dynamically from this data.
