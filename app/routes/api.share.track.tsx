/**
 * @fileoverview Social Share Analytics Tracking API
 *
 * @description
 * Tracks social share events for analytics purposes. When users share
 * products or wishlists to social platforms, this endpoint records
 * the share for later analysis.
 *
 * @route POST /api/share/track
 *
 * @architecture
 * Request Flow:
 * 1. User clicks share button on product/wishlist
 * 2. Client sends share analytics data to this endpoint
 * 3. Data is validated and acknowledged
 * 4. (Future) Store in analytics database
 *
 * @data-collected
 * - platform: Which social platform (twitter, facebook, copy, etc.)
 * - productId: Product being shared
 * - productHandle: Product URL handle
 * - timestamp: When share occurred
 * - userAgent: Browser info (optional)
 * - referrer: Page URL (optional)
 *
 * @privacy
 * - No personal identification data collected
 * - Aggregate analytics only
 *
 * @related
 * - lib/social-share.ts - Share utilities and platform config
 * - ProductShareButton.tsx - Product share UI
 * - WishlistShareDialog - Wishlist share UI
 */

import type {Route} from "./+types/api.share.track";

// NOTE: When analytics storage is implemented, add rate limiting via
// Cloudflare Rate Limiting rules or KV-backed limiting — not in-memory.
// Module-scope state is per-isolate and ephemeral on Cloudflare Workers.

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Type guard to validate analytics data structure.
 *
 * @param data - Unknown data to validate
 * @returns true if data matches expected analytics shape
 */
function isValidAnalyticsData(data: unknown): data is {
    platform: string;
    productId: string;
    productHandle: string;
    timestamp: number;
    userAgent?: string;
    referrer?: string;
} {
    if (!data || typeof data !== "object") return false;

    const obj = data as Record<string, unknown>;
    return (
        typeof obj.platform === "string" &&
        typeof obj.productId === "string" &&
        typeof obj.productHandle === "string" &&
        typeof obj.timestamp === "number"
    );
}

// =============================================================================
// LOADER
// =============================================================================

export async function loader() {
    return new Response("Method not allowed", {
        status: 405,
        headers: {"Allow": "POST"}
    });
}

// =============================================================================
// ACTION
// =============================================================================

/**
 * Handles share tracking analytics requests.
 *
 * @param request - HTTP request with JSON analytics payload
 *
 * @returns JSON response indicating success or error
 *
 * @error-codes
 * - 400: Invalid request body or data structure
 */
export async function action({request}: Route.ActionArgs) {
    try {
        const data = await request.json();

        // Validate data structure
        if (!isValidAnalyticsData(data)) {
            return new Response(JSON.stringify({error: "Invalid analytics data"}), {
                status: 400,
                headers: {"Content-Type": "application/json"}
            });
        }

        // In production, store analytics in a database
        // For now, we just acknowledge the tracking request
        // You can add database storage here later

        return new Response(JSON.stringify({success: true}), {
            status: 200,
            headers: {"Content-Type": "application/json"}
        });
    } catch {
        return new Response(JSON.stringify({error: "Invalid request body"}), {
            status: 400,
            headers: {"Content-Type": "application/json"}
        });
    }
}
