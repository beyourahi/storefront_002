/**
 * @fileoverview GraphQL API Proxy Route
 *
 * @description
 * Proxies GraphQL requests to Shopify's Storefront API through the checkout
 * domain. This enables client-side GraphQL queries while keeping API tokens
 * secure on the server side.
 *
 * @route POST /api/:version/graphql.json
 *
 * @architecture
 * Request Flow:
 * 1. Client sends GraphQL query to this route
 * 2. Route forwards request to Shopify's checkout domain
 * 3. Response is streamed back to client
 * 4. Headers are preserved for proper content negotiation
 *
 * @versioning
 * The $version parameter allows targeting specific API versions:
 * - /api/2024-01/graphql.json
 * - /api/2024-04/graphql.json
 * - /api/unstable/graphql.json
 *
 * This enables gradual API version migration and testing.
 *
 * @use-cases
 * - Client-side data fetching without exposing API tokens
 * - Cart operations from browser JavaScript
 * - Real-time search suggestions
 * - Dynamic product loading
 *
 * @security
 * - API tokens are kept server-side (not exposed to client)
 * - Request body and headers are passed through unchanged
 * - No additional validation needed as Shopify validates queries
 *
 * @related
 * - lib/context.ts - Server-side storefront client (direct API access)
 * - components/SearchFormPredictive.tsx - Example client-side usage
 *
 * @see https://shopify.dev/docs/api/storefront
 */

import type {Route} from "./+types/api.$version.[graphql.json]";

// =============================================================================
// ACTION
// =============================================================================

/**
 * Proxies GraphQL requests to Shopify's Storefront API.
 *
 * @param params - Route params containing API version
 * @param context - Hydrogen context with environment variables
 * @param request - Incoming request with GraphQL query body
 *
 * @returns Proxied response from Shopify's GraphQL endpoint
 *
 * @note Uses checkout domain (not store domain) for API access.
 *       Response body is streamed for optimal performance.
 */
export async function action({params, context, request}: Route.ActionArgs) {
    // Proxy the request to Shopify's GraphQL endpoint
    const response = await fetch(`https://${context.env.PUBLIC_CHECKOUT_DOMAIN}/api/${params.version}/graphql.json`, {
        method: "POST",
        body: request.body,
        headers: request.headers
    });

    // Return the proxied response with original headers
    return new Response(response.body, {headers: new Headers(response.headers)});
}
