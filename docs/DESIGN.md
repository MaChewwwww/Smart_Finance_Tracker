# DESIGN.md - The Aurora Glass Bento Design System

This document establishes the official design guidelines and aesthetic specifications for the **Smart Finance Tracker**. The core design direction is **Aurora Glass Bento**—a high-contrast, premium, dark-obsidian-first aesthetic that pairs translucent glassmorphic components with vibrant, glowing neon accents and organic background animations.

---

## 1. Aesthetic Pillar: Aurora Glass Bento

### The Glassmorphic Bento Grid
- **Obsidian Dark Surfaces**: Deep slate and space tones serve as the base interface backdrop to provide exceptional contrast for financial charts and neon states.
- **Glass Containers**: Content cards, sidebars, and dialogue boxes are styled as frosted glass panels (`backdrop-blur-md`) with ultra-fine double-layered borders and semi-transparency.
- **Glowing Auroras**: Out-of-focus, slow-pulsating color blobs drift in the background, providing organic depth and modern visual appeal.
- **Dynamic Bento Layout**: Modular grid cards that resize and re-flow dynamically based on screen real estate, expanding slightly or glowing when hovered.

---

## 2. Color System

To achieve premium fidelity, the design system utilizes specialized HSL tokens instead of standard browser primaries.

### Light Mode Foundations
```txt
Primary Accent:   hsl(221.2 83.2% 53.3%)   /* Deep Cobalt Blue */
Success/Income:   hsl(142.1 76.2% 36.3%)   /* Emerald Green */
Warning/Remind:   hsl(47.9 95.8% 51.2%)    /* Warm Gold */
Destructive/Debt: hsl(0 84.2% 60.2%)       /* Vivid Crimson */
App Background:   hsl(220 45% 95.5%)       /* Rich Slate-Blue (Deeper Contrast) */
Glass Surface:    rgba(243, 248, 255, 0.75)/* Cool Blue-White Glass Tint */
Border:           rgba(59, 130, 246, 0.16) /* Soft Blue Accent Border */
Text Primary:     hsl(224 71.4% 4.1%)      /* Midnight Slate */
Text Muted:       hsl(215.4 16.3% 40%)     /* Slate Grey */
```

### Dark Mode (Obsidian) Foundations
```txt
Primary Accent:   hsl(210 40% 98%)         /* Clean Frost */
Success/Income:   hsl(142.1 70.6% 45.3%)   /* Neon Emerald */
Warning/Remind:   hsl(47.9 95.8% 51.2%)    /* Aurora Amber */
Destructive/Debt: hsl(0 84.2% 60.2%)       /* Crimson Glow */
App Background:   hsl(224 71.4% 4.1%)      /* Space Obsidian */
Glass Surface:    hsl(224 71.4% 4.1% / 0.6)/* Translucent Obsidian */
Border:           hsl(223 47% 15% / 0.8)   /* Dark Steel */
Text Primary:     hsl(210 40% 98%)         /* Silver White */
Text Muted:       hsl(215.4 16.3% 56.9%)   /* Muted Slate */
```

---

## 3. Typography Rules

### Typography Restrictions
- **NO Default Italic Fonts**: Italic weights are prohibited as they disrupt clean, professional readability. Blockquotes must be styled with robust, thick vertical accent borders and bold font faces.
- **NO Thin Fonts**: Font weights below `400` (such as `font-thin` or `font-light`) are banned. All elements must use `medium` (500), `semibold` (600), or `bold` (700) to ensure high readability and a punchy visual feel.
- **Font Face**: Geist Sans (sans-serif) for all general UI, labels, numbers, and inputs.

### Scale Hierarchy
- **Page Titles**: `text-3xl`, font-bold, tracking-tight.
- **Section Headers**: `text-xl`, font-semibold.
- **KPI Value Figures**: `text-3xl` or `text-4xl`, font-bold, tracking-tight.
- **Card Header Labels**: `text-xs`, font-bold, uppercase, tracking-wider, text-muted.
- **Standard Body & Tables**: `text-sm`, font-medium.
- **Badges & Tooltips**: `text-xs`, font-semibold.

---

## 4. UI Patterns & Layout Guidelines

### Navigation Shell & Theme Control
- **Theme Control**: Implemented `next-themes` dynamic toggling. The application defaults to dark mode (Obsidian). A client-side `ThemeToggle` button (showing a gold sun in dark mode and an indigo moon in light mode) is positioned in the headers.
- **Desktop**: Fixed sidebar navigation featuring glass borders, profile avatar card at the top, and logout trigger at the bottom. The top header renders a dynamic `ServerTime` clock component and the `ThemeToggle` button on the right.
- **Mobile**: Top navbar with a backdrop blur containing the `ThemeToggle` button, notification alert icon, and a hamburger button triggering a slide-out glass sheet containing the sidebar items.

### Bento Card Layout
All dashboard widgets use `.glass-card` containing:
- Semi-transparent border (`border-white/10` or `border-slate-800/80`).
- Backdrop filter blur (`backdrop-blur-md`).
- Interactivity: Scale transitions and shadow glows on hover.

### Component Guidelines
- **Buttons**:
  - Primary: Glowing background gradients (`from-blue-600 to-indigo-600` or `from-blue-500 to-emerald-500`).
  - Outline: Glowing accent borders that light up on focus.
- **Forms**:
  - Deep obsidian fields with clean border transitions.
  - No thin placeholders.
- **Progress Meters**:
  - Smooth rounded tracks with glowing colored indicator bars.
- **Tables**:
  - Sleek, borders-only tables with alternating row hover changes.

---

## 5. Showcase Strategy

To showcase this design system, the application maintains a dedicated design showroom at the `/design-system` route. This interactive dashboard contains live previews of theme color swatches, Geist typography hierarchy, button states, glowing glass containers, and animated loaders—demonstrating our pixel-perfect implementations.
