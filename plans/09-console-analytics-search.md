# Plan 7: Console Errors, Analytics & Search

## Summary

Two console errors fire on every page load due to missing Shopify analytics configuration. The favicon route has 4 debug `console.log` statements that execute in production. The search route's error handling attaches `.catch()` handlers but awaits the original unprotected promise, so errors still propagate as unhandled 500 errors.

## Items Covered

- **#11** Console error: `[h2:error:ShopifyAnalytics] Unable to send Shopify analytics: Missing shop.hydrogenSubchannelId configuration`
- **#12** Console error: `Error initializing PerfKit: Either themeInstanceId or storefrontId must be defined`
- **#33** `favicon[.]ico.tsx:82,91,98,108` — Four `console.log` debug statements in production
- **#43** `search.tsx:116-121` — Predictive search `.catch()` on detached chain; errors still propagate
- **#44** `search.tsx:125-130` — Same pattern for regular search

## Current State

- `app/root.tsx:185-188`: `getShopAnalytics({ storefront, publicStorefrontId: env.PUBLIC_STOREFRONT_ID })` — the `PUBLIC_STOREFRONT_ID` env var may not be set, causing the analytics provider to lack the subchannel/storefront ID
- No `PUBLIC_STOREFRONT_ID` documented in `.env.example` or the CLAUDE.md env vars section
- `app/routes/favicon[.]ico.tsx`: Lines 82, 91, 98, 108 have `console.log` with `// eslint-disable-next-line no-console -- intentional debug logging` comments. Line 91 logs the entire query result as JSON on every favicon request
- `app/routes/search.tsx:116-121`:
  ```typescript
  const searchPromise = predictiveSearch({request, context});
  searchPromise.catch((error: Error) => {
      console.error(error);
      return {term: "", result: null, error: error.message};
  });
  return await searchPromise;  // Awaits ORIGINAL promise, not the .catch() chain
  ```
- `app/routes/search.tsx:125-130`: Same broken pattern for regularSearch

## Target State

- Analytics console errors resolved by providing required storefront ID
- No debug logging in production favicon route
- Search errors caught and returned as fallback data instead of propagating as 500 errors

## Implementation Approach

### #33 — Remove Favicon Console Logs

**File**: `app/routes/favicon[.]ico.tsx`

Remove all 4 `console.log` statements at lines 82, 91, 98, 108. Also remove their associated `// eslint-disable-next-line no-console` comments.

Line 91 is especially problematic — it logs the entire GraphQL query result as JSON on every favicon request, which is both a performance concern (serialization cost) and a potential information leak (query structure in server logs).

### #43, #44 — Search Error Handling

**File**: `app/routes/search.tsx`

**#43 — Predictive search** (lines 116-121):

Replace:
```typescript
const searchPromise = predictiveSearch({request, context});
searchPromise.catch((error: Error) => {
    console.error(error);
    return {term: "", result: null, error: error.message};
});
return await searchPromise;
```

With:
```typescript
return await predictiveSearch({request, context}).catch((error: Error) => {
    console.error(error);
    return {term: "", result: null, error: error.message};
});
```

By chaining `.catch()` directly and awaiting the resulting promise, errors are caught and the fallback object is returned instead of the rejection propagating.

**#44 — Regular search** (lines 125-130):

Replace:
```typescript
const searchPromise = regularSearch({request, context});
searchPromise.catch((error: Error) => {
    console.error(error);
});
return await searchPromise;
```

With:
```typescript
return await regularSearch({request, context}).catch((error: Error) => {
    console.error(error);
    return {term: "", result: null, error: error.message};
});
```

The fallback return must match the expected type for the route's component. Check `regularSearch`'s return type and provide a matching fallback structure. If `regularSearch` returns a more complex shape (e.g., with products/articles/pages categories), adjust the fallback:
```typescript
return {
    term: "",
    result: {products: [], articles: [], pages: []},
    error: error.message
};
```

### #11 — Missing hydrogenSubchannelId

**File**: `app/root.tsx` (lines 185-188)

The `getShopAnalytics()` call passes `publicStorefrontId: env.PUBLIC_STOREFRONT_ID`. This env var maps to the Hydrogen channel's Storefront API app ID, which Shopify uses as both the `hydrogenSubchannelId` for analytics routing and the `storefrontId` for PerfKit.

**Investigation**: Check if `PUBLIC_STOREFRONT_ID` is set in `.env`:
```bash
grep PUBLIC_STOREFRONT_ID .env
```

If not set:
1. The value comes from the Shopify admin: Settings > Apps and sales channels > Hydrogen > API access > Storefront API app ID
2. For the demo store, this needs to be obtained from the Shopify admin of `horcrux-demo-store.myshopify.com`
3. Add to `.env`: `PUBLIC_STOREFRONT_ID=<value from Shopify admin>`
4. Add to the env vars documentation in CLAUDE.md: `PUBLIC_STOREFRONT_ID=<storefront-api-app-id>  # Required for analytics`

If already set but still showing the error: verify the value is being passed correctly through the context. Check `app/lib/context.ts` to see if `PUBLIC_STOREFRONT_ID` is included in the env type and passed through.

### #12 — PerfKit Error

This error (`Error initializing PerfKit: Either themeInstanceId or storefrontId must be defined`) is resolved by the same fix as #11. PerfKit uses the `storefrontId` from the analytics configuration, which comes from `PUBLIC_STOREFRONT_ID`. Once the env var is properly set and passed through `getShopAnalytics()`, both console errors should resolve.

If the error persists after setting `PUBLIC_STOREFRONT_ID`, check if the PerfKit initialization requires additional configuration in the Analytics.Provider or if there's a separate `themeInstanceId` that needs to be set (typically only for Shopify themes, not Hydrogen storefronts).

## Constraints

- Search error fallback must match the return type expected by the route's component — check `useLoaderData` destructuring in the SearchPage component
- `PUBLIC_STOREFRONT_ID` is store-specific — the demo store value is different from any client's value. The value must come from the specific Shopify admin
- Favicon console.log removal should not introduce any other changes to the favicon route logic
- The `console.error` in search catch handlers is intentional for server-side logging — keep it

## Execution Order

1. **#33** — Favicon console.logs (trivial removal, no dependencies)
2. **#43, #44** — Search error handling (fix the `.catch()` chain pattern)
3. **#11, #12** — Analytics configuration (may require Shopify admin access for the store ID)

## Parallelism Notes

This plan touches `app/routes/favicon[.]ico.tsx`, `app/routes/search.tsx`, and potentially `app/root.tsx` (for analytics investigation). The root.tsx touch is minimal (verifying the existing `getShopAnalytics` call). Execute after Plan 1 merges to avoid root.tsx conflicts, or coordinate the minimal root.tsx changes. All other plans touch different files.
