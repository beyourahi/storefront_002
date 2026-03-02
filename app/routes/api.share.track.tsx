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
 * 3. Rate limiting prevents abuse
 * 4. Data is validated and acknowledged
 * 5. (Future) Store in analytics database
 *
 * @rate-limiting
 * - 10 requests per IP per minute
 * - In-memory store (resets on worker restart)
 * - Returns 429 with Retry-After header when exceeded
 *
 * @cors
 * Supports CORS for cross-origin requests:
 * - Allows all origins (configurable in production)
 * - Supports POST and OPTIONS methods
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
 * - IP used only for rate limiting (not stored)
 * - No personal identification data collected
 * - Aggregate analytics only
 *
 * @related
 * - lib/social-share.ts - Share utilities and platform config
 * - ProductShareButton.tsx - Product share UI
 * - WishlistShareDialog - Wishlist share UI
 */

import type {Route} from "./+types/api.share.track";

// =============================================================================
// RATE LIMITING
// =============================================================================

/**
 * In-memory rate limit store.
 *
 * @note In a multi-worker environment, each worker has its own store.
 *       For stricter rate limiting, use a shared store (KV, Redis).
 */
const rateLimitStore = new Map<string, {count: number; resetTime: number}>();

/** Maximum requests per window */
const RATE_LIMIT = 10;

/** Rate limit window duration (1 minute) */
const RATE_WINDOW = 60 * 1000;

/**
 * Extracts client IP from request headers.
 *
 * @param request - Incoming HTTP request
 * @returns Client IP address or "unknown"
 *
 * @priority
 * 1. CF-Connecting-IP (Cloudflare)
 * 2. X-Real-IP (Nginx proxy)
 * 3. X-Forwarded-For (Generic proxy, first IP)
 */
function getClientIp(request: Request): string {
    // Try various headers for client IP
    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    const xRealIp = request.headers.get("x-real-ip");
    const xForwardedFor = request.headers.get("x-forwarded-for");

    if (cfConnectingIp) return cfConnectingIp;
    if (xRealIp) return xRealIp;
    if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

    return "unknown";
}

/**
 * Checks if request is within rate limit.
 *
 * @param ip - Client IP address
 * @returns true if allowed, false if rate limited
 *
 * @algorithm
 * - New IP: Create entry with count=1
 * - Expired window: Reset count
 * - Within limit: Increment count
 * - Over limit: Deny request
 */
function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(ip, {count: 1, resetTime: now + RATE_WINDOW});
        return true;
    }

    if (entry.count >= RATE_LIMIT) {
        return false;
    }

    entry.count++;
    return true;
}

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
// LOADER (CORS PREFLIGHT)
// =============================================================================

/**
 * Handles OPTIONS requests for CORS preflight.
 *
 * @param request - HTTP request
 * @returns 204 No Content with CORS headers for OPTIONS, 405 otherwise
 */
export async function loader({request}: Route.LoaderArgs) {
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        });
    }

    return new Response("Method not allowed", {status: 405});
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
 * - 405: Non-POST method
 * - 429: Rate limit exceeded
 */
export async function action({request}: Route.ActionArgs) {
    // Only allow POST
    if (request.method !== "POST") {
        return new Response("Method not allowed", {status: 405});
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
        return new Response(JSON.stringify({error: "Rate limit exceeded"}), {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": "60"
            }
        });
    }

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
