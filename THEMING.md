# Aetheria — Theming & Color System

A complete reference for how theming, color generation, typography, and WCAG compliance
work in this codebase from Shopify Admin all the way to the browser's `:root`.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [The Two-Layer CSS System](#2-the-two-layer-css-system)
3. [Default Theme (tailwind.css)](#3-default-theme-tailwindcss)
4. [Shopify Metaobject Integration](#4-shopify-metaobject-integration)
5. [Theme Generation Pipeline](#5-theme-generation-pipeline)
6. [Color Space: Why OKLCH](#6-color-space-why-oklch)
7. [The Color Module (app/lib/color/)](#7-the-color-module-applibcolor)
8. [WCAG Compliance System](#8-wcag-compliance-system)
9. [Typography System](#9-typography-system)
10. [Shadow System](#10-shadow-system)
11. [Semantic Color Tokens](#11-semantic-color-tokens)
12. [Special-Purpose Color Variables](#12-special-purpose-color-variables)
13. [Swatch Border Algorithm](#13-swatch-border-algorithm)
14. [Offline Theme Persistence](#14-offline-theme-persistence)
15. [How to Customize a Brand](#15-how-to-customize-a-brand)
16. [File Reference Map](#16-file-reference-map)

---

## 1. Architecture Overview

The theming system has three distinct layers that stack on top of each other:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Layer 3: Special-Purpose Tokens                                     │
│  Wishlist, discount badge, sale links, overlays                      │
│  Static — hardcoded in tailwind.css, not overridden by themes        │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 2: Dynamic Brand Theme                                        │
│  Generated from Shopify theme_settings metaobject                    │
│  Injected as <style> in <head> at SSR time                           │
│  Overrides Layer 1 for background, foreground, primary, etc.         │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 1: Default Theme                                              │
│  app/styles/tailwind.css :root { ... }                               │
│  Pure black/white monochromatic baseline                             │
│  Active when no theme_settings metaobject is configured              │
└─────────────────────────────────────────────────────────────────────┘
```

**Key design decision**: The entire theming system is SSR-first. CSS variables are
injected server-side into the HTML `<head>` before the page reaches the browser. There is
no flash of unstyled content, no JavaScript-driven class toggling, and no runtime color
calculations in the browser during page load.

---

## 2. The Two-Layer CSS System

### Layer 1: Static defaults in `tailwind.css`

`app/styles/tailwind.css` defines all CSS variables in `:root` as a complete,
production-ready monochromatic theme. This file is loaded as a static stylesheet.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "lenis/dist/lenis.css";

@custom-variant dark (&:is(.dark *));

:root {
    --background: oklch(1 0 0);   /* pure white */
    --foreground: oklch(0 0 0);   /* pure black */
    --primary:    oklch(0 0 0);
    /* ... all other tokens */
}
```

### Layer 2: Dynamic CSS injected in `<head>`

`app/root.tsx` fetches the `theme_settings` metaobject, runs it through the generation
pipeline, and renders the result directly into the HTML:

```tsx
// app/root.tsx — Layout component
{generatedTheme?.googleFontsUrl && (
    <link rel="stylesheet" href={generatedTheme.googleFontsUrl} />
)}
<link rel="stylesheet" href={tailwindCss} />
{generatedTheme?.cssVariables && (
    <ThemeStyleTag css={generatedTheme.cssVariables} />
)}
```

The injection order is deliberate:
1. **Google Fonts** `<link>` first — fonts must load before layout
2. **Tailwind CSS** stylesheet — loads all defaults
3. **Dynamic theme** `<style>` — overrides defaults with brand colors

Because the dynamic `<style>` tag comes after Tailwind in the cascade, it wins on every
`:root` variable without needing `!important`.

---

## 3. Default Theme (tailwind.css)

The default theme in `app/styles/tailwind.css` is a pure black/white palette using the
OKLCH color space. Every color has been individually audited for WCAG compliance.

### Core Token Map

| Token                  | OKLCH             | HEX       | Role                          |
|------------------------|-------------------|-----------|-------------------------------|
| `--background`         | `oklch(1 0 0)`    | `#ffffff` | Page background               |
| `--foreground`         | `oklch(0 0 0)`    | `#000000` | Primary text                  |
| `--card`               | `oklch(1 0 0)`    | `#ffffff` | Card backgrounds              |
| `--card-foreground`    | `oklch(0 0 0)`    | `#000000` | Text on cards                 |
| `--popover`            | `oklch(1 0 0)`    | `#ffffff` | Dropdowns, tooltips           |
| `--popover-foreground` | `oklch(0 0 0)`    | `#000000` | Text in popovers              |
| `--primary`            | `oklch(0 0 0)`    | `#000000` | Brand action color (buttons)  |
| `--primary-foreground` | `oklch(1 0 0)`    | `#ffffff` | Text on primary backgrounds   |
| `--secondary`          | `oklch(1 0 0)`    | `#ffffff` | Subtle bg, borders            |
| `--secondary-foreground`| `oklch(0 0 0)`   | `#000000` | Text on secondary             |
| `--muted`              | `oklch(1 0 0)`    | `#ffffff` | Disabled/subtle backgrounds   |
| `--muted-foreground`   | `oklch(0 0 0)`    | `#000000` | Placeholder / subdued text    |
| `--accent`             | `oklch(0 0 0)`    | `#000000` | Hover states, highlights      |
| `--accent-foreground`  | `oklch(1 0 0)`    | `#ffffff` | Text on accent backgrounds    |
| `--destructive`        | `oklch(0.55 0.2 25)` | `#c44536` | Errors, warnings, delete   |
| `--border`             | `oklch(0 0 0)`    | `#000000` | Borders, dividers             |
| `--input`              | `oklch(0 0 0)`    | `#000000` | Input borders                 |
| `--ring`               | `oklch(0 0 0)`    | `#000000` | Focus rings                   |

### Layout Variables

```css
--announcement-height: 0px;          /* 32px when visible, managed by PageLayout */
--announcement-gap: 8px;             /* breathing room below announcement bar */
--header-height: 68px;               /* fixed header height (h-17) */
--total-header-height: calc(...);    /* sum of the three above */

--page-breathing-room: clamp(1.5rem, 4vw, 4rem);        /* standard pages */
--page-breathing-room-dense: clamp(2.5rem, 6vw, 6rem);  /* collection/sale pages */

--content-max-width: 100vw;
--container-padding: clamp(0.5rem, 0.75vw, 0.75rem);    /* 8px → 12px responsive */

--radius: 0.5rem;     /* base border-radius for UI components */
--spacing: 0.25rem;   /* base spacing unit */
```

---

## 4. Shopify Metaobject Integration

Theme data comes from a single `theme_settings` metaobject in Shopify Admin. Merchants
configure 5 colors and 3 font families; the system derives everything else.

### GraphQL Fragment

```graphql
# app/lib/metaobject-fragments.ts — THEME_SETTINGS_FRAGMENT
fragment ThemeSettings on Metaobject {
    id
    handle

    # Fonts (Google Font family names)
    # body_font    → --font-sans  (paragraphs, buttons, labels)
    # heading_font → --font-serif (h1–h6, hero text, titles)
    # price_font   → --font-mono  (prices, quantities, codes)
    fontBody:    field(key: "body_font")    { value }
    fontHeading: field(key: "heading_font") { value }
    fontPrice:   field(key: "price_font")   { value }

    # Colors (OKLCH or HEX format)
    # 5 inputs → 15+ derived CSS variables via theme-utils.ts
    colorPrimary:    field(key: "color_primary")    { value }
    colorSecondary:  field(key: "color_secondary")  { value }
    colorBackground: field(key: "color_background") { value }
    colorForeground: field(key: "color_foreground") { value }
    colorAccent:     field(key: "color_accent")     { value }
}
```

### Query

```graphql
# app/lib/metaobject-queries.ts
query ThemeSettings($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    themeSettings: metaobject(handle: {type: "theme_settings", handle: "main"}) {
        ...ThemeSettings
    }
}
```

### Color Validation

Before any color is used in theme generation, it passes through `isValidColor()` in
`app/lib/metaobject-parsers.ts`:

```typescript
function isValidColor(value: unknown): value is string {
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    // Accepts oklch(L C H) or any HEX (#rgb, #rgba, #rrggbb, #rrggbbaa)
    if (trimmed.startsWith("oklch(") && trimmed.endsWith(")")) return true;
    if (/^#([0-9a-fA-F]{3,8})$/.test(trimmed)) return true;
    return false;
}
```

Invalid colors fall back to `FALLBACK_THEME_COLORS` from `app/lib/fallback-data.ts`.

### Fallback Defaults

```typescript
// app/lib/fallback-data.ts
export const FALLBACK_THEME_COLORS = {
    primary:    "oklch(0.2 0 0)",   // #1f1f1f — near black
    secondary:  "oklch(0.9 0 0)",   // #e2e2e2 — light gray
    background: "oklch(1 0 0)",     // #ffffff — pure white
    foreground: "oklch(0.15 0 0)",  // #000000 — near black (clips to black)
    accent:     "oklch(0.45 0 0)"   // #616161 — medium gray
};

export const FALLBACK_THEME_FONTS = {
    sans:  "Inter",
    serif: "Inter",
    mono:  "Inter"
};
```

---

## 5. Theme Generation Pipeline

### Full Data Flow

```
Shopify Admin
    │  merchant sets 5 colors + 3 fonts in theme_settings metaobject
    ↓
root.tsx loader
    │  THEME_SETTINGS_QUERY executed server-side
    ↓
parseSiteContent() → parseThemeSettings()
    │  validates colors, parses font names, falls back to defaults
    ↓
generateTheme(coreColors, fonts)   ← app/lib/theme-utils.ts
    │
    ├── deriveThemeColors(core)
    │     normalizes all inputs to OKLCH strings via normalizeToOklch()
    │     derives card, popover, muted, borders from the 5 core colors
    │     auto-calculates foreground colors via getContrastForeground() (APCA)
    │
    ├── sanitizeFontName(name)
    │     strips non-alphanumeric chars, trims — safe for CSS and URL use
    │
    ├── generateFontFamily(name, type)
    │     builds CSS font-family string with appropriate system fallbacks
    │
    ├── generateGoogleFontsUrl(fonts)
    │     builds Google Fonts URL with variable font ranges
    │
    └── generateThemeCssVariables(derivedColors, fonts)
          produces a complete :root { ... } CSS string

    ↓
Layout component (root.tsx)
    │  <ThemeStyleTag css={cssVariables} /> injected into <head>
    │  <link href={googleFontsUrl} /> injected before Tailwind
    ↓
Browser renders page with brand colors active
    │
    └── useEffect: saveThemeToStorage() → localStorage for offline support
```

### `deriveThemeColors()` in Detail

```typescript
// app/lib/theme-utils.ts
export function deriveThemeColors(core: ThemeCoreColors): DerivedTheme {
    const primary    = normalizeToOklch(core.primary);
    const secondary  = normalizeToOklch(core.secondary);
    const background = normalizeToOklch(core.background);
    const foreground = normalizeToOklch(core.foreground);
    const accent     = normalizeToOklch(core.accent);

    return {
        // Base pair — used as-is from merchant input
        background,
        foreground,

        // Card = same as background; popover = background +0.03L (slightly lighter)
        card:             background,
        cardForeground:   foreground,
        popover:          adjustLightness(background, 0.03),
        popoverForeground: foreground,

        // Primary/secondary — auto-calculated foreground via APCA
        primary,
        primaryForeground:   getContrastForeground(primary),   // white or dark
        secondary,
        secondaryForeground: getContrastForeground(secondary), // white or dark

        // Muted = accent with reduced chroma + pushed toward 0.85–0.92 lightness
        // MutedForeground = foreground lightened by 0.12
        muted:            toMuted(accent),
        mutedForeground:  adjustLightness(foreground, 0.12),
        accent,
        accentForeground: foreground,

        // Borders all derived from secondary color
        border: secondary,
        input:  secondary,
        ring:   primary
    };
}
```

### Color Manipulation Primitives

All manipulation happens in OKLCH:

| Function | Purpose | Formula |
|---|---|---|
| `adjustLightness(color, delta)` | Lighten/darken | `L = clamp(0, L + delta, 1)` |
| `adjustChroma(color, factor)` | Saturate/desaturate | `C = clamp(0, C * factor, 0.4)` |
| `rotateHue(color, degrees)` | Hue shift | `H = (H + degrees) % 360` |
| `toMuted(color)` | Create muted variant | `L = min(0.92, L*0.95+0.1)`, `C = C*0.6` |

---

## 6. Color Space: Why OKLCH

All colors in this codebase are stored and manipulated in **OKLCH**:

```
oklch(L C H / alpha?)
       │ │ └── Hue: 0–360 degrees (same as HSL)
       │ └──── Chroma: 0–~0.4 (perceptual saturation, not a percentage)
       └────── Lightness: 0–1 (perceptually uniform)
```

**Why OKLCH over HSL/RGB:**

- **Perceptually uniform lightness**: Changing `L` by 0.1 always produces the same
  perceived lightness change regardless of hue. HSL lightness is not perceptually uniform.
- **Predictable manipulation**: `adjustLightness(color, 0.1)` always produces a color
  that looks exactly 10% lighter, making programmatic derivation reliable.
- **Better gradient interpolation**: OKLCH gradients don't produce muddy colors through
  the mid-range.
- **CSS native**: CSS Color Level 4 spec includes OKLCH natively, and all modern browsers
  support it without polyfills.
- **colorjs.io support**: The color library used throughout is built by CSS spec editors
  (Lea Verou, Chris Lilley) and has first-class OKLCH support.

### OKLCH ↔ HEX Quick Reference

| OKLCH | HEX | Description |
|---|---|---|
| `oklch(0 0 0)` | `#000000` | Pure black |
| `oklch(1 0 0)` | `#ffffff` | Pure white |
| `oklch(0.2 0 0)` | `#1f1f1f` | Near black |
| `oklch(0.9 0 0)` | `#e2e2e2` | Light gray |
| `oklch(0.45 0 0)` | `#616161` | Medium gray |
| `oklch(0.55 0.2 25)` | `#c44536` | Destructive red |
| `oklch(0.58 0.22 20)` | `#e63946` | Wishlist red |
| `oklch(0.72 0.17 142)` | `#4ead5b` | Success green |
| `oklch(0.63 0.18 245)` | `#4785d1` | Info blue |

### Gamut Mapping

OKLCH can represent colors outside the sRGB gamut (most displays). The codebase handles
this in `app/lib/color/core.ts` via colorjs.io's CSS Color 4 gamut mapping:

```typescript
// Method options: "css" (recommended), "clip", "oklch.c"
// Target options: "srgb" (default), "p3"
```

The `"css"` method preserves hue while reducing chroma until the color is in-gamut —
the most visually faithful approach.

---

## 7. The Color Module (app/lib/color/)

A complete color utility library with 4 files:

```
app/lib/color/
├── index.ts     — Single export point for the entire module
├── types.ts     — All TypeScript interfaces (RGB, OKLCH, Oklab, ContrastResult, ColorPairAudit, etc.)
├── core.ts      — Color.js wrapper: parsing, conversion, manipulation
├── contrast.ts  — WCAG 2.1 + APCA contrast calculations
└── swatch.ts    — Smart border color algorithm for product swatches
```

### `core.ts` — Parsing & Conversion

| Function | Input | Output | Notes |
|---|---|---|---|
| `parseColor(str)` | Any format string | `Color \| null` | Color.js object |
| `isValidColor(str)` | Any format string | `boolean` | Safe null check |
| `toOklch(str)` | Any format | `OKLCH \| null` | `{l, c, h}` object |
| `toSrgb(str)` | Any format | `RGB \| null` | `{r, g, b}` 0–255 |
| `toHex(str)` | Any format | `string \| null` | `#rrggbb` |
| `toOklchString(str)` | Any format | `string \| null` | `"oklch(L C H)"` |
| `isInSrgbGamut(str)` | Any format | `boolean` | Out-of-gamut check |
| `adjustLightness(str, delta)` | OKLCH string | OKLCH string | Clamps 0–1 |
| `adjustChroma(str, factor)` | OKLCH string | OKLCH string | Clamps 0–0.4 |
| `rotateHue(str, degrees)` | OKLCH string | OKLCH string | Wraps 0–360 |
| `toMuted(str)` | OKLCH string | OKLCH string | Reduced C, pushed L |
| `parseOklch(str)` | OKLCH string | `OKLCH \| null` | Lightweight regex parse |
| `hexToRgb(hex)` | `#rrggbb` | `RGB \| null` | `{r, g, b}` 0–255 |
| `rgbToHex(rgb)` | RGB object | `string` | `#rrggbb` |
| `parseColorToRgb(str)` | Any format | `RGB \| null` | Via Color.js |
| `hexToOklch(hex)` | `#rrggbb` | `"oklch(L C H)"` | Legacy compat |
| `normalizeToOklch(str)` | Any format | OKLCH string | Accepts HEX or OKLCH |

Supported input formats: `oklch(...)`, `#fff`, `#ffffff`, `#ffffffaa`, `rgb(...)`,
`hsl(...)`, `color(display-p3 ...)`, named colors (`red`, `blue`, `transparent`).

---

## 8. WCAG Compliance System

### `contrast.ts` — Dual-Algorithm Calculation

**Exported functions:**

| Function | Purpose |
|---|---|
| `calculateContrast(fg, bg, algorithm?)` | Main contrast function (WCAG21 \| APCA \| both) |
| `calculateContrastWithOpacity(fg, bg, opacity, algorithm?)` | Contrast after alpha compositing |
| `ensureContrastCompliance(color, bg, fallback, minRatio?)` | Return color if passing, else fallback |
| `getContrastForeground(bg, options?)` | Auto white or dark text for any background |
| `relativeLuminance(rgb)` | Raw WCAG relative luminance value |
| `contrastRatio(color1, color2)` | Raw ratio from two RGB values |
| `blendWithOpacity(fg, bg, opacity)` | Alpha composite two RGB values |
| `formatContrastComment(fgName, bgName, result)` | Generate inline CSS comment string |
| `auditColorPair(fg, bg)` | Full pair audit — ratio, level, APCA Lc, recommendation |

The codebase implements **both** WCAG 2.1 and APCA:

**WCAG 2.1** (legal compliance, required):
- Formula: `(L1 + 0.05) / (L2 + 0.05)` where L1 > L2
- Thresholds: 4.5:1 normal text, 3:1 large text/UI components, 7:1 for AAA

**APCA — Advanced Perceptual Contrast Algorithm** (design guidance):
- More perceptually accurate than WCAG 2.1 (WCAG 2.1 has ~23% false fails, ~47% false passes)
- Considers font size and weight in its recommendations
- Not yet legally required, but used for design decisions

```typescript
// Both algorithms in one call
const result = calculateContrast("#000000", "#ffffff", "both");
// result.ratio        → 21.0 (WCAG)
// result.wcagLevel    → "AAA"
// result.apca?.Lc     → ~106
// result.apca?.passesBody → true
```

### APCA Lightness Contrast (Lc) Thresholds

| Lc Value | Use Case | Min Font Size |
|---|---|---|
| ≥ 90 | Preferred for body text | 12px |
| ≥ 75 | Minimum for body text | 14px |
| ≥ 60 | Large text (24px+) | 16px |
| ≥ 45 | Headlines, non-body | 24px |
| ≥ 30 | UI elements, icons | 36px |
| ≥ 15 | Placeholder, disabled | 48px |

### WCAG Requirements in This Project

| Content Type | Minimum | WCAG Criterion |
|---|---|---|
| Normal text (< 18pt) | 4.5:1 | 1.4.3 (AA) |
| Large text (≥ 18pt or ≥ 14pt bold) | 3:1 | 1.4.3 (AA) |
| UI components, graphical objects | 3:1 | 1.4.11 (AA) |
| Touch targets | 44×44px | 2.5.5 (A) |
| AAA goal for body text | 7:1 | 1.4.6 (AAA) |

Every color pair in `tailwind.css` has an inline WCAG comment:

```css
/* foreground on background = 21.00:1 (WCAG AAA) ✓ */
--background: oklch(1 0 0);
--foreground: oklch(0 0 0);
```

### `ensureContrastCompliance()` — The WCAG Guard

Used whenever merchant-supplied colors (from Shopify's brand API or metaobjects) may not
meet WCAG requirements:

```typescript
// app/lib/color/contrast.ts
const safeColor = ensureContrastCompliance(
    merchantPrimary,  // Color from Shopify (may fail)
    "#ffffff",        // Background color
    "#1f1f1f",        // WCAG-safe fallback
    4.5               // Minimum ratio (default)
);
// Returns merchantPrimary if ratio ≥ 4.5, otherwise returns fallback
```

### Auto-Calculated Foregrounds

The `getContrastForeground()` function in `contrast.ts` automatically picks white or
dark text for any background. It uses APCA when available:

```typescript
const WHITE_FOREGROUND = "oklch(1 0 0)";         // pure white
const DARK_FOREGROUND  = "oklch(0.25 0.02 45)";  // dark brown-tinted near-black

// Prefers APCA comparison, falls back to WCAG luminance
const fg = getContrastForeground("oklch(0.3 0.15 20)");
// → "oklch(1 0 0)" because the dark red background needs white text
```

This is what `deriveThemeColors()` uses for `primaryForeground` and `secondaryForeground`
— no merchant has to manually specify what text color goes on their primary button.

---

## 9. Typography System

### CSS Variables

```css
--font-sans:  Inter, ui-sans-serif, sans-serif, system-ui;  /* default */
--font-serif: Inter, ui-sans-serif, sans-serif, system-ui;
--font-mono:  Inter, ui-sans-serif, sans-serif, system-ui;
```

All three default to Inter (neutral base). When a brand configures `theme_settings`:

```css
/* Generated by generateThemeCssVariables() after merchant sets fonts */
--font-sans:  "Lato", ui-sans-serif, system-ui, sans-serif;
--font-serif: "Playfair Display", ui-serif, Georgia, serif;
--font-mono:  "Fira Code", ui-monospace, SFMono-Regular, monospace;
```

### Metaobject → CSS Variable Mapping

| Metaobject field | CSS variable | Typical usage |
|---|---|---|
| `body_font` | `--font-sans` | Paragraphs, buttons, labels, UI text |
| `heading_font` | `--font-serif` | h1–h6, hero text, section titles |
| `price_font` | `--font-mono` | Prices, quantities, codes, tabular data |

### Google Fonts URL Generation

```typescript
// app/lib/theme-utils.ts — generateGoogleFontsUrl()
// Variable font syntax for sans:
// family=Lato:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900

// Fixed weights for serif:
// family=Playfair+Display:ital,wght@0,400..800;1,400..800

// Fixed weights for mono:
// family=Fira+Code:wght@400;500;600;700

// Combined URL:
// https://fonts.googleapis.com/css2?family=Lato:...&family=Playfair+Display:...&display=swap
```

Font names are sanitized before use — only `[a-zA-Z0-9\s\-_]` characters are accepted.

---

## 10. Shadow System

Shadows in this codebase are brand-tinted using CSS relative color syntax:

```css
/* tailwind.css */
--shadow-color: oklch(0 0 0);  /* default pure black for monochromatic theme */

--shadow-xs: 0.125rem 0.125rem 0 0
    oklch(from var(--shadow-color) l c h / 0.06);

--shadow-sm:
    0.125rem 0.125rem 0 0
        oklch(from var(--shadow-color) l c h / 0.11),
    0.125rem 0.0625rem 0.125rem -0.0625rem
        oklch(from var(--shadow-color) l c h / 0.11);
```

The `oklch(from var(--shadow-color) l c h / 0.06)` syntax uses CSS relative colors to
apply opacity to the shadow-color variable. This means opacity changes don't require new
variables — just adjust the final `/ alpha` value.

### Brand-Tinted Shadow Color Generation

```typescript
// app/lib/theme-utils.ts — deriveThemeShadowColor()
function deriveThemeShadowColor(colors: DerivedTheme): string {
    const pr = parseOklch(colors.primary);
    const fg = parseOklch(colors.foreground);

    // Use primary hue if brand has notable chroma (C > 0.05)
    // Otherwise try foreground, then fall back to pure black
    const source = pr && pr.c > 0.05 ? pr : fg && fg.c > 0.02 ? fg : null;

    if (!source) return "oklch(0 0 0)"; // pure black for achromatic themes

    return toOklch({
        l: 0.5,                          // mid lightness
        c: Math.min(0.05, source.c * 0.25), // very subtle brand tint
        h: source.h                       // same hue as brand primary
    });
}
```

The result: a brown/navy/green-tinted shadow depending on brand hue, at barely perceptible
chroma. Shadows feel "of the brand" without competing with content.

### Shadow Scale

| Variable | Usage | Offsets |
|---|---|---|
| `--shadow-xs` | Subtle lift, tags | `0.125rem 0.125rem` |
| `--shadow-sm` | Cards, inputs | `0.125rem` + blur |
| `--shadow` | Default (same as sm) | Same as sm |
| `--shadow-md` | Modals, popovers | `0.25rem` blur |
| `--shadow-lg` | Drawers, overlays | `0.375rem` blur |
| `--shadow-xl` | Full-page overlays | `0.625rem` blur |

---

## 11. Semantic Color Tokens

These tokens follow the shadcn/ui naming convention and map to Tailwind classes like
`bg-primary`, `text-primary-foreground`, etc.

### Status Colors (Fixed, Not Overridden by Brand Theme)

```css
/* Success */
--success: oklch(0.72 0.17 142);           /* #4ead5b — green */
--success-foreground: oklch(1 0 0);         /* white */
--success-on-dark: oklch(0.88 0.16 145);   /* #a8e5b2 — light green for dark bg */
--success-on-dark-foreground: oklch(0.25 0.08 142); /* 8.42:1 AAA ✓ */

/* Warning */
--warning: oklch(0.79 0.17 75);            /* #d4a84a — amber */
--warning-foreground: oklch(0.25 0.02 60); /* 5.12:1 AA ✓ */

/* Info */
--info: oklch(0.63 0.18 245);              /* #4785d1 — blue */
--info-foreground: oklch(1 0 0);           /* 4.52:1 AA ✓ */

/* Destructive */
--destructive: oklch(0.55 0.2 25);         /* #c44536 — red */
--destructive-foreground: oklch(1 0 0);    /* 4.91:1 AA ✓ */
```

### Overlay Colors

```css
--overlay-dark:        oklch(0 0 0 / 0.3);   /* Modal/drawer backdrops */
--overlay-light:       oklch(1 0 0 / 0.1);   /* Light overlays on images */
--overlay-light-hover: oklch(1 0 0 / 0.2);   /* Hover state of light overlays */
```

---

## 12. Special-Purpose Color Variables

These variables are hardcoded in `tailwind.css` and intentionally not part of the
brand theme system — they're UI-semantic colors that must stay consistent.

### Primary Button Active State

```css
/* State flow: Default (light) → Hover (primary) → Active (primary-active) */
--primary-active: oklch(0 0 0);  /* Same as pure black in default theme */
```

### Wishlist Active Colors

```css
/* Warm red — universally recognized "loved/saved" state */
/* Distinct from destructive (danger/delete) */
--wishlist-active: oklch(0.58 0.22 20);       /* #e63946 — 4.15:1 on white ✓ */
--wishlist-active-foreground: oklch(1 0 0);   /* White text on wishlist red */
--wishlist-active-hover: oklch(0.52 0.22 20); /* #cc2f3c — 5.48:1 on white ✓ */
```

### Discount Badge Colors (Emerald Theme)

```css
/* Luxurious dark emerald with shimmer text */
--discount-bg: oklch(0.2 0.08 160 / 0.8);    /* #022c22 at 80% opacity (emerald-950) */
--discount-icon-bg: oklch(0.27 0.1 160);      /* #064e3b (emerald-900) */
--discount-text: oklch(0.84 0.16 160);        /* #86efac (emerald-300) — 9.62:1 AAA ✓ */
--discount-shimmer-start: oklch(0.76 0.18 160); /* #4ade80 (emerald-400) */
--discount-shimmer-mid: oklch(0.95 0.05 160); /* #ecfdf5 (emerald-50) — 15.8:1 AAA ✓ */
```

### Sale Link Text Colors

```css
/* Emerald for SALE links on light backgrounds */
--sale-text: oklch(0.6 0.17 160);      /* #059669 (emerald-600) — 4.52:1 AA ✓ */
--sale-text-hover: oklch(0.53 0.16 160); /* #047857 (emerald-700) — 5.91:1 AA ✓ */
```

---

## 13. Swatch Border Algorithm

Product color swatches need borders that contrast with both the swatch itself AND the
parent page background. `app/lib/color/swatch.ts` implements a smart selection algorithm.

### The Problem

A white swatch on a white background disappears. A dark swatch also needs a border, but
a white border would blend with the background. The naive solution (always use a dark
border) fails for very dark swatches.

### The Algorithm

```typescript
// app/lib/color/swatch.ts — getSwatchBorderColor()
// 1. Pre-compute 13 border candidates (pure black to pure white)
// 2. Calculate WCAG contrast: candidate vs swatch AND candidate vs background
// 3. Score = min(contrast_with_swatch, contrast_with_background)
// 4. Select candidate with highest score
// 5. Fallback to luminance heuristic if no candidate passes 3.0:1 minimum
```

### Border Candidates (13 shades)

```
#000000 → #1a1a1a → #1f1f1f → #333333 → #4a4a4a → #666666 → #737373
→ #8c8c8c → #a3a3a3 → #c0c0c0 → #d4d4d4 → #e5e5e5 → #ffffff
```

### WCAG 1.4.11 Non-text Contrast

The minimum contrast for UI components (including swatch borders) is 3:1 against adjacent
colors. The algorithm ensures this requirement is met.

### Smart Variant

`getSmartSwatchBorderColor()` additionally accepts `themeColors` context and an
`onPrimaryBackground` flag — used when swatches appear over the brand primary color
(e.g., in a hero section) rather than the page background.

### Additional Swatch Utilities

| Function | Purpose |
|---|---|
| `isLightSwatchColor(swatchColor)` | Returns `true` if the swatch OKLCH lightness > 0.5 |
| `validateSwatchVisibility(swatchColor, bg, minContrast?)` | Full validation: `{isValid, contrastRatio, recommendation}` |

---

## 14. Offline Theme Persistence

Since the site is a PWA with a service worker, it must display brand-consistent styling
even when the network is unavailable.

### Storage Mechanism

```typescript
// app/lib/theme-storage.ts
// Key: "hydrogen-theme-cache"
// Value: JSON { theme: GeneratedTheme, timestamp: number }
// Expires: Never (always shows most recent theme)
```

### Flow

1. User visits site → theme loaded from Shopify → CSS injected server-side
2. On mount (client-side): `saveThemeToStorage(data.generatedTheme)` writes to localStorage
3. `updateOfflinePageCache()` sends `postMessage` to service worker asking it to re-fetch
   `/offline` with the new theme CSS now baked into the HTML
4. Network goes offline → user navigates → SW serves `/offline` from cache
5. Offline page reads `getThemeFromStorage()` → applies brand colors

### Error Boundary Theme Recovery

The `ErrorBoundary` component in `root.tsx` also reads localStorage for the cached theme
and injects it manually via `document.head.appendChild()` — ensuring even error pages
display brand colors:

```typescript
// root.tsx ErrorBoundary
const theme = getThemeFromStorage();
if (theme?.cssVariables) {
    const styleEl = document.createElement("style");
    styleEl.id = "error-boundary-theme";
    styleEl.textContent = theme.cssVariables;
    document.head.appendChild(styleEl);
}
```

---

## 15. How to Customize a Brand

### Step 1: Configure `theme_settings` in Shopify Admin

Create a `theme_settings` metaobject with handle `main` and set:

| Field key | Type | Example |
|---|---|---|
| `color_primary` | Single line text | `oklch(0.35 0.18 30)` |
| `color_secondary` | Single line text | `oklch(0.9 0.05 75)` |
| `color_background` | Single line text | `oklch(0.98 0.01 80)` |
| `color_foreground` | Single line text | `oklch(0.15 0.02 30)` |
| `color_accent` | Single line text | `oklch(0.55 0.14 30)` |
| `body_font` | Single line text | `Lato` |
| `heading_font` | Single line text | `Playfair Display` |
| `price_font` | Single line text | `Fira Code` |

Colors can be entered as OKLCH (`oklch(L C H)`) or HEX (`#rrggbb`).

### Step 2: Derived Colors Are Automatic

You don't need to specify:
- `--card`, `--popover` — derived from `background`
- `--primary-foreground` — auto-calculated for WCAG contrast (APCA)
- `--secondary-foreground` — auto-calculated for WCAG contrast (APCA)
- `--muted`, `--muted-foreground` — derived from accent
- `--border`, `--input`, `--ring` — derived from secondary and primary
- `--shadow-color` — derived from primary hue

### Step 3: Fallback Without Metaobject

If no `theme_settings` metaobject exists, `generateTheme()` returns `null` and the
static defaults in `tailwind.css` remain active (pure black/white theme). The site
works out of the box without any configuration.

### Step 4: Test Contrast

Before deploying a brand theme:

1. **Convert OKLCH to HEX**: Use https://oklch.com
2. **Check contrast**: Use https://contrast-ratio.com or browser DevTools
3. **Minimum requirements**:
   - Body text on background: ≥ 4.5:1
   - Large headings: ≥ 3:1
   - Buttons/UI components: ≥ 3:1

The codebase provides `ensureContrastCompliance()` for runtime checks if merchant colors
fail WCAG — use it when rendering merchant-supplied colors that could be arbitrary:

```typescript
import {ensureContrastCompliance} from "~/lib/color";

const safeColor = ensureContrastCompliance(
    merchantColor,
    background,
    fallbackColor,
    4.5
);
```

---

## 16. File Reference Map

| File | Purpose |
|---|---|
| `app/styles/tailwind.css` | Default theme CSS variables, all animations, layout variables |
| `app/lib/theme-utils.ts` | Color derivation, CSS generation, font URL building |
| `app/lib/theme-storage.ts` | localStorage persistence for offline PWA support |
| `app/lib/color/index.ts` | Single import point for all color utilities |
| `app/lib/color/core.ts` | Color.js wrapper: parse, convert, manipulate |
| `app/lib/color/contrast.ts` | WCAG 2.1 + APCA dual contrast calculations |
| `app/lib/color/swatch.ts` | Smart swatch border color algorithm |
| `app/lib/color/types.ts` | TypeScript interfaces (RGB, OKLCH, Oklab, ContrastResult, APCAResult, ContrastAlgorithm, SwatchBorderOptions, GamutMapOptions, SwatchVisibilityResult, ColorPairAudit) |
| `app/lib/metaobject-fragments.ts` | GraphQL fragment: `THEME_SETTINGS_FRAGMENT` |
| `app/lib/metaobject-queries.ts` | GraphQL query: `THEME_SETTINGS_QUERY` |
| `app/lib/metaobject-parsers.ts` | `parseSiteContent()`, `parseThemeSettings()`, all field-level parsers |
| `app/lib/fallback-data.ts` | All default/fallback values: `FALLBACK_THEME_COLORS`, `FALLBACK_THEME_FONTS`, `FALLBACK_SITE_SETTINGS`, `FALLBACK_PRODUCT_CONTENT`, `FALLBACK_CART_CONTENT`, `FALLBACK_ACCOUNT_CONTENT`, `FALLBACK_SEARCH_CONTENT`, `FALLBACK_UI_MESSAGES`, `FALLBACK_ERROR_CONTENT`, `FALLBACK_WISHLIST_CONTENT` |
| `app/root.tsx` | Orchestrates everything: query → generate → inject into `<head>` |

---

## Quick Reference: Key Functions

```typescript
// Generate a complete theme from 5 colors + 3 fonts
import {generateTheme} from "~/lib/theme-utils";
const theme = generateTheme(coreColors, fonts);
// → { colors, fonts, googleFontsUrl, cssVariables }

// Check WCAG/APCA contrast
import {calculateContrast} from "~/lib/color";
const result = calculateContrast("#000", "#fff", "both");
// → { ratio: 21, passesAA: true, apca: { Lc: 106 } }

// Ensure merchant color is safe
import {ensureContrastCompliance} from "~/lib/color";
const safe = ensureContrastCompliance(merchantColor, bg, fallback, 4.5);

// Convert any color to OKLCH
import {normalizeToOklch, toHex} from "~/lib/color";
const oklch = normalizeToOklch("#8B4513"); // → "oklch(0.40 0.12 45)"
const hex   = toHex("oklch(0.6 0.1 240)"); // → "#3b7ab3"

// Smart swatch border
import {getSmartSwatchBorderColor} from "~/lib/color";
const border = getSmartSwatchBorderColor({
    swatchColor: "#f5f5dc",
    backgroundColor: "#ffffff",
    isSelected: false
});
```
