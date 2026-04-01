# Plan 3: Security Hardening (CSP, XSS, Open Redirects)

## Summary

CSP policy includes hardcoded ngrok development domains that ship to production and is missing `frame-ancestors` to prevent clickjacking. The GTM script component injects a container ID into an inline script without sanitization, enabling XSS. Cart and discount routes accept arbitrary redirect URLs, enabling open redirect attacks. These items are grouped because they all involve security boundary hardening across different attack surfaces.

## Items Covered

- **#30** `entry.server.tsx:97-98` — CSP `connectSrc` includes hardcoded ngrok dev domain
- **#31** `entry.server.tsx` — CSP missing `frame-ancestors` directive
- **#32** `GtmScript.tsx:67` — GTM container ID interpolated without sanitization
- **#38** `cart.tsx:189-196` — `redirectTo` parameter accepts arbitrary URLs (open redirect)
- **#40** `discount.$code.tsx:83` — Trailing `?` when searchParams is empty
- **#41** `discount.$code.tsx:75` — Open redirect bypass via URL-encoded `//`

## Current State

- `app/entry.server.tsx:96-98`: `connectSrc` includes `"wss://hermelinda-nonsegmentary-hettie.ngrok-free.dev:*"` and `"https://hermelinda-nonsegmentary-hettie.ngrok-free.dev"` — hardcoded dev tunnel
- `app/entry.server.tsx`: No `frameAncestors` directive in `createContentSecurityPolicy()` call
- `app/components/GtmScript.tsx:67`: Template literal interpolation of `gtmContainerId` inside an inline script tag. A malformed ID like `'); alert('xss` breaks out of the string context. The component uses the Script component with inner HTML set to a GTM initialization snippet
- `app/routes/cart.tsx:189-196`: `formData.get("redirectTo")` used directly as redirect destination. Special-cases `__checkout_url__` but any other string is accepted verbatim, including `javascript:`, `data:`, or external URLs
- `app/routes/discount.$code.tsx:75`: `redirectParam.includes("//")` only catches literal `//`. URL-encoded `%2f%2f`, backslash variants `\/\/`, and protocol-relative URLs bypass this check
- `app/routes/discount.$code.tsx:83`: Template string always appends `?` followed by searchParams even when the params string is empty

## Target State

- CSP excludes dev-only domains in production; includes `frame-ancestors 'none'` to prevent clickjacking
- GTM container ID validated against the known format before injection
- Cart `redirectTo` restricted to relative paths (or the trusted `__checkout_url__` sentinel)
- Discount redirect fully validated using URL parsing (not string matching)
- No trailing `?` in redirect URLs when query string is empty

## Implementation Approach

### entry.server.tsx (#30, #31)

**#30 — Remove ngrok domains** (lines 96-98):

Option A (remove entirely — preferred):
Remove the two ngrok entries from the `connectSrc` array. Keep only Shopify and Google domains.

Option B (environment-conditional, if dev tunnel is still needed locally):
Wrap the ngrok entries in a `process.env.NODE_ENV === "development"` check using array spread.

**#31 — Add frame-ancestors**:
Add `frameAncestors: ["'none'"]` to the `createContentSecurityPolicy()` options object. This prevents clickjacking by blocking iframe embedding from any origin.

### GtmScript.tsx (#32)

**File**: `app/components/GtmScript.tsx` line 55 area

Add validation before the component renders. GTM container IDs always match `GTM-` followed by uppercase alphanumeric characters (e.g., `GTM-XXXXXXX`):

```typescript
if (!gtmContainerId || !isClient) return null;

// Validate GTM container ID format to prevent script injection
if (!/^GTM-[A-Z0-9]+$/.test(gtmContainerId)) return null;
```

This rejects any non-conforming ID before it reaches the inline script template. Any value that does not match the `GTM-[A-Z0-9]+` pattern is invalid and potentially malicious.

### cart.tsx (#38)

**File**: `app/routes/cart.tsx` lines 189-196

Fix: validate that non-checkout redirects are relative paths:

```typescript
const redirectTo = formData.get("redirectTo") ?? null;
if (typeof redirectTo === "string") {
    let destination: string | null = null;
    if (redirectTo === "__checkout_url__") {
        destination = cartResult?.checkoutUrl ?? null;
    } else if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
        destination = redirectTo;
    }
    if (destination) {
        status = 303;
        headers.set("Location", destination);
    }
}
```

This rejects `javascript:`, `data:`, external URLs, and protocol-relative URLs (`//evil.com`). The `__checkout_url__` path maps to Shopify's checkout URL which is trusted.

### discount.$code.tsx (#40, #41)

**File**: `app/routes/discount.$code.tsx`

**#41 — Proper redirect validation** (line 75):

Replace the `includes("//")` check with URL-based validation:

```typescript
// Validate redirect is a safe relative path (not external URL)
try {
    const parsed = new URL(redirectParam, "http://localhost");
    if (parsed.origin !== "http://localhost") {
        redirectParam = "/";
    }
} catch {
    redirectParam = "/";
}
// Additional check: must start with /
if (!redirectParam.startsWith("/")) {
    redirectParam = "/";
}
```

The `new URL()` constructor with a base URL resolves any relative URL against the base. If the result has a different origin (meaning the input was an absolute URL like `https://evil.com` or a protocol-relative `//evil.com`), the redirect is rejected. This catches all bypass vectors including URL-encoded variants, backslash tricks, and protocol-relative URLs.

**#40 — Trailing `?` fix** (line 83):

Replace the unconditional template string:
```typescript
const qs = searchParams.toString();
const redirectUrl = qs ? `${redirectParam}?${qs}` : redirectParam;
```

This only appends `?` and the query string when there are actual parameters to include.

## Constraints

- CSP changes affect ALL page loads — must verify: Shopify checkout flow, Google Fonts loading, GTM script execution, analytics requests, Customer Account API
- GTM validation regex `^GTM-[A-Z0-9]+$` must cover all legitimate GTM container ID formats (they are always uppercase alphanumeric after the `GTM-` prefix)
- Cart redirect validation must not break the checkout flow — `__checkout_url__` maps to Shopify-provided `checkoutUrl` which is always a valid Shopify domain
- Discount redirect validation must work with Shopify's various redirect patterns (e.g., `/collections/sale`, `/products/xyz?variant=123`)

## Execution Order

All 4 files are independent — any order works. Within `discount.$code.tsx`, fix #41 before #40 since #41 changes the control flow around the redirect parameter.

## Parallelism Notes

This plan touches `entry.server.tsx`, `GtmScript.tsx`, `cart.tsx`, `discount.$code.tsx`. No overlap with Plans 1, 2, 4, 7, 8, 9. Cart.tsx overlap with Plan 5 — if running in the same worktree, do Plan 3's cart fix first (line 189-196) then Plan 5's fixes (lines 127-179, 185-186). The affected line ranges do not overlap.
