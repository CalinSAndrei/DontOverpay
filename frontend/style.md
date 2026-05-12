# style.md — Signal Design System

DontOverpay dashboard. Dark, precise, monitoring-terminal energy. Desaturated teal on near-OLED black. Not crypto. Not SaaS. A sharp personal tool.

---

## Color System (OKLCH)

All colors use OKLCH. Neutrals are tinted toward the accent hue (chroma 0.008–0.014) to feel intentional, not lifeless.

### Base Palette

| Token | OKLCH | Hex approx | Role |
|---|---|---|---|
| `bg-base` | `oklch(5.5% 0.010 195)` | `#060B0B` | Page background |
| `bg-surface` | `oklch(9% 0.012 193)` | `#0D1414` | Card surface |
| `bg-elevated` | `oklch(13% 0.013 191)` | `#141D1D` | Raised / hover card |
| `bg-input` | `oklch(11% 0.011 192)` | `#101919` | Form inputs |
| `border-subtle` | `oklch(20% 0.014 190)` | `#1E2C2C` | Default borders, dividers |
| `border-accent` | `oklch(30% 0.040 185)` | `#1E3B3B` | Accent-tinted border |

### Accent — Desaturated Teal

| Token | OKLCH | Hex approx | Role |
|---|---|---|---|
| `accent` | `oklch(72% 0.115 185)` | `#3DC8C0` | Primary interactive, highlights |
| `accent-dim` | `oklch(56% 0.080 185)` | `#2A8E8A` | Secondary / disabled accent |
| `accent-glow` | `oklch(72% 0.115 185 / 0.12)` | — | Diffused shadow / halo |
| `accent-surface` | `oklch(72% 0.115 185 / 0.07)` | — | Tinted surface on hover |

### Text

| Token | OKLCH | Role |
|---|---|---|
| `text-primary` | `oklch(90% 0.008 195)` | Main content, product names |
| `text-secondary` | `oklch(55% 0.012 192)` | Labels, store names, meta |
| `text-tertiary` | `oklch(35% 0.010 190)` | Timestamps, placeholders |
| `text-accent` | `oklch(72% 0.115 185)` | Accent text (links, tags) |

### Semantic — Price Delta

| Token | OKLCH | Role |
|---|---|---|
| `price-down` | `oklch(68% 0.130 155)` | Price decrease (muted green) |
| `price-down-bg` | `oklch(68% 0.130 155 / 0.08)` | Drop badge background |
| `price-up` | `oklch(65% 0.115 30)` | Price increase (muted amber-red) |
| `price-up-bg` | `oklch(65% 0.115 30 / 0.08)` | Rise badge background |

---

## Typography

Fonts loaded via `@fontsource/geist` and `@fontsource/geist-mono`.

```css
--font-sans: 'Geist', system-ui, sans-serif;
--font-mono: 'Geist Mono', monospace;
```

### Scale

| Usage | Class | Note |
|---|---|---|
| Page title | `text-2xl font-semibold tracking-tight` | Geist |
| Section label | `text-[10px] uppercase tracking-[0.18em] font-medium` | Eyebrow tag, text-secondary |
| Product name | `text-sm font-medium` | Geist |
| Price (large) | `text-2xl font-semibold tabular-nums` | Geist Mono — always monospace |
| Price (list) | `text-base font-medium tabular-nums` | Geist Mono |
| Delta badge | `text-xs font-medium tabular-nums` | Geist Mono |
| Body / meta | `text-xs` | text-secondary |
| Input | `text-sm` | Geist |

**Rule:** Every number rendered in the UI uses `font-mono` and `tabular-nums`. No exceptions.

---

## Layout

### Page Shell

```
min-h-[100dvh] bg-[--bg-base]
max-w-7xl mx-auto px-6 py-8
```

### Grid — Z-Axis Cascade (Product List)

Product cards stack with increasing x-offset and depth shadow, creating physical layering. The topmost card is perfectly aligned; each card beneath shifts 4px right and 4px down with a slightly lighter shadow.

```
card-0: translate-x-0   translate-y-0   (foreground)
card-1: translate-x-1   translate-y-1   opacity slightly lower
card-2: translate-x-2   translate-y-2   opacity lower still
```

On click/expand, the selected card breaks out of the stack using `layoutId` for a shared-element transition to the detail view.

### Split Layout (Detail View)

When a product is selected:
- Left: `w-[320px] shrink-0` — product list sidebar
- Right: `flex-1` — price history chart + product detail

Mobile (`< 768px`): single column stack, sidebar collapses to a scrollable row at the top.

---

## Component Architecture

### Cards — Double-Bezel

Every card uses nested enclosures:

```html
<!-- Outer shell -->
<div class="rounded-[1.5rem] p-[1.5px] bg-[--border-subtle] ring-1 ring-white/[0.04]">
  <!-- Inner core -->
  <div class="rounded-[calc(1.5rem-1.5px)] bg-[--bg-surface] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
    <!-- Content -->
  </div>
</div>
```

### Navigation — Floating Pill

Detached from the top edge. Does not span full width.

```
mt-6 mx-auto w-max rounded-full
bg-[--bg-surface]/80 backdrop-blur-xl
border border-[--border-subtle]
px-6 py-3
```

### Buttons — Primary

```
rounded-full px-5 py-2.5
bg-accent text-bg-base font-medium text-sm
hover: bg-accent/90 active:scale-[0.98]
transition: cubic-bezier(0.32, 0.72, 0, 1) 200ms
```

### Buttons — Ghost

```
rounded-full px-5 py-2.5 text-sm text-secondary
hover: bg-[--accent-surface] text-accent
transition: cubic-bezier(0.32, 0.72, 0, 1) 200ms
```

### Price Delta Badge

```
inline-flex items-center gap-1
rounded-full px-2 py-0.5 text-xs font-mono tabular-nums
-- drop: bg-[--price-down-bg] text-[--price-down]
-- rise: bg-[--price-up-bg]   text-[--price-up]
```

### Dividers

Use `border-t border-[--border-subtle]` for section splits. Never use `<hr>`. No side-stripe borders.

### Empty State

Centered in the content area. Large muted icon (Phosphor Light weight), one line of text in `text-secondary`, one ghost button CTA. No card wrapper around it.

---

## Motion

### Easing

```css
--ease-spring: cubic-bezier(0.32, 0.72, 0, 1);   /* entry, expand */
--ease-exit:   cubic-bezier(0.4, 0, 1, 1);         /* exit, collapse */
```

Framer Motion spring config for layout transitions:
```js
{ type: "spring", stiffness: 120, damping: 20, mass: 1 }
```

### Entry Animation (cards, content blocks)

```
initial:  { opacity: 0, y: 12, filter: 'blur(4px)' }
animate:  { opacity: 1, y: 0,  filter: 'blur(0px)' }
transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
```

Stagger children: `staggerChildren: 0.06`

### Product Card Stack

Cards in the list use `layoutId` keyed by product id. When a product is selected, its card morphs into the detail view header via shared element transition.

### Chart Entry

Price history chart lines draw in from left to right using `pathLength` animation:
```js
initial: { pathLength: 0, opacity: 0 }
animate: { pathLength: 1, opacity: 1 }
transition: { duration: 1.2, ease: [0.32, 0.72, 0, 1] }
```

---

## Iconography

Library: `@phosphor-icons/react` — use `weight="light"` uniformly. Size: `16` for inline, `20` for standalone actions.

No filled icons except for the brand mark / logo dot.

---

## Chart (Recharts)

```js
// Stroke
stroke: "var(--accent)"
strokeWidth: 1.5

// Dots
dot: false
activeDot: { r: 4, fill: "var(--accent)", strokeWidth: 0 }

// Grid
CartesianGrid: stroke="var(--border-subtle)" strokeDasharray="4 4"

// Axes
tick: { fill: "var(--text-tertiary)", fontSize: 11, fontFamily: "Geist Mono" }
axisLine: false
tickLine: false

// Tooltip
Custom tooltip: bg-[--bg-elevated], border border-[--border-subtle],
                rounded-xl, shadow-lg, font-mono for values

// Area fill (optional)
fillOpacity: 0.06, fill: "var(--accent)"
```

---

## Tailwind Config Additions

```js
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      sans: ['Geist', 'system-ui', 'sans-serif'],
      mono: ['Geist Mono', 'monospace'],
    },
    borderRadius: {
      'xl2': '1.5rem',
      'xl3': '2rem',
    },
    transitionTimingFunction: {
      'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
      'exit':   'cubic-bezier(0.4, 0, 1, 1)',
    }
  }
}
```

---

## Bans (project-specific)

- No purple, no blue, no gradients on text
- No filled card backgrounds using white/gray on dark — use the double-bezel system only
- No circular spinner loaders — use skeleton shimmer matching layout dimensions
- No `border-left` accent stripes
- No `box-shadow` with color (use `shadow-[--accent-glow]` diffusion only)
- No emoji anywhere
