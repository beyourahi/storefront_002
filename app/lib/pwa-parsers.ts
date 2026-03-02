/**
 * @fileoverview PWA Manifest Builders and Color Converters
 *
 * @description
 * Transforms site_settings and theme_settings metaobject data into W3C Web App Manifest
 * format for Progressive Web App installability. Handles color format conversion (OKLCH to HEX),
 * icon validation, and fallback data from Shop brand API.
 *
 * @architecture
 * Manifest Generation Strategy:
 * - Data Sources: site_settings (brand, icons) + theme_settings (colors) + Shop.brand (fallbacks)
 * - Color Conversion: OKLCH → HEX for manifest compatibility
 * - Icon Validation: Returns null if required icons missing (PWA won't be installable)
 * - Hardcoded Best Practices: display, start_url, orientation, scope (never configurable)
 *
 * Data Mapping:
 * - name/short_name: site_settings.brandName → shop.name
 * - description: site_settings.missionStatement → shop.description
 * - icons: site_settings.icon_192, icon_512 (required for installability)
 * - theme_color/background_color: theme_settings.colors (OKLCH → HEX)
 * - Hardcoded: display="standalone", start_url="/", scope="/", categories=["shopping"]
 *
 * WCAG 2.1 Compliance Note:
 * - Theme colors converted from OKLCH to HEX for manifest compatibility
 * - Colors should be WCAG-compliant as defined in theme_settings
 * - theme_color used for browser chrome (address bar, status bar)
 * - No contrast validation needed for browser UI colors
 *
 * @dependencies
 * - TypeScript types from types/index.ts
 * - OKLCH to sRGB color conversion algorithm
 *
 * @related
 * - app/lib/pwa-queries.ts - GraphQL query that fetches the raw data
 * - app/routes/manifest[.]webmanifest.tsx - Uses buildWebAppManifest() to serve manifest
 * - app/routes/apple-touch-icon[.]png.tsx - Uses getAppleTouchIconUrl() for iOS icon
 * - app/lib/metaobject-parsers.ts - Parses site_settings and theme_settings
 */

import type {SiteSettings, ThemeConfig} from "types";

import {toHex} from "./color";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Web App Manifest icon entry
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest/icons
 */
export interface ManifestIcon {
    src: string;
    sizes: string;
    type: string;
    purpose?: "any" | "maskable" | "monochrome";
}

/**
 * Related application entry for getInstalledRelatedApps() API
 * @see https://web.dev/get-installed-related-apps/
 */
export interface RelatedApplication {
    platform: "webapp" | "play" | "itunes" | "windows";
    url?: string;
    id?: string;
}

/**
 * Web App Manifest structure
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest
 */
export interface WebAppManifest {
    name: string;
    short_name: string;
    description: string;
    start_url: string;
    scope: string;
    display: "standalone" | "fullscreen" | "minimal-ui" | "browser";
    orientation:
        | "any"
        | "portrait"
        | "landscape"
        | "portrait-primary"
        | "portrait-secondary"
        | "landscape-primary"
        | "landscape-secondary";
    theme_color: string;
    background_color: string;
    categories: string[];
    icons: ManifestIcon[];
    /** Related applications for getInstalledRelatedApps() detection */
    related_applications: RelatedApplication[];
    /** Prefer native app over web when available */
    prefer_related_applications: boolean;
    /** Unique ID for the app (helps with installation detection) */
    id: string;
}

/**
 * Shop brand data for fallbacks
 */
export interface ShopBrandData {
    name: string;
    description: string | null;
    shortDescription: string | null;
    logoUrl: string | null;
    primaryColor: string | null;
}

// =============================================================================
// COLOR CONVERSION UTILITIES
// =============================================================================

/**
 * Convert OKLCH color to HEX format
 * PWA manifest requires HEX colors, but theme_settings may store OKLCH
 *
 * Uses the color module's toHex() which includes:
 * - Proper gamut mapping for out-of-sRGB colors
 * - Full OKLCH → sRGB conversion via Color.js
 *
 * @param color - Color string in OKLCH or HEX format
 * @returns HEX color string (e.g., "#ffffff")
 */
function toHexColor(color: string): string {
    // Use color module's toHex with gamut mapping
    const hex = toHex(color);
    return hex ?? "#000000";
}

// =============================================================================
// PARSERS
// =============================================================================

/**
 * Parse shop brand data for fallbacks
 */
export function parseShopBrand(shop: any): ShopBrandData {
    return {
        name: shop?.name ?? "Store",
        description: shop?.description ?? null,
        shortDescription: shop?.brand?.shortDescription ?? null,
        logoUrl: shop?.brand?.logo?.image?.url ?? null,
        // brand.colors.primary is an array - take the first color
        primaryColor: shop?.brand?.colors?.primary?.[0]?.background ?? null
    };
}

/**
 * Build icons array for manifest
 * Returns null if required icons are missing (PWA won't be installable)
 */
function buildIconsArray(siteSettings: SiteSettings, shopLogo: string | null): ManifestIcon[] | null {
    const icons: ManifestIcon[] = [];

    // 192x192 icon (required for PWA installability)
    const icon192 = siteSettings.icon192Url ?? shopLogo;
    if (icon192) {
        icons.push({
            src: icon192,
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
        });
    }

    // 512x512 icon (required for splash screen)
    const icon512 = siteSettings.icon512Url ?? shopLogo;
    if (icon512) {
        icons.push({
            src: icon512,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
        });
    }

    // If no icons at all, return null (manifest will be invalid)
    if (icons.length === 0) {
        return null;
    }

    return icons;
}

// =============================================================================
// MAIN BUILDER
// =============================================================================

/**
 * Build complete Web App Manifest from site_settings + theme_settings
 *
 * DATA SOURCES:
 * - name: siteSettings.brandName (falls back to shopBrand.name)
 * - short_name: siteSettings.brandName.slice(0, 12)
 * - description: siteSettings.missionStatement (falls back to shopBrand.description)
 * - theme_color: themeConfig.colors.primary (converted to HEX)
 * - background_color: themeConfig.colors.background (converted to HEX)
 * - icons: siteSettings.icon192Url, icon512Url
 *
 * HARDCODED VALUES (PWA best practices for e-commerce):
 * - display: 'standalone' (app-like experience)
 * - start_url: '/' (always start at homepage)
 * - orientation: 'any' (support all orientations)
 * - scope: '/' (entire site in PWA scope)
 * - categories: ['shopping'] (e-commerce category)
 * - related_applications: Self-reference for getInstalledRelatedApps() detection
 * - prefer_related_applications: false (prefer web app)
 * - id: '/' (unique app identifier)
 *
 * @param siteSettings - Parsed site settings from site_settings metaobject
 * @param themeConfig - Parsed theme config from theme_settings metaobject
 * @param shopBrand - Shop brand data for fallbacks
 * @param manifestUrl - Full URL to the manifest (e.g., https://example.com/manifest.webmanifest)
 * @returns Web App Manifest or null if critical data is missing (no icons)
 */
export function buildWebAppManifest(
    siteSettings: SiteSettings,
    themeConfig: ThemeConfig,
    shopBrand: ShopBrandData,
    manifestUrl: string
): WebAppManifest | null {
    // Build icons array - returns null if no icons available
    const icons = buildIconsArray(siteSettings, shopBrand.logoUrl);
    if (!icons) {
        return null;
    }

    // Convert theme colors to HEX for manifest
    const themeColor = toHexColor(themeConfig.colors.primary);
    const backgroundColor = toHexColor(themeConfig.colors.background);

    return {
        // Brand identity from site_settings
        name: siteSettings.brandName || shopBrand.name,
        short_name: (siteSettings.brandName || shopBrand.name).slice(0, 12),
        description:
            siteSettings.missionStatement ||
            shopBrand.shortDescription ||
            shopBrand.description ||
            `Shop at ${shopBrand.name}`,

        // HARDCODED: PWA best practices for e-commerce
        // These values should NEVER be configurable - they represent best practices
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        categories: ["shopping"],

        // Theme colors from theme_settings (converted to HEX)
        theme_color: themeColor,
        background_color: backgroundColor,

        // Icons from site_settings
        icons,

        // App identification for getInstalledRelatedApps() API
        // This allows browsers to detect if the PWA is already installed
        // @see https://web.dev/get-installed-related-apps/
        id: "/",
        related_applications: [
            {
                platform: "webapp",
                url: manifestUrl
            }
        ],
        prefer_related_applications: false
    };
}

/**
 * Get Apple touch icon URL for iOS
 * Falls back through: icon180Apple -> icon192 -> shop logo
 */
export function getAppleTouchIconUrl(siteSettings: SiteSettings, shopBrand: ShopBrandData): string | null {
    return siteSettings.icon180AppleUrl ?? siteSettings.icon192Url ?? shopBrand.logoUrl ?? null;
}

/**
 * Get theme color for meta tag
 * Derived from theme_settings colors (converted to HEX)
 *
 * WCAG 2.1 Compliance:
 * ─────────────────────────────────────────────────────────────────────────────
 * This returns the merchant's brand color for browser chrome UI (address bar,
 * status bar). Since this doesn't affect text contrast within the app, no
 * validation is performed here.
 *
 * If this color is used for in-app UI elements (buttons, headers, etc.),
 * validate using ensureContrastCompliance() from ~/lib/wcag-contrast.ts:
 *
 * Example:
 * ```ts
 * import { ensureContrastCompliance } from '~/lib/wcag-contrast';
 *
 * const themeColor = getThemeColor(themeConfig);
 * const safeButtonColor = ensureContrastCompliance(
 *   themeColor,        // merchant color to test
 *   '#ffffff',         // background color
 *   '#1f1f1f',         // WCAG-compliant fallback
 *   4.5                // minimum contrast ratio for text
 * );
 * ```
 *
 * Default fallback: #000000 provides 21:1 contrast on white backgrounds
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function getThemeColor(themeConfig: ThemeConfig): string {
    return toHexColor(themeConfig.colors.primary);
}
