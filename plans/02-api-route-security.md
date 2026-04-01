# Plan 2: API Route Security & Correctness

## Summary

14 security and correctness issues across 6 API route files. Covers weak cryptography, HTTP header leakage through a GraphQL proxy, missing input validation, dead code from incorrect assumptions about React Router's request routing, an ephemeral in-memory rate limiter that provides no real protection on Cloudflare Workers, and missing error handling in two product API endpoints.

## Items Covered

- **#15** `api.newsletter.tsx:94` — `Math.random()` for password generation
- **#16** `api.newsletter.tsx` — No `loader` export; GET returns default behavior instead of 405
- **#17** `api.share.track.tsx:60` — In-memory `rateLimitStore` resets per worker isolate
- **#18** `api.share.track.tsx:60` — `rateLimitStore` never evicts expired entries (memory leak)
- **#19** `api.share.track.tsx:165` — `Access-Control-Allow-Origin: *`
- **#20** `api.share.track.tsx:161-173` — CORS preflight in loader is dead code (loaders only get GET)
- **#21** `api.share.track.tsx:191-194` — Redundant `request.method !== "POST"` check in action
- **#22** `api.$version.[graphql.json].tsx:62-71` — Forwards raw request.headers to Shopify (leaks cookies/auth)
- **#23** `api.$version.[graphql.json].tsx` — No validation of `$version` parameter
- **#24** `api.$version.[graphql.json].tsx` — No rate limiting or body size limits
- **#25** `api.wishlist-products.tsx:71` — `JSON.parse as string[]` without element validation
- **#26** `api.wishlist-products.tsx:94` — Error returns HTTP 200 instead of 500
- **#27** `api.products.$handle.tsx:14-17` — No try/catch around `dataAdapter.query()`
- **#28** `api.product.recommendations.tsx:14-16` — No try/catch around `dataAdapter.query()`

## Current State

- `api.newsletter.tsx:90-97`: `generateSecurePassword()` uses `Math.floor(Math.random() * chars.length)` in a loop
- `api.newsletter.tsx`: Only exports `action`, no `loader`
- `api.share.track.tsx:60`: Module-scope `const rateLimitStore = new Map()` with `MAX_REQUESTS=10`, `WINDOW_MS=60000`
- `api.share.track.tsx:160-173`: Loader checks `request.method === "OPTIONS"` (dead — loaders only get GET) then returns 405
- `api.share.track.tsx:191-194`: Action checks `request.method !== "POST"` (dead — actions only get POST/PUT/PATCH/DELETE)
- `api.$version.[graphql.json].tsx:67`: `headers: request.headers` passes ALL browser headers to Shopify
- `api.$version.[graphql.json].tsx`: `params.version` used directly in URL without validation
- `api.wishlist-products.tsx:71`: `JSON.parse(idsString) as string[]` — type assertion, not runtime check
- `api.wishlist-products.tsx:94`: Catch block returns `Response.json({products: [], error: "..."})` (HTTP 200)
- `api.products.$handle.tsx:14-24`: Direct `dataAdapter.query()` call with no try/catch
- `api.product.recommendations.tsx:14-21`: Same — no try/catch

## Target State

- Cryptographically secure password generation via Web Crypto API
- All API routes return clean 405 for unsupported methods
- No dead code from incorrect React Router assumptions
- GraphQL proxy forwards only allowlisted headers
- API version parameter validated against Shopify format
- Request body size limited on GraphQL proxy
- Wishlist IDs validated as Shopify Product GIDs
- Error responses use appropriate HTTP status codes
- All query calls wrapped with proper error handling

## Implementation Approach

### api.newsletter.tsx (#15, #16)

**#15 — Replace Math.random()** (lines 90-97):
```typescript
function generateSecurePassword(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const randomBytes = crypto.getRandomValues(new Uint8Array(24));
    let password = "";
    for (let i = 0; i < 24; i++) {
        password += chars.charAt(randomBytes[i] % chars.length);
    }
    return password;
}
```
`crypto` global is available in Cloudflare Workers (Web Crypto API). Modulo bias is negligible for a 70-char alphabet with 256 values.

**#16 — Add loader for 405**:
```typescript
export async function loader() {
    return new Response("Method not allowed", {
        status: 405,
        headers: {"Allow": "POST"}
    });
}
```

### api.share.track.tsx (#17, #18, #19, #20, #21)

**#20 — Replace dead CORS loader** (lines 160-173):
Replace entire loader with:
```typescript
export async function loader() {
    return new Response("Method not allowed", {
        status: 405,
        headers: {"Allow": "POST"}
    });
}
```
The OPTIONS branch was dead code — React Router loaders only receive GET. Same-origin `fetch()` from `social-share.tsx` does not trigger CORS preflight.

**#21 — Remove dead method check** (lines 191-194):
Remove the `if (request.method !== "POST")` block in the action. React Router actions only receive POST/PUT/PATCH/DELETE.

**#17, #18 — Remove in-memory rate limiter** (line 60 and related functions):
Remove the `rateLimitStore` Map, `checkRateLimit()` function, and associated constants. On Cloudflare Workers, module-scope state is per-isolate and ephemeral — rate limiting is trivially bypassed by hitting different isolates. The endpoint is currently a no-op (no analytics storage — see comment at line ~220). Add a comment:
```typescript
// NOTE: When analytics storage is implemented, add rate limiting via
// Cloudflare Rate Limiting rules or KV-backed limiting — not in-memory.
```

**#19 — CORS wildcard**: Resolved by removing the dead CORS code in the loader fix above.

### api.$version.[graphql.json].tsx (#22, #23, #24)

**#23 — Version validation**:
```typescript
const VALID_VERSION_PATTERN = /^\d{4}-\d{2}$|^unstable$/;

export async function action({params, context, request}: Route.ActionArgs) {
    if (!params.version || !VALID_VERSION_PATTERN.test(params.version)) {
        return new Response(
            JSON.stringify({error: "Invalid API version"}),
            {status: 400, headers: {"Content-Type": "application/json"}}
        );
    }
    // ...
}
```
Shopify API versions follow `YYYY-MM` (e.g., `2026-01`) or literal `unstable`.

**#22 — Header allowlist**:
```typescript
const ALLOWED_HEADERS = [
    "content-type",
    "accept",
    "x-shopify-storefront-access-token",
    "x-sdk-version",
    "x-sdk-variant",
];

const forwardHeaders = new Headers();
for (const name of ALLOWED_HEADERS) {
    const value = request.headers.get(name);
    if (value) forwardHeaders.set(name, value);
}
```
This strips cookies, Authorization, and ambient headers while preserving what Shopify needs. The `x-shopify-storefront-access-token` header is set by Hydrogen's client-side code and is required for checkout.

**#24 — Body size limit**:
```typescript
const MAX_BODY_SIZE = 100_000; // 100KB

const contentLength = request.headers.get("content-length");
if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return new Response(
        JSON.stringify({error: "Request too large"}),
        {status: 413, headers: {"Content-Type": "application/json"}}
    );
}
```
Shopify's Storefront API enforces its own rate limits (50 req/s for public token) and query cost limits. The body size check prevents egregiously large payloads.

### api.wishlist-products.tsx (#25, #26)

**#25 — Validate parsed IDs** (replace lines 71-78):
```typescript
let ids: unknown;
try {
    ids = JSON.parse(idsString);
} catch {
    return Response.json({products: [], error: "Invalid JSON"}, {status: 400});
}

if (!Array.isArray(ids) || ids.length === 0) {
    return Response.json({products: [], error: null});
}

const GID_PATTERN = /^gid:\/\/shopify\/Product\/\d+$/;
const validIds = ids.filter(
    (id): id is string => typeof id === "string" && GID_PATTERN.test(id)
);

if (validIds.length === 0) {
    return Response.json({products: [], error: null});
}

const limitedIds = validIds.slice(0, 50);
```
The GID pattern prevents querying non-Product types (Customer, Order, etc.) via the `nodes()` query.

**#26 — Error status code** (line 94):
Change `Response.json({products: [], error: "Failed to fetch products"})` to `Response.json({products: [], error: "Failed to fetch products"}, {status: 500})`.

### api.products.$handle.tsx (#27)

Wrap the loader body in try/catch:
```typescript
export const loader = async ({params, context}: Route.LoaderArgs) => {
    const {handle} = params;
    if (!handle) {
        return Response.json({error: "Product handle is required"}, {status: 400});
    }

    try {
        const {product} = await context.dataAdapter.query(QUICK_ADD_PRODUCT_QUERY, {
            variables: {handle},
            cache: context.dataAdapter.CacheNone()
        });

        if (!product) {
            return Response.json({error: "Product not found"}, {status: 404});
        }

        return Response.json({product: normalizeQuickAddProduct(product)});
    } catch (error) {
        console.error("[api.products.$handle] Error:", error);
        return Response.json({error: "Failed to fetch product"}, {status: 500});
    }
};
```

### api.product.recommendations.tsx (#28)

Same try/catch pattern as #27:
```typescript
export const loader = async ({request, context}: Route.LoaderArgs) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    if (!productId) {
        return Response.json({error: "productId is required"}, {status: 400});
    }

    try {
        const {productRecommendations} = await context.dataAdapter.query(
            PRODUCT_RECOMMENDATIONS_QUERY,
            {variables: {productId}}
        );

        return Response.json({
            products: (productRecommendations ?? []).filter((p: any) => p.availableForSale)
        });
    } catch (error) {
        console.error("[api.product.recommendations] Error:", error);
        return Response.json({error: "Failed to fetch recommendations"}, {status: 500});
    }
};
```

## Constraints

- Header allowlist for GraphQL proxy must include `x-shopify-storefront-access-token` or checkout breaks
- Wishlist GID validation must allow Product GIDs only (not Customer, Order, etc.)
- Error response bodies must remain JSON for frontend consumers (`Response.json()`)
- `crypto.getRandomValues()` requires Web Crypto API (available in Workers, not all Node.js versions < 19)

## Execution Order

All 6 files are independent of each other — can be modified in any order or all at once. Within each file, apply changes top-to-bottom.

## Parallelism Notes

This plan touches only API route files (`app/routes/api.*`). No overlap with any other plan. Safe to execute in parallel with all other plans.
