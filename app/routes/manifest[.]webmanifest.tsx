/**
 * @fileoverview PWA Web App Manifest Generator
 *
 * @description
 * Generates a dynamic Web App Manifest for Progressive Web App (PWA)
 * functionality. Data is pulled from Shopify metaobjects (site_settings
 * and theme_settings) with fallbacks to shop brand data.
 *
 * @route GET /manifest.webmanifest
 *
 * @pwa-features
 * - App icon definitions (192x192, 512x512)
 * - Theme and background colors
 * - App name and description
 * - Standalone display mode
 * - "Install to Home Screen" support
 *
 * @data-sources
 * | Field             | Source                          |
 * |-------------------|---------------------------------|
 * | name, short_name  | site_settings.brandName         |
 * | description       | site_settings.missionStatement  |
 * | icons             | site_settings.icon192/icon512   |
 * | theme_color       | theme_settings.colors.primary   |
 * | background_color  | theme_settings.colors.background|
 *
 * @hardcoded-values (PWA best practices)
 * - display: "standalone"
 * - start_url: "/"
 * - orientation: "any"
 * - scope: "/"
 * - categories: ["shopping"]
 *
 * @caching
 * - Browser: 1 hour (max-age=3600)
 * - CDN: 24 hours (s-maxage=86400)
 *
 * @error-handling
 * - Missing icons: Returns 500 with helpful error
 * - Query failure: Returns minimal fallback manifest
 *
 * @color-conversion
 * OKLCH colors from theme_settings are converted to HEX
 * for browser compatibility.
 *
 * @related
 * - lib/pwa-queries.ts - GraphQL query
 * - lib/pwa-parsers.ts - Manifest building logic
 * - root.tsx - Manifest link tag
 * - ServiceWorkerRegistration.tsx - SW registration
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest
 */

import type {Route} from "./+types/manifest[.]webmanifest";
import {PWA_MANIFEST_QUERY} from "~/lib/pwa-queries";
import {parseShopBrand, buildWebAppManifest} from "~/lib/pwa-parsers";
import {parseSiteSettings, parseThemeSettings} from "~/lib/metaobject-parsers";

export async function loader({context, request}: Route.LoaderArgs) {
    const {dataAdapter} = context;

    // Get the manifest URL from the request for related_applications
    const url = new URL(request.url);
    const manifestUrl = `${url.origin}/manifest.webmanifest`;

    try {
        // Query site_settings, theme_settings, and shop brand data
        const data = await dataAdapter.query(PWA_MANIFEST_QUERY, {
            cache: dataAdapter.CacheLong() // Brand settings rarely change
        });

        // Parse metaobjects and shop brand
        const siteSettings = parseSiteSettings(data?.siteSettings);
        const themeConfig = parseThemeSettings(data?.themeSettings);
        const shopBrand = parseShopBrand(data?.shop);

        // Build the Web App Manifest with manifest URL for getInstalledRelatedApps()
        const manifest = buildWebAppManifest(siteSettings, themeConfig, shopBrand, manifestUrl);

        // If manifest is null, icons are missing - return error
        if (!manifest) {
            console.error("[PWA Manifest] Missing required icons - PWA will not be installable");
            return new Response(
                JSON.stringify({
                    error: "PWA manifest requires icons. Please add icon_192 and icon_512 fields to your site_settings metaobject."
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-store"
                    }
                }
            );
        }

        // Return valid manifest with proper caching
        return new Response(JSON.stringify(manifest, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/manifest+json",
                // Cache for 1 hour in browser, 24 hours at CDN edge
                "Cache-Control": "public, max-age=3600, s-maxage=86400"
            }
        });
    } catch (error) {
        console.error("[PWA Manifest] Error generating manifest:", error);

        // Return a minimal fallback manifest on error
        const fallbackManifest = {
            name: "Store",
            short_name: "Store",
            start_url: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#000000"
        };

        return new Response(JSON.stringify(fallbackManifest, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/manifest+json",
                // Short cache on error to allow recovery
                "Cache-Control": "public, max-age=300"
            }
        });
    }
}
