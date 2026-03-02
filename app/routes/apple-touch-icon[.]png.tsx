/**
 * @fileoverview Apple Touch Icon Route for iOS
 *
 * @description
 * Serves the Apple Touch Icon used when iOS users add the site to their
 * home screen. Dynamically fetches from Shopify configuration with fallbacks.
 *
 * @route GET /apple-touch-icon.png
 *
 * @ios-integration
 * iOS Safari looks for this file when users:
 * - Add to Home Screen
 * - Save as web clip
 * - Bookmark with icon
 *
 * @icon-priority
 * 1. pwa_settings.icon_180_apple (180x180 iOS-specific)
 * 2. pwa_settings.icon_192 (standard PWA icon as fallback)
 * 3. shop.brand.squareLogo (Shopify brand settings)
 *
 * @icon-requirements
 * Apple recommends 180x180 PNG for iPhone 6 Plus and later.
 * Smaller devices will scale down automatically.
 *
 * @caching
 * - Success: 1 hour browser, 24 hours CDN
 * - Not found: 5 minutes (allows quick recovery)
 * - Error: No cache
 *
 * @related
 * - manifest[.]webmanifest.tsx - PWA manifest with icons
 * - favicon[.]ico.tsx - Site favicon
 * - root.tsx - Apple touch icon link tag
 *
 * @see https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
 */

import type {Route} from "./+types/apple-touch-icon[.]png";
import {redirect} from "react-router";

// Simple query for apple touch icon sources
const APPLE_ICON_QUERY = `#graphql
  query AppleTouchIcon(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    pwaSettings: metaobject(handle: {type: "pwa_settings", handle: "pwa_config"}) {
      iconApple: field(key: "icon_180_apple") {
        reference {
          ... on MediaImage {
            image { url }
          }
        }
      }
      icon192: field(key: "icon_192") {
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

export async function loader({context}: Route.LoaderArgs) {
    const {dataAdapter} = context;

    try {
        const data = await dataAdapter.query(APPLE_ICON_QUERY, {
            cache: dataAdapter.CacheLong() // Icon rarely changes
        });

        // Try to get icon URL in order of preference
        const iconUrl =
            data?.pwaSettings?.iconApple?.reference?.image?.url ||
            data?.pwaSettings?.icon192?.reference?.image?.url ||
            data?.shop?.brand?.squareLogo?.image?.url;

        if (iconUrl) {
            // Redirect to the actual icon URL with caching
            return redirect(iconUrl, {
                status: 302,
                headers: {
                    "Cache-Control": "public, max-age=3600, s-maxage=86400"
                }
            });
        }

        // No icon found - return 404
        return new Response("Apple touch icon not configured", {
            status: 404,
            headers: {
                "Content-Type": "text/plain",
                "Cache-Control": "public, max-age=300"
            }
        });
    } catch (error) {
        console.error("[Apple Touch Icon] Error:", error);
        return new Response("Error loading icon", {
            status: 500,
            headers: {
                "Content-Type": "text/plain",
                "Cache-Control": "no-store"
            }
        });
    }
}
