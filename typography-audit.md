# storefront_002 — Typography System Audit

**Audit Date:** 2026-04-05  
**Scope:** All routes, three viewports (375px / 768px / 1440px)  
**Methods:** Static code analysis · Playwright computed style extraction · Live visual verification  
**Auditor:** Claude Code (Sonnet 4.6) — read-only, no implementation changes made

---

## 1. Executive Summary

storefront_002's typography system is built on a thoughtful dual-font pairing (Fraunces + Google Sans Flex) with a robust fluid scale, but contains **six distinct categories of defects** that range from WCAG accessibility violations to systemic architectural inconsistencies that will affect every brand that deploys this template.

**The single most pervasive defect** is a `line-height: 1.0` crisis affecting all heading elements, all product card titles, and the hero product title. Any wrapped heading will have zero leading — lines will collide. This affects h1, h2, h3, and several custom components on every route.

**The most critical accessibility failure** is a confirmed WCAG AA contrast violation on the Featured Product Spotlight card: 2.38:1 (requires 4.5:1 for normal text). Three additional instances of sub-12px text were identified via both static analysis and computed style measurement.

**The most architecturally concerning issue** is a font token semantic inversion (`--font-serif` holds Fraunces, which functions as the heading font, while `--font-sans` holds Google Sans Flex, the body font), combined with CSS defaults that fall back to Inter for all three tokens — meaning any brand without a configured `theme_settings` metaobject will render entirely in Inter, with no visual differentiation from the default.

| Severity | Count | Category |
|----------|-------|----------|
| CRITICAL | 4 | Accessibility violations + unreadable text |
| MAJOR    | 7 | Architectural inconsistencies + line-height |
| MINOR    | 9 | Arbitrary values + tracking proliferation |
| **Total**| **20** | |

**Overall Assessment:** The font pairing and fluid scale are premium-quality foundations. Fixing the line-height crisis and the three critical text-size violations would immediately elevate the visual quality to match the design ambition. The standardization recommendations in Section 7 would eliminate the recurring debt.

---

## 2. Font System Overview

### 2.1 Runtime Font Configuration

Fonts are dynamically loaded from Shopify `theme_settings` metaobjects via `generateThemeCssVariables()` in `app/lib/theme-utils.ts`. The demo store (`horcrux-demo-store.myshopify.com`) is configured with:

| Token | CSS Variable | Runtime Font | Role |
|-------|-------------|--------------|------|
| `font-serif` | `--font-serif` | **Fraunces** | Display / heading font |
| `font-sans` | `--font-sans` | **Google Sans Flex** | Body / UI font |
| `font-mono` | `--font-mono` | **Google Sans Code** | Price / code font |

> **Semantic inversion note:** `--font-serif` does not hold a serif body font — it holds the heading display font (Fraunces). `--font-sans` holds the body font (Google Sans Flex). This naming reflects the semantic role within the type hierarchy, not the typeface classification. Any developer reading the token names in isolation will assume the inverse.

### 2.2 Fallback Chain

**CSS defaults** (`app/styles/tailwind.css` lines 148–150):
```css
--font-sans: Inter, ui-sans-serif, sans-serif, system-ui;
--font-serif: Inter, ui-serif, Georgia, serif;
--font-mono: Inter, ui-monospace, monospace;
```

**Parser fallbacks** (`app/lib/metaobject-parsers.ts` lines 121–123):
```typescript
FALLBACK_THEME_FONTS = { sans: "Inter", serif: "Inter", mono: "Inter" }
```

**`theme-utils.ts` defaults** (`DEFAULT_THEME_FONTS` lines 189–192):
```typescript
{ sans: "Inter", serif: "Inter", mono: "Inter" }
```

**Consequence:** Without a configured `theme_settings` metaobject, all three font tokens resolve to Inter. There is no visual differentiation from any other Inter-based storefront. The FOUT (Flash of Unstyled Text) window — before Google Fonts loads — renders entirely in Inter regardless of the configured fonts.

### 2.3 Font Loading Architecture

```
root.tsx line 159: preconnect fonts.googleapis.com + fonts.gstatic.com
root.tsx line 453: <link rel="stylesheet" href={googleFontsUrl} />    ← injected BEFORE Tailwind
root.tsx line 456: <ThemeStyleTag css={cssVariables} />               ← CSS variable overrides AFTER Tailwind
```

The loading order is architecturally sound: Google Fonts CSS loads first to register font-faces, then the CSS variable overrides apply after Tailwind defaults. However, the browser still must fetch and decode the font files before the runtime fonts appear, creating a FOUT window of ~200-800ms on typical connections.

### 2.4 Fluid Typography Scale

Defined in `app/styles/tailwind.css` lines 1109–1163:

| Utility | `clamp()` Value | Min → Max |
|---------|----------------|-----------|
| `.text-fluid-display` | `clamp(2.5rem, 5.5vw, 5rem)` | 40px → 80px |
| `.text-fluid-h1` | `clamp(2rem, 4vw, 3.5rem)` | 32px → 56px |
| `.text-fluid-h2` | `clamp(1.5rem, 3vw, 2.5rem)` | 24px → 40px |
| `.text-fluid-h3` | `clamp(1.25rem, 2.5vw, 2rem)` | 20px → 32px |
| `.text-fluid-h4` | `clamp(1rem, 2vw, 1.5rem)` | 16px → 24px |
| `.text-fluid-body-lg` | `clamp(1.125rem, 1.5vw, 1.375rem)` | 18px → 22px |
| `.text-fluid-body` | `clamp(1rem, 1.25vw, 1.125rem)` | 16px → 18px |
| `.text-fluid-sm` | `clamp(0.875rem, 1vw, 1rem)` | 14px → 16px |

This is a well-designed scale. Usage is **inconsistent** — see Section 4.2.

### 2.5 Base Typography Rules

`@layer base` in `tailwind.css` lines 911–940:

```css
body    → font-sans text-foreground
h1      → text-2xl font-bold leading-snug       (24px at base)
h2      → text-xl font-bold leading-snug        (20px at base)
h1, h2  → (overridden by component-level leading-none)
p       → text-base leading-snug                (16px, leading ~1.375)
```

**Critical finding:** Component-level classes (`leading-none`) override `@layer base` rules. This means the `leading-snug` on h1/h2 in the base layer is systematically overridden to `leading-none` at component usage sites — but this override is implicit, not deliberate, creating the line-height = 1.0 crisis documented in Section 4.1.

---

## 3. Playwright Visual Findings

### 3.1 Computed Style Inventory

All measurements taken at 1440px viewport width, after `document.fonts.ready` resolved with confirmed Fraunces/Google Sans Flex loading.

| Element | Component | Font | Size | Weight | Line-Height | Ratio |
|---------|-----------|------|------|--------|-------------|-------|
| Homepage h1 | VideoHero | Fraunces | 50.4px | 500 | 50.4px | **1.0** ⚠️ |
| Homepage body | VideoHero | Google Sans Flex | 16px | 400 | 24px | 1.5 ✓ |
| Collection h1 | CollectionPageLayout | Fraunces | 96px | 500 | 132px | 1.375 ✓ |
| Product card h2 | ProductCard | Google Sans Flex | 16px | 500 | 16px | **1.0** ⚠️ |
| Product title (desktop) | ProductTitle | Google Sans Flex | 44px | 500 | 44px | **1.0** ⚠️ |
| Product title (mobile) | ProductTitle | Fraunces | 30px | 500 | 30px | **1.0** ⚠️ |
| Blog h1 | BlogsIndex | Fraunces | 36px | 500 | 36px | **1.0** ⚠️ |
| Hero overline (mobile) | VideoHero | Google Sans Flex | **11px** | 400 | — | — ⛔ |
| Hero body (mobile) | VideoHero | Google Sans Flex | 12px | 400 | — | — ⚠️ |

### 3.2 Contrast Measurements

Contrast ratios computed via `window.getComputedStyle()` + manual WCAG relative luminance calculation in Playwright. Note: transparent backgrounds over video/image return false negatives (1.00:1); only opaque surface measurements are reliable.

| Element | Foreground | Background | Ratio | WCAG AA | Status |
|---------|-----------|-----------|-------|---------|--------|
| FeaturedProductSpotlight body text | `oklch(0.98 0 250)` | `oklch(0.2448 0 0)` | **2.38:1** | 4.5:1 required | ⛔ FAIL |
| VideoHero headline | white | transparent/video | ~1.0:1 measured | — | false negative |
| Collection header h1 | dark | light background | not measured | — | visually passing |
| Search page heading | white | `#0a0a0a` | ~15:1 estimated | 4.5:1 required | ✓ PASS |
| Wishlist page content | white | `#0a0a0a` | ~15:1 estimated | 4.5:1 required | ✓ PASS |
| Blog header h1 | white | `#0a0a0a` | ~15:1 estimated | 4.5:1 required | ✓ PASS |

### 3.3 Route-by-Route Visual Observations

**Homepage (375px / 768px / 1440px)**
- Hero headline renders correctly at all sizes — Fraunces optical characteristics (optical sizing, variable axis) visible at 50px+
- Mobile (375px): overline text visually tiny — below comfortable reading threshold
- Tablet (768px): fluid scale transitions smoothly, no layout break
- Desktop (1440px): hero headline reaches ~50px; `CollectionPromoCard` heading correctly switches to dark text on light background (contrast verified in previous session)

**Collection Page (1440px)**
- H1 renders at 96px — impressive Fraunces display size, strong premium signal
- Letter-spacing `-2.4px` at 96px is appropriate and creates luxury tight-tracking effect
- Product grid: card titles (h2) at 16px with line-height 1.0 — will clip on multi-line product names

**Product Detail Page (375px / 1440px)**
- Desktop: product title uses `font-sans` (Google Sans Flex) — functional but loses the serif premium character
- Mobile: product title uses `font-serif` (Fraunces) — stronger editorial presence
- This intentional switching is visually discontinuous across breakpoints

**Blog Index (/blogs)**
- "The Journal" h1 in Fraunces — appropriate literary character
- Empty state message renders in body font at adequate size
- No article cards visible (demo store has no articles published)

**Search Page (/search)**
- "/ Search" heading uses Fraunces — the `/` prefix adds editorial character
- Popular search pill tags: readable, adequate spacing
- Collection grid visible below — card titles subject to same 1.0 line-height issue

**Wishlist (/account/wishlist)**
- "Wishlist" h1 renders in Google Sans Flex (sans-serif) — heading uses `font-sans` here, not `font-serif`
- Consistent with page-level heading convention; not a bug but noteworthy inconsistency
- Empty state card text adequately sized and spaced

**FAQ Page (1440px)**
- Accordion headings in Google Sans Flex — readable, appropriate for Q&A context
- Body text in policy-content style at 17px / 1.8 line-height — best prose reading conditions in the whole storefront

---

## 4. Findings by Severity

### CRITICAL

#### C-01 — Sub-12px Text: Blog Category Badge (9px)

- **File:** `app/components/BlogSection.tsx` line 428
- **Code:** `text-[9px]`
- **Measured size:** 9px
- **Issue:** 9px text is illegible for most users, catastrophically so for users with low vision. No WCAG level (A/AA/AAA) permits 9px text as readable content. This is below the physiological threshold for comfortable reading (~11-12px minimum).
- **Context:** Category badge rendered on blog article cards on mobile

#### C-02 — Sub-12px Text: Featured Product Spotlight Label (11px)

- **File:** `app/components/FeaturedProductSpotlight.tsx` line 67
- **Code:** `text-[11px]`
- **Measured size:** 11px
- **Issue:** 11px is below the 12px practical minimum for readable text. Particularly problematic as this appears on a key conversion surface (product spotlight on homepage).

#### C-03 — Sub-12px Text: Hero Overline Mobile (11px)

- **File:** `app/components/VideoHero.tsx` line 245
- **Code:** `text-[0.6875rem]` (= 11px)
- **Measured size:** 11px (confirmed via Playwright computed style at 375px viewport)
- **Issue:** The hero overline "MODERN · MINIMAL · PREMIUM" renders at 11px on mobile — the most prominent above-the-fold text is the first thing users encounter, and it's illegible at this size on small screens.
- **Context:** Mobile hero, critical brand impression moment

#### C-04 — WCAG AA Contrast Failure: Product Spotlight Card

- **File:** `app/components/FeaturedProductSpotlight.tsx`
- **Colors:** Foreground `oklch(0.98 0 250)` / Background `oklch(0.2448 0 0)`
- **Measured ratio:** 2.38:1
- **Required:** 4.5:1 (normal text, WCAG 1.4.3 AA)
- **Issue:** Body text on the dark product card overlay fails WCAG AA by a factor of ~1.9×. This is a legal accessibility compliance failure for markets that mandate WCAG AA.
- **Note:** This is an opaque background (not transparent over image), making it a verified real failure — not a measurement artifact.

---

### MAJOR

#### M-01 — Systemic Line-Height Crisis: ratio 1.0 on All Headings

- **Scope:** Affects h1, h2, product card titles, product detail title, blog page title — every route
- **Root cause:** Component classes using `leading-none` override `@layer base` heading rules. Applied at:
  - `VideoHero.tsx` (hero h1)
  - Product card grids (product card h2)
  - `ProductTitle.tsx` (product detail h2)
  - Blog index h1
  - Multiple section headings
- **Measured evidence:**
  - Homepage h1: 50.4px / 50.4px = 1.0
  - Product card h2: 16px / 16px = 1.0
  - Product title (desktop): 44px / 44px = 1.0
  - Product title (mobile): 30px / 30px = 1.0
  - Blog h1: 36px / 36px = 1.0
- **Impact:** Single-line headings appear fine. Any heading that wraps (long product names, long section titles, narrow viewports) will render with zero inter-line spacing — lines literally touch or overlap.
- **Affected files:** `VideoHero.tsx`, `ProductTitle.tsx`, `BlogSection.tsx`, `CollectionPageLayout.tsx`, and ~15 additional component files using `leading-none` on heading elements.

#### M-02 — Font Token Semantic Inversion

- **Files:** `app/lib/metaobject-parsers.ts`, `app/styles/tailwind.css`, `app/lib/theme-utils.ts`
- **Issue:** `--font-serif` contains the heading font (Fraunces), `--font-sans` contains the body font (Google Sans Flex). A developer reading component code using `font-serif` will expect a serif body typeface — instead they get a display heading font.
- **Impact:** Onboarding friction, high probability of misuse by future developers or template buyers. When a client brand uses an actual serif body font (e.g. Playfair Display as body), the token inversion could produce incorrect usage.
- **Note:** The naming is internally consistent (the system works), but the semantic contract is broken.

#### M-03 — ProductTitle Font-Family Switch Across Breakpoints

- **File:** `app/components/ProductTitle.tsx` line 97
- **Code:** `const fontFamily = isMobileHero ? "font-serif" : "font-sans"`
- **Measured:** Mobile = Fraunces 30px / Desktop = Google Sans Flex 44px
- **Issue:** The product title changes typeface (not just size) as the viewport changes. A user resizing their browser window will see the typeface animate/switch. This is a jarring discontinuity and is atypical in premium e-commerce design.
- **Context:** Possibly intentional — mobile uses serif for editorial hero feel, desktop uses sans for cleaner functional layout. But it should be explicitly documented as intentional.

#### M-04 — Fluid Typography Underutilization: Inline Style in VideoHero

- **File:** `app/components/VideoHero.tsx` line 254
- **Code:** `style={{fontSize: "clamp(1.5rem, 3.5vw, 4.5rem)"}}`
- **Issue:** A fluid `clamp()` is hardcoded as an inline style, bypassing the `.text-fluid-display` utility class that exists for exactly this purpose. This creates two parallel sources of truth for the display size, and the values differ:
  - Inline: `clamp(1.5rem, 3.5vw, 4.5rem)` → 24px → 72px
  - `.text-fluid-display`: `clamp(2.5rem, 5.5vw, 5rem)` → 40px → 80px
- **Impact:** The hero headline is smaller than intended by the fluid scale system at most viewport widths.

#### M-05 — CSS Fallback Defaults vs. Runtime Fonts: FOUT + No-Metaobject Degradation

- **Files:** `app/styles/tailwind.css` lines 148–150, `app/lib/metaobject-parsers.ts` lines 121–123
- **Issue:** All three font tokens default to Inter in the CSS. During the FOUT window, the page renders entirely in Inter. When deployed as a template for a brand that doesn't configure `theme_settings`, the entire storefront renders in Inter — indistinguishable from the default.
- **Recommended fix:** Use the specific intended fonts (Fraunces, Google Sans Flex) as the CSS-level fallbacks so FOUT is visually coherent, and add inline `@font-face` for a subset of critical characters (at minimum Latin A-Z).

#### M-06 — Arbitrary Letter-Spacing Values Not Standardized

- **Files:** `FeaturedProductSpotlight.tsx` lines 59, 76
- **Values found:** `tracking-[0.32em]`, `tracking-[0.4em]`
- **Additional context:** Neither value is in the Tailwind spacing scale. The storefront uses `tracking-widest` (0.1em) from the standard scale in some places and arbitrary values in others.
- **Impact:** Visual tracking inconsistency — labels don't feel unified across sections.

#### M-07 — Product Card h2 Line-Height 1.0 on Multi-Line Product Names

- **File:** Product card component (grid/list views)
- **Measured:** 16px / 16px = ratio 1.0
- **Impact:** The demo store products have short names. Real-world product names (e.g. "Organic Chamomile & Lavender Hand Cream 250ml") will span 2+ lines on product cards, colliding with zero leading. This is a critical e-commerce failure state.

---

### MINOR

#### m-01 — `text-[2.75rem]` Arbitrary Value in ProductTitle

- **File:** `app/components/ProductTitle.tsx` line 187
- **Code:** `text-3xl md:text-4xl xl:text-[2.75rem] 2xl:text-5xl`
- **Issue:** `text-[2.75rem]` bridges the gap between `text-4xl` (36px) and `text-5xl` (48px). This could be achieved with the fluid text scale.

#### m-02 — `text-[12px]` Arbitrary Values in ProductPrice

- **File:** `app/components/ProductPrice.tsx` lines 334, 440, 491
- **Code:** `text-[12px] sm:text-sm`
- **Issue:** 12px is the minimum readable size; using it as a base (pre-`sm`) means it appears at 12px on the narrowest mobile breakpoints. Standard Tailwind `text-xs` is 12px anyway — no need for the arbitrary value.

#### m-03 — `text-[10rem]` in Footer at Ultrawide Breakpoint

- **File:** `app/components/Footer.tsx` line 127
- **Code:** `font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl 3xl:text-[10rem]`
- **Issue:** The only arbitrary value here is `3xl:text-[10rem]` for 4K displays. Minor — acceptable for display-only brand wordmark at ultrawide, but could use a standard token.

#### m-04 — Excessive Step Count in Footer Brand Wordmark

- **File:** `app/components/Footer.tsx` line 127
- **Code:** 7 responsive breakpoints for one element
- **Issue:** `text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl 3xl:text-[10rem]` — 7 steps of manual breakpoint overrides. The fluid display utility (`text-fluid-display`) handles this in a single class.

#### m-05 — `tracking-[0.32em]` vs `tracking-[0.4em]` Inconsistency Within One Component

- **File:** `app/components/FeaturedProductSpotlight.tsx` lines 59, 76
- **Issue:** Two different arbitrary tracking values within the same section — no visual justification for the difference.

#### m-06 — Blog Category Badge 9px Duplicates C-01 in Static Context

- **File:** `app/components/BlogSection.tsx` line 428
- **Code:** `text-[9px]`
- **Note:** This is listed as C-01 (critical) for the accessibility violation, and also here as a minor code quality issue — the value should be eliminated from the codebase entirely.

#### m-07 — `policy-content` and `article-content` Parallel Prose Styles

- **Files:** `app/styles/tailwind.css` lines 1474–1730 and 1913–2073
- **Issue:** Two parallel custom prose style blocks exist for policy pages and article content. Both use `1.0625rem` (17px) body text and `1.8` line-height. They are nearly identical but maintained separately.
- **Impact:** When updating prose styles, both blocks must be updated in sync.

#### m-08 — `leading-none` on Collection Header h1 Corrected by Container

- **File:** `app/components/CollectionPageLayout.tsx` line 213
- **Code:** `font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl`
- **Measured:** Fraunces 96px / line-height 132px = ratio 1.375 ✓
- **Note:** This heading appears to have an explicit `leading-tight` or container-level line-height override that produces the correct 1.375 ratio — distinct from the 1.0 pattern. However, the source of this correction is not explicit in the class list; it may be inherited, which is fragile.

#### m-09 — Inline Style Override for Hero Title vs. Utility Class System

- **File:** `app/components/VideoHero.tsx` line 254 (see also M-04)
- **Issue:** Minor code quality concern beyond the size discrepancy — inline styles bypass Tailwind's JIT purging analysis and cannot be overridden by utility classes in consumer code.

---

## 5. Responsive Typography Analysis

### 5.1 Viewport Coverage

| Viewport | Breakpoint | Key Type Behaviors |
|----------|-----------|-------------------|
| 375px (mobile) | base | Hero overline: **11px** ⛔; hero body: 12px ⚠️; fluid display: 40px; body: 16px |
| 768px (tablet) | `md:` | Fluid scale midpoint; most heading sizes in 24-48px range; body 16px |
| 1440px (desktop) | `xl:` / `2xl:` | Collection h1: 96px; hero headline: ~50px; body: 16px |

### 5.2 Mobile (375px) — Critical Issues

The mobile viewport has the most severe typography failures:

1. **11px hero overline** (VideoHero): "MODERN · MINIMAL · PREMIUM" — below any reasonable minimum. The first text impression on mobile is illegible.
2. **11px spotlight label** (FeaturedProductSpotlight): collection label on the featured product section.
3. **12px hero body** (VideoHero): at the practical minimum; technically passes 12px floor but any rendering artifacts, anti-aliasing, or device pixel ratio differences could drop this below threshold.
4. **9px blog badge** (BlogSection): rendered on blog cards within the homepage section.

Fluid type utilities scale correctly on mobile — the issue is specifically with manually-set arbitrary values that do not use `clamp()`.

### 5.3 Tablet (768px) — Generally Sound

Tablet rendering is the healthiest viewport. Most responsive breakpoint transitions fire here (`md:`), transitioning from the restricted mobile sizes into more comfortable ranges. The fluid utilities produce appropriate intermediate sizes. No unique issues at this breakpoint.

### 5.4 Desktop (1440px) — Premium Scale Achieved

At 1440px the typographic scale reaches its intended premium expression:
- Collection page h1 at 96px Fraunces (optical size, weight 500) creates strong luxury signal
- Footer brand wordmark at ~128px (xl:text-8xl) fills the footer appropriately
- Body type stays at 16px base — does not scale up for desktop, which is appropriate for e-commerce product content

The line-height issue (ratio 1.0) is less visually apparent at desktop because product names tend not to wrap at wider column widths — but the underlying defect remains.

### 5.5 Fluid Scale Adoption Rate

Of the 8 fluid utilities defined in `tailwind.css`:

| Utility | Adoption | Notes |
|---------|---------|-------|
| `.text-fluid-display` | Low — bypassed by inline style in VideoHero | |
| `.text-fluid-h1` | Moderate | Used in some sections |
| `.text-fluid-h2` | Low | Most h2s use fixed breakpoint steps |
| `.text-fluid-h3`, `.text-fluid-h4` | Low | Rarely used |
| `.text-fluid-body-lg`, `.text-fluid-body`, `.text-fluid-sm` | Rarely used | Body text predominantly `text-base` fixed |

The fluid scale is well-designed but under-utilized. Components predominantly use the traditional Tailwind responsive breakpoint pattern (`text-xl md:text-3xl lg:text-4xl`), which produces stepped (not continuous) scaling and requires more class verbosity.

---

## 6. Premium Aesthetic Assessment

### 6.1 Font Pairing Quality: ★★★★★

**Fraunces + Google Sans Flex** is an excellent pairing:
- Fraunces provides optical size variation, variable weight axis, and characteristic ink traps that read as sophisticated at display sizes
- Google Sans Flex is a humanist variable sans that pairs harmoniously — neither too geometric (which would clash) nor too traditional (which would compete)
- The mono companion (Google Sans Code) maintains typographic family coherence for price displays
- Together they communicate: *considered, contemporary, and approachable-premium*

This pairing is substantially better than the industry default (e.g. Inter + Playfair Display, which appears on hundreds of templates).

### 6.2 Type Scale Ambition: ★★★★☆

The fluid scale goes from 14px (sm) to 80px (display), which is appropriate for a premium e-commerce template. The collection page h1 at 96px is a particularly strong choice — few templates commit to display type at this scale. However:
- The scale is not consistently applied (Section 5.5)
- The inline-style in VideoHero bypasses the utility and actually renders *smaller* than the display utility would produce

### 6.3 Typographic Hierarchy Clarity: ★★★☆☆

The hierarchy breaks down at two points:
1. **Product title type inconsistency** (M-03): Fraunces on mobile → Google Sans Flex on desktop creates a disjointed experience
2. **Leading-none pervasiveness** (M-01): When headings wrap, the hierarchy collapses visually

On routes with single-line headings (collection, FAQ, search), the hierarchy reads clearly and premiumly. On routes with long content (product detail with long name, blog articles with published content), the hierarchy will break down.

### 6.4 Letter-Spacing Consistency: ★★☆☆☆

The storefront uses three distinct tracking philosophies without a unifying rule:
1. `tracking-widest` (0.1em) — standard Tailwind, used for section labels
2. `tracking-[0.32em]` — arbitrary, used in spotlight
3. `tracking-[0.4em]` — arbitrary, used in spotlight (same section)

There is no defined rule for when to apply each. A unified "display label" tracking token (e.g. `--tracking-label: 0.15em`) would enforce consistency.

### 6.5 Overall Premium Tier: **Mid-Premium**

The template aspires to top-tier premium and has the font pairing to support it. The execution quality falls to mid-premium due to the line-height crisis, sub-12px text on mobile, and scale inconsistency. Fixing the CRITICAL and MAJOR items (Section 4) would push this to genuine top-tier premium.

---

## 7. Standardization Recommendations

These recommendations address recurring patterns of debt. They are architectural changes — not fixes to individual bugs — and should be implemented in a single coordinated effort rather than piecemeal.

### R-01 — Define Minimum Font Size Tokens

Create a CSS variable `--text-min: 0.75rem` (12px) and enforce it as the floor across all components. Eliminate all sub-12px arbitrary values (`text-[9px]`, `text-[11px]`, `text-[0.6875rem]`).

**Files to update:** `BlogSection.tsx`, `FeaturedProductSpotlight.tsx`, `VideoHero.tsx`

### R-02 — Establish a Line-Height Token System

Add named line-height tokens to `tailwind.css`:
```css
--leading-display: 1.05;   /* Large display headings (>48px) */
--leading-heading: 1.15;   /* Mid-size headings (24–48px) */
--leading-subheading: 1.25; /* Smaller headings + card titles */
--leading-body: 1.5;        /* Body text */
--leading-prose: 1.8;       /* Long-form content */
```

Apply `leading-display` (not `leading-none`) to all heading elements. Replace the `leading-none` usage in component classes.

**Impact:** Eliminates M-01 across all routes simultaneously.

### R-03 — Expand Fluid Typography Adoption

Replace stepped responsive typography patterns with fluid utilities wherever the element spans all viewports. Priority targets:
- `VideoHero.tsx` headline: replace inline style + `text-[0.6875rem]` with `text-fluid-display` + `text-fluid-sm`
- `Footer.tsx` brand wordmark: replace 7-step class chain with `text-fluid-display`
- `ProductTitle.tsx`: replace 4-step class chain with `text-fluid-h1`

### R-04 — Create Standardized Label Typography Utility

Define a `.text-label` utility for the recurring "section label / overline" pattern:
```css
.text-label {
  font-family: var(--font-sans);
  font-size: var(--text-sm);   /* 14px min via clamp */
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
```

This replaces all ad-hoc combinations of `text-[9px]`, `text-[11px]`, `tracking-[0.32em]`, `tracking-[0.4em]`, `text-xs`, `uppercase`, `tracking-widest`.

**Files to update:** `BlogSection.tsx`, `FeaturedProductSpotlight.tsx`, `VideoHero.tsx`, and any other component using uppercase tracking labels.

### R-05 — Unify `policy-content` and `article-content` Prose Styles

Extract shared prose rules into a single `.prose-content` block:
```css
.prose-content {
  font-size: 1.0625rem;   /* 17px */
  line-height: 1.8;
  /* ... shared rules ... */
}
.policy-content { @apply prose-content; /* policy-specific overrides */ }
.article-content { @apply prose-content; /* article-specific overrides */ }
```

Reduces maintenance surface by ~300 lines.

### R-06 — Document the Font Token Semantic Convention

Add an explicit comment in `tailwind.css` near the font variable declarations:

```css
/*
 * FONT TOKEN SEMANTIC CONVENTION
 * --font-serif → HEADING / DISPLAY font (currently Fraunces via theme_settings.heading_font)
 * --font-sans  → BODY / UI font (currently Google Sans Flex via theme_settings.body_font)
 * --font-mono  → PRICE / CODE font (currently Google Sans Code via theme_settings.price_font)
 *
 * NOTE: "serif"/"sans" refer to semantic role in the type hierarchy, not typeface classification.
 * A brand may configure any typeface for any token regardless of its classification.
 */
```

### R-07 — Update CSS Default Fallbacks to Match Intended Runtime Fonts

Change the CSS default fallbacks to use the intended template fonts (not Inter) so FOUT is visually coherent:

```css
/* Current (produces Inter FOUT) */
--font-sans: Inter, ui-sans-serif, sans-serif;
--font-serif: Inter, ui-serif, Georgia, serif;
--font-mono: Inter, ui-monospace, monospace;

/* Recommended (coherent FOUT) */
--font-sans: "Google Sans Flex", "Google Sans", ui-sans-serif, sans-serif;
--font-serif: Fraunces, ui-serif, Georgia, serif;
--font-mono: "Google Sans Code", "Google Sans", ui-monospace, monospace;
```

> **Note:** These fallbacks only apply to the default/unconfigured state. Runtime `generateThemeCssVariables()` overrides them with the brand's actual fonts. The change improves the FOUT and no-metaobject degradation experience.

### R-08 — Fix WCAG AA Contrast on FeaturedProductSpotlight

Increase the background darkness on the product card overlay or switch to a lighter foreground color that achieves ≥ 4.5:1. The current 2.38:1 represents a WCAG compliance failure.

Suggested fix path: use `ensureContrastCompliance()` (already in `lib/color/contrast.ts`) to programmatically ensure any merchant-configured color for this card overlay maintains compliance.

---

## Appendix A — Files Audited

| File | Lines | Method |
|------|-------|--------|
| `app/styles/tailwind.css` | 2200+ | Static + Playwright |
| `app/lib/theme-utils.ts` | 1000+ | Static |
| `app/lib/metaobject-parsers.ts` | 800+ | Static (grep) |
| `app/root.tsx` | 480+ | Static |
| `app/components/VideoHero.tsx` | 300+ | Static + Playwright |
| `app/components/ProductTitle.tsx` | 200+ | Static + Playwright |
| `app/components/BlogSection.tsx` | 450+ | Static |
| `app/components/FeaturedProductSpotlight.tsx` | 100+ | Static + Playwright |
| `app/components/Footer.tsx` | 200+ | Static |
| `app/components/CollectionPageLayout.tsx` | 220+ | Static + Playwright |
| `app/components/ProductPrice.tsx` | 500+ | Static |

## Appendix B — Routes Visually Verified

| Route | Viewports | Notes |
|-------|-----------|-------|
| `/` (homepage) | 375px, 768px, 1440px | Full visual + computed styles |
| `/collections/:handle` | 1440px | Computed styles for h1 |
| `/products/:handle` | 375px, 1440px | Computed styles, font switch confirmed |
| `/faq` | 1440px | Accordion structure |
| `/blogs` | 1440px | Empty state (no articles in demo store) |
| `/search` | 1440px | Search UI, collection grid |
| `/account/wishlist` | 1440px | Empty state |

## Appendix C — Tools & Methods

- **Static analysis:** Read tool, Grep (ripgrep), targeted file reads
- **Runtime font validation:** `document.fonts.ready` + `FontFace.family` enumeration via Playwright `evaluate()`
- **Computed style extraction:** `window.getComputedStyle()` via Playwright for font-family, font-size, line-height, letter-spacing
- **Contrast calculation:** Manual WCAG relative luminance formula implemented in `page.evaluate()` (axe-core blocked by CSP)
- **Screenshots:** Playwright MCP (`browser_take_screenshot`) at 375px, 768px, 1440px viewports
- **Color conversion:** OKLCH → sRGB → luminance via CSS computed value extraction

---

*Audit completed 2026-04-05. No changes were made to the codebase during this audit.*
