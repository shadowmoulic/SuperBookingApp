# UI & Styling Guidelines - ZeQue

This document establishes design principles, Tailwind CSS guidelines, colors, typography, layouts, and animation standards for the **ZeQue** client.

---

## 1. Visual Theme & Color Palette

To mirror a "heritage-meets-technology" motif, ZeQue uses a refined, high-contrast color scheme derived from standard design tokens:

### Core Palette (Mint Gold Theme)
- **Primary**: `#006B55` (Light: Deep Mint Green) / `#46F1C5` (Dark: Bright Mint Green). Custom classes: `bg-primary`, `text-primary`. Used for brand elements, key CTAs, and active states.
- **Primary Container**: `#00D4AA` (Accent). Custom class: `bg-primary-container`. Used for highlights and accents.
- **Secondary**: `#5D5E61` (Light: Slate Gray) / `#C8C6C5` (Dark: Silver). Custom classes: `bg-secondary`, `text-secondary`. Used for secondary text, labels, and borders.
- **Tertiary / Gold Accent**: `#805600` (Light) / `#FFD08B` (Dark). Custom classes: `bg-tertiary`, `text-tertiary`. Used for ratings, badges, and warning highlights.
- **Background / Surface**: `#F8F9FA` (Light) / `#051424` (Dark: Deep Obsidian Navy). Custom classes: `bg-background`, `bg-surface`, `bg-surface-container-lowest`, `text-on-surface`. Used for containers, cards, and page backdrops.

> [!WARNING]
> Text rendered over images (such as hero slideshow overlays or background cards) must use default/hardcoded white (`text-white`) or slate colors to ensure consistent readability, rather than theme-variable colors.

### Usage Example (Boilerplate from Home.jsx)
Here is a boilerplate example of how these semantic variables are applied in code using Tailwind CSS classes:

```jsx
// Example from frontend/src/pages/Home.jsx
export function BoilerplateExample() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-md">
      <h3 className="font-bold text-on-surface hover:text-primary transition-colors">
        Destination Title
      </h3>
      <p className="text-on-surface-variant text-sm">
        Explore heritage sites...
      </p>
      <button className="bg-primary text-on-primary hover:bg-opacity-95 font-semibold px-5 py-2.5 rounded-lg text-sm">
        Book Now
      </button>
    </div>
  );
}
```

### Rules
- Never use raw primary browser colors (plain red, plain blue, plain green). Use curated gradients or matching tone shades (e.g. emerald for success, crimson for danger).
- Keep background gradients smooth and subtle.

---

## 2. Layout & Spacing Rules

- **Max Width**: Keep page content centered and constrained using:
  ```html
  class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full"
  ```
- **Sticky Headers**: The `Navbar` must be sticky:
  ```html
  class="fixed top-0 left-0 w-full z-50 shadow-sm transition-all duration-300"
  ```
- **Mobile First Spacing**: Use responsive spacing margins:
  - Mobile: `py-4 px-4`
  - Desktop: `py-12 px-12` (or equivalent padding utilities).

---

## 3. Typography Hierarchy

ZeQue loads Google Fonts (e.g., *Outfit* for headings, *Inter* or *Roboto* for body texts):
- **Hero Headings**: `font-display text-4xl md:text-6xl font-extrabold tracking-tight`
- **Section Titles**: `font-display text-2xl md:text-3xl font-bold`
- **Body Text**: `font-sans text-sm md:text-base leading-relaxed`
- **Button Texts**: `font-sans font-semibold uppercase tracking-wider`

---

## 4. Micro-Interactions & Animations

An interface that feels responsive and alive encourages interaction. Developers must include micro-animations:
- **Hover Scale**: Card containers, checkout buttons, and interactive listings must respond to cursor hovers:
  ```html
  class="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
  ```
- **Tap Feedback**: Active click actions must animate down slightly:
  ```html
  class="active:scale-95 transition-transform"
  ```
- **Skeletal Shimmers**: Fetch actions must display shimmery skeleton panels during loading states:
  ```css
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  ```
- **Page Transitions**: Wrap routes in clean fade-in or slide-up transitions using pure CSS or Framer Motion.