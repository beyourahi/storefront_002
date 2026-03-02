/**
 * @fileoverview Dynamic Theme Generation System
 *
 * @description
 * Core theming engine that generates CSS from Shopify metaobject data.
 * Enables multi-brand support by deriving a complete color palette and
 * typography system from minimal merchant configuration.
 *
 * @architecture
 * Theme Generation Flow:
 * 1. Shopify metaobject → 5 core colors + 3 font families
 * 2. Core colors → 15+ derived CSS variables (card, muted, borders, etc.)
 * 3. Font names → Google Fonts URL + CSS font-family declarations
 * 4. All combined → CSS :root variables injected in <head>
 *
 * Color Derivation Strategy:
 * - primary/secondary: Used as-is
 * - foregrounds: Calculated for WCAG contrast (white or dark) using APCA
 * - muted: Derived by reducing chroma and adjusting lightness
 * - borders: Based on secondary color
 *
 * @color-space
 * Uses OKLCH for color manipulation:
 * - L (lightness): 0-1
 * - C (chroma): 0-0.4 (saturation)
 * - H (hue): 0-360 degrees
 *
 * OKLCH advantages:
 * - Perceptually uniform lightness
 * - Predictable color manipulation
 * - Better gradient interpolation
 *
 * @dependencies
 * - ~/lib/color - Color conversion and contrast calculations
 *
 * @related
 * - metaobject-parsers.ts - Parses theme data from metaobjects
 * - root.tsx - Injects generated CSS variables
 * - tailwind.css - Default CSS variables (overridden by generated theme)
 * - theme-storage.ts - Persists theme for offline use
 * - lib/color/ - WCAG 2.1 + APCA contrast calculations
 *
 * @example
 * ```typescript
 * const theme = generateTheme(
 *   { primary: '#8B4513', secondary: '#F5F5DC', ... },
 *   { sans: 'Inter', serif: 'Playfair Display', mono: 'Fira Code' }
 * );
 * // Returns: { colors, fonts, googleFontsUrl, cssVariables }
 * ```
 */

import {getContrastForeground, normalizeToOklch, hexToOklch, isValidColor as colorIsValidColor} from "./color";

// =============================================================================
// TYPES
// =============================================================================

export interface OklchColor {
    l: number; // Lightness: 0-1
    c: number; // Chroma: 0-0.4 (saturation)
    h: number; // Hue: 0-360
}

export interface ThemeCoreColors {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    accent: string;
}

export interface DerivedTheme {
    // Base
    background: string;
    foreground: string;

    // Card & Popover
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;

    // Primary & Secondary
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;

    // Muted & Accent
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;

    // Borders
    border: string;
    input: string;
    ring: string;
}

export interface ThemeFonts {
    sans: string;
    serif: string;
    mono: string;
}

export interface GeneratedTheme {
    colors: DerivedTheme;
    fonts: ThemeFonts;
    googleFontsUrl: string;
    cssVariables: string;
}

// =============================================================================
// OKLCH PARSING & MANIPULATION
// =============================================================================

/**
 * Parse OKLCH color string to components
 * Supports: "oklch(0.6 0.1 45)" or "oklch(0.6 0.1 45 / 0.5)"
 */
export function parseOklch(color: string): OklchColor | null {
    // Match oklch(L C H) or oklch(L C H / alpha)
    const match = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (!match) return null;

    return {
        l: parseFloat(match[1]),
        c: parseFloat(match[2]),
        h: parseFloat(match[3])
    };
}

/**
 * Convert OklchColor to CSS string
 */
export function toOklch(color: OklchColor): string {
    return `oklch(${color.l.toFixed(4)} ${color.c.toFixed(4)} ${color.h.toFixed(4)})`;
}

/**
 * Adjust lightness of an OKLCH color
 * @param delta - Positive to lighten, negative to darken
 */
export function adjustLightness(color: string, delta: number): string {
    const parsed = parseOklch(color);
    if (!parsed) return color;

    return toOklch({
        ...parsed,
        l: Math.max(0, Math.min(1, parsed.l + delta))
    });
}

/**
 * Adjust chroma (saturation) of an OKLCH color
 * @param factor - Multiply chroma by this factor (0.5 = half saturation)
 */
export function adjustChroma(color: string, factor: number): string {
    const parsed = parseOklch(color);
    if (!parsed) return color;

    return toOklch({
        ...parsed,
        c: Math.max(0, Math.min(0.4, parsed.c * factor))
    });
}

/**
 * Rotate hue of an OKLCH color
 * @param degrees - Degrees to rotate (positive = clockwise)
 */
export function rotateHue(color: string, degrees: number): string {
    const parsed = parseOklch(color);
    if (!parsed) return color;

    let newHue = (parsed.h + degrees) % 360;
    if (newHue < 0) newHue += 360;

    return toOklch({
        ...parsed,
        h: newHue
    });
}

/**
 * Create a muted version of a color
 * Reduces chroma and adjusts lightness toward middle
 */
export function toMuted(color: string): string {
    const parsed = parseOklch(color);
    if (!parsed) return color;

    return toOklch({
        l: Math.min(0.92, parsed.l * 0.95 + 0.1), // Push toward 0.85-0.92
        c: parsed.c * 0.6, // Reduce saturation
        h: parsed.h
    });
}

/**
 * Check if color is valid OKLCH
 */
export function isValidOklch(color: string): boolean {
    return parseOklch(color) !== null;
}

// Re-export color utilities from color module for backward compatibility
// (These are imported above for internal use, but we also re-export for external consumers)
export {getContrastForeground, hexToOklch, normalizeToOklch, isValidColor as isValidColor} from "./color";

// =============================================================================
// FONT UTILITIES
// =============================================================================

/**
 * Sanitize font name for safe use in CSS and URLs
 * Only allows alphanumeric characters, spaces, and common punctuation
 */
export function sanitizeFontName(fontName: string): string {
    return fontName.replace(/[^a-zA-Z0-9\s\-_]/g, "").trim();
}

/**
 * Generate Google Fonts URL from font names
 * Supports variable fonts with weight ranges
 */
export function generateGoogleFontsUrl(fonts: ThemeFonts): string {
    const fontFamilies: string[] = [];

    // Build font family strings with weights
    if (fonts.sans) {
        const sanitized = sanitizeFontName(fonts.sans).replace(/ /g, "+");
        if (sanitized) {
            // Variable font syntax for modern fonts
            fontFamilies.push(`family=${sanitized}:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900`);
        }
    }

    if (fonts.serif) {
        const sanitized = sanitizeFontName(fonts.serif).replace(/ /g, "+");
        if (sanitized) {
            fontFamilies.push(`family=${sanitized}:ital,wght@0,400..800;1,400..800`);
        }
    }

    if (fonts.mono) {
        const sanitized = sanitizeFontName(fonts.mono).replace(/ /g, "+");
        if (sanitized) {
            fontFamilies.push(`family=${sanitized}:wght@400;500;600;700`);
        }
    }

    if (fontFamilies.length === 0) return "";

    return `https://fonts.googleapis.com/css2?${fontFamilies.join("&")}&display=swap`;
}

/**
 * Generate CSS font-family value with fallbacks
 */
export function generateFontFamily(fontName: string, type: "sans" | "serif" | "mono"): string {
    const fallbacks = {
        sans: "ui-sans-serif, system-ui, sans-serif",
        serif: "ui-serif, Georgia, serif",
        mono: "ui-monospace, SFMono-Regular, monospace"
    };

    if (!fontName) return fallbacks[type];

    const sanitized = sanitizeFontName(fontName);
    if (!sanitized) return fallbacks[type];

    return `"${sanitized}", ${fallbacks[type]}`;
}

// =============================================================================
// THEME GENERATION
// =============================================================================

/**
 * Derive all theme colors from 5 core colors
 */
export function deriveThemeColors(core: ThemeCoreColors): DerivedTheme {
    const primary = normalizeToOklch(core.primary);
    const secondary = normalizeToOklch(core.secondary);
    const background = normalizeToOklch(core.background);
    const foreground = normalizeToOklch(core.foreground);
    const accent = normalizeToOklch(core.accent);

    return {
        // Base
        background,
        foreground,

        // Card & Popover (same as background, popover slightly lighter)
        card: background,
        cardForeground: foreground,
        popover: adjustLightness(background, 0.03),
        popoverForeground: foreground,

        // Primary & Secondary with contrast foregrounds
        primary,
        primaryForeground: getContrastForeground(primary),
        secondary,
        secondaryForeground: getContrastForeground(secondary),

        // Muted & Accent
        muted: toMuted(accent),
        mutedForeground: adjustLightness(foreground, 0.12),
        accent,
        accentForeground: foreground,

        // Borders (derived from secondary)
        border: secondary,
        input: secondary,
        ring: primary
    };
}

// =============================================================================
// CSS GENERATION
// =============================================================================

/**
 * Derive shadow color from the theme's primary hue.
 * Shadows carry a subtle brand tint by matching the primary hue at fixed
 * low-chroma / mid-lightness — perceptually neutral but brand-consistent.
 * Falls back to a warm neutral (≈ hsl 20 18% 51%) for achromatic themes.
 */
function deriveThemeShadowColor(colors: DerivedTheme): string {
    const pr = parseOklch(colors.primary);
    const fg = parseOklch(colors.foreground);

    // Prefer primary hue if the brand color has notable chroma; otherwise try foreground
    const source = pr && pr.c > 0.05 ? pr : fg && fg.c > 0.02 ? fg : null;

    // Achromatic theme (black/white) — pure black matches the default in tailwind.css
    if (!source) return "oklch(0 0 0)";

    return toOklch({
        l: 0.5,
        c: Math.min(0.05, source.c * 0.25), // very subtle brand tint
        h: source.h
    });
}

/**
 * Generate CSS variables string for injection into <head>
 * This CSS overrides the Tailwind defaults when theme data is present
 */
export function generateThemeCssVariables(colors: DerivedTheme, fonts: ThemeFonts): string {
    return `:root {
  /* ═══════════════════════════════════════════════════════════════════════════
     Dynamic Theme Colors - Generated from Shopify Metaobjects
     These override the defaults in tailwind.css
     ═══════════════════════════════════════════════════════════════════════════ */

  /* Core Colors */
  --background: ${colors.background};
  --foreground: ${colors.foreground};

  /* Card & Popover */
  --card: ${colors.card};
  --card-foreground: ${colors.cardForeground};
  --popover: ${colors.popover};
  --popover-foreground: ${colors.popoverForeground};

  /* Primary */
  --primary: ${colors.primary};
  --primary-foreground: ${colors.primaryForeground};

  /* Secondary */
  --secondary: ${colors.secondary};
  --secondary-foreground: ${colors.secondaryForeground};

  /* Muted */
  --muted: ${colors.muted};
  --muted-foreground: ${colors.mutedForeground};

  /* Accent */
  --accent: ${colors.accent};
  --accent-foreground: ${colors.accentForeground};

  /* Borders & Input */
  --border: ${colors.border};
  --input: ${colors.input};
  --ring: ${colors.ring};

  /* Shadows - brand-tinted shadow color derived from primary hue */
  --shadow-color: ${deriveThemeShadowColor(colors)};

  /* ═══════════════════════════════════════════════════════════════════════════
     Dynamic Theme Fonts - Google Fonts loaded via <link>
     ═══════════════════════════════════════════════════════════════════════════ */

  --font-sans: ${generateFontFamily(fonts.sans, "sans")};
  --font-serif: ${generateFontFamily(fonts.serif, "serif")};
  --font-mono: ${generateFontFamily(fonts.mono, "mono")};
}`;
}

/**
 * Generate complete theme from parsed metaobject data
 * Returns null if no theme customization is present (use CSS defaults)
 */
export function generateTheme(coreColors: ThemeCoreColors | null, fonts: ThemeFonts | null): GeneratedTheme | null {
    // If no theme data provided, return null (use CSS defaults)
    if (!coreColors && !fonts) return null;

    // Default values - pure black/white only (matches tailwind.css)
    const defaultColors: ThemeCoreColors = {
        primary: "oklch(0 0 0)",
        secondary: "oklch(1 0 0)",
        background: "oklch(1 0 0)",
        foreground: "oklch(0 0 0)",
        accent: "oklch(0 0 0)"
    };

    const defaultFonts: ThemeFonts = {
        sans: "Inter",
        serif: "Inter",
        mono: "Inter"
    };

    // Merge with defaults
    const finalColors = coreColors ? {...defaultColors, ...coreColors} : defaultColors;
    const finalFonts = fonts ? {...defaultFonts, ...fonts} : defaultFonts;

    // Generate derived colors
    const derivedColors = deriveThemeColors(finalColors);

    // Generate Google Fonts URL
    const googleFontsUrl = generateGoogleFontsUrl(finalFonts);

    // Generate CSS variables
    const cssVariables = generateThemeCssVariables(derivedColors, finalFonts);

    return {
        colors: derivedColors,
        fonts: finalFonts,
        googleFontsUrl,
        cssVariables
    };
}
