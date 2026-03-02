/**
 * @fileoverview Dynamic Favicon Route
 *
 * @description
 * Serves the site favicon dynamically based on Shopify configuration.
 * Uses 302 redirect to actual favicon URL for efficient caching.
 *
 * @route GET /favicon.ico
 *
 * @favicon-priority
 * 1. site_settings.favicon (metaobject file reference)
 * 2. shop.brand.squareLogo (Shopify brand settings)
 * 3. Static /assets/favicon.svg (bundled fallback)
 *
 * @caching
 * - Browser: 24 hours (max-age=86400)
 * - CDN: 7 days (s-maxage=604800)
 * - Error: 5 minutes (quick recovery)
 *
 * @why-redirect
 * Using 302 redirect instead of proxying because:
 * - CDN can cache the actual favicon at edge
 * - Reduces origin server load
 * - Shopify CDN serves images efficiently
 * - Favicon changes are reflected after cache expires
 *
 * @debug-logging
 * Includes console.log statements for development debugging.
 * These can be removed in production if desired.
 *
 * @related
 * - root.tsx - Links to /favicon.ico
 * - apple-touch-icon[.]png.tsx - iOS icon route
 * - manifest[.]webmanifest.tsx - PWA icons
 */

import type {Route} from "./+types/favicon[.]ico";
import {redirect} from "react-router";

// Query for favicon from site_settings metaobject
const FAVICON_QUERY = `#graphql
  query Favicon(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    siteSettings: metaobject(handle: {type: "site_settings", handle: "main"}) {
      favicon: field(key: "favicon") {
        reference {
          ... on MediaImage {
            image { url }
          }
        }
      }
    }
    shop {
      brand {
        squareLogo {
          image { url }
        }
      }
    }
  }
` as const;

// Import static favicon for fallback path
import faviconSvg from "~/assets/favicon.svg";

export async function loader({context}: Route.LoaderArgs) {
    const {dataAdapter} = context;

    // DEBUG: Log that the route is being hit
    // eslint-disable-next-line no-console -- intentional debug logging for favicon route
    console.log("[Favicon] Route loader called");

    try {
        const data = await dataAdapter.query(FAVICON_QUERY, {
            cache: dataAdapter.CacheLong() // Favicon changes rarely
        });

        // DEBUG: Log the query result
        // eslint-disable-next-line no-console -- intentional debug logging for favicon route
        console.log("[Favicon] Query result:", JSON.stringify(data, null, 2));

        // Try to get favicon URL in order of preference
        const metaobjectFavicon = data?.siteSettings?.favicon?.reference?.image?.url;
        const brandLogo = data?.shop?.brand?.squareLogo?.image?.url;
        const faviconUrl = metaobjectFavicon || brandLogo;

        // DEBUG: Log which favicon is being used
        // eslint-disable-next-line no-console -- intentional debug logging for favicon route
        console.log("[Favicon] Sources:", {
            metaobjectFavicon,
            brandLogo,
            selectedUrl: faviconUrl,
            fallback: faviconSvg
        });

        if (faviconUrl) {
            // Redirect to the actual favicon URL with long caching
            // eslint-disable-next-line no-console -- intentional debug logging for favicon route
            console.log("[Favicon] Redirecting to:", faviconUrl);
            return redirect(faviconUrl, {
                status: 302,
                headers: {
                    "Cache-Control": "public, max-age=86400, s-maxage=604800" // 1 day browser, 7 days edge
                }
            });
        }

        // Fallback to static SVG favicon
        // eslint-disable-next-line no-console -- intentional debug logging for favicon route
        console.log("[Favicon] Using static fallback:", faviconSvg);
        return redirect(faviconSvg, {
            status: 302,
            headers: {
                "Cache-Control": "public, max-age=86400, s-maxage=604800"
            }
        });
    } catch (error) {
        console.error("[Favicon] Error:", error);
        // On error, still serve the static fallback
        return redirect(faviconSvg, {
            status: 302,
            headers: {
                "Cache-Control": "public, max-age=300" // Short cache on error
            }
        });
    }
}
