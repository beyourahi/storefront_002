# Plan 1: Caching & Query Architecture

## Summary

Every query in the app uses `CacheNone()`, forcing fresh Shopify API round-trips on every page load. The `MENU_COLLECTIONS_QUERY` fetches up to 12,500 product records per navigation. Hardcoded BD/BDT locale prevents multi-client deployment. Cart fragment has a duplicate `nodes` field. These items are grouped because they all involve query definitions, caching policy, and the root data-loading layer.

## Items Covered

- **#2** `fragments.ts:242-249` — Duplicate `nodes` field in CartApiQuery fragment
- **#3** `root.tsx:207-234` — All 6 critical queries use `CacheNone()`
- **#4** `root.tsx:317-327` — Deferred footer/cartSuggestions not wrapped with `withTimeoutAndFallback`
- **#5** `root.tsx:239` — Shipping currency hardcoded to "BDT"
- **#6** `root.tsx:253-259` — `allProducts(first: 250)` ceiling for stores with 250+ products
- **#7** `fragments.ts:393-423` — MENU_COLLECTIONS_QUERY fetches products(first:250) per collection
- **#13** `root.tsx` — HEADER_QUERY missing `shop { ...Shop }` fragment
- **#14** `root.tsx` — consent.country uses hardcoded "BD" instead of `storefront.i18n.country`
- **#29** `api.product.recommendations.tsx` — No caching on recommendations query
- **#42** `[robots.txt].tsx` — No caching on ROBOTS_QUERY
- **#45** `products.$handle.tsx:148-155` — Product + sidebar queries use `CacheNone()`
- **#46** `collections.$handle.tsx:138-151` — Collection + sidebar queries use `CacheNone()`
- **#47** `collections.$handle.tsx:185` — Product count from first page only (max 24)

## Current State

- `app/root.tsx` `loadCriticalData` (lines 207-234): All 6 queries use `storefront.CacheNone()` with comments like "real-time, no cache"
- `app/root.tsx` `loadDeferredData` (lines 317-342): `footer` and `cartSuggestions` use `CacheNone()` and lack timeout wrapping. Cart/isLoggedIn/hasStoreCredit ARE wrapped with `withTimeoutAndFallback()`
- `app/root.tsx:239`: `parseShippingConfig(shopData?.shop?.freeShippingThreshold?.value, "BDT")`
- `app/root.tsx:194`: `consent: { country: STORE_COUNTRY_CODE }` — imports from `store-locale.ts` which is `"BD"`
- `app/lib/fragments.ts:242-249`: CartApiQuery has `lines { nodes { ...CartLine } nodes { ...CartLineComponent } }` — two `nodes` fields in same selection set
- `app/lib/fragments.ts:376-439`: MENU_COLLECTIONS_QUERY fetches `collections(first:50)` each with `products(first:250)` (full objects with id, title, productType, availableForSale), plus `allProducts(first:250)` with variants
- `app/routes/products.$handle.tsx:148-155`: Both PRODUCT_QUERY and SIDEBAR_COLLECTIONS_QUERY use `dataAdapter.CacheNone()`
- `app/routes/collections.$handle.tsx:138-151`: Same — both queries use `CacheNone()`
- `app/routes/[robots.txt].tsx`: Query has no cache option (HTTP response has 24h cache-control but GraphQL call is uncached)
- `app/routes/api.product.recommendations.tsx`: No cache option at all
- `app/lib/promise-utils.ts`: Has `TIMEOUT_DEFAULTS` with CART (10s), AUTH (5s), STORE_CREDIT (5s), API (8s) — no FOOTER or SUGGESTIONS
- `app/lib/data-source.ts:26-57`: DataAdapter exposes `CacheNone()`, `CacheLong()`, `CacheShort()` methods
- Demo-store (`~/Desktop/projects/demo-store/app/root.tsx`): Uses `storefront.CacheLong()` for header query, has `shop { ...Shop }` in HEADER_QUERY, uses `context.storefront.i18n.country` for consent

## Target State

- Appropriate cache tiers per query: `CacheLong()` for layout/menu/metadata, `CacheShort()` for product/collection data
- Deferred promises (footer, cartSuggestions) wrapped with `withTimeoutAndFallback()`
- Currency derived from `shop.paymentSettings.currencyCode`; consent country from `storefront.i18n.country`
- Cart fragment: single `nodes { ...CartLine ...CartLineComponent }` (no duplicate field)
- MENU_COLLECTIONS_QUERY: lightweight payload — only IDs for counting, not full product objects
- `allProducts` query includes `pageInfo.hasNextPage` for 250+ detection
- Collection product count uses total count, not first-page-of-24 count
- HEADER_QUERY includes `shop { ...Shop }` for analytics and fallback brand data

## Implementation Approach

### Phase 1: Fix Cart Fragment (#2)

**File**: `app/lib/fragments.ts` lines 242-249

Replace:
```graphql
lines(first: $numCartLines) {
  nodes {
    ...CartLine
  }
  nodes {
    ...CartLineComponent
  }
}
```

With:
```graphql
lines(first: $numCartLines) {
  nodes {
    ...CartLine
    ...CartLineComponent
  }
}
```

Both fragments use inline type conditions (`... on CartLine`, `... on ComponentizableCartLine`), so merging into one `nodes` selection is semantically identical. The current duplicate-field form relies on GraphQL field merging, which is implementation-specific behavior.

### Phase 2: Caching Overhaul (#3, #29, #42, #45, #46)

**Caching policy by query:**

| Query | File | Current | Target | Rationale |
|---|---|---|---|---|
| HEADER_QUERY | root.tsx | CacheNone | CacheLong | Menu structure changes rarely; demo-store uses CacheLong |
| MENU_COLLECTIONS_QUERY | root.tsx | CacheNone | CacheLong | Catalog metadata, merchant-initiated changes |
| SHOP_SHIPPING_CONFIG_QUERY | root.tsx | CacheNone | CacheLong | Metafield, changes rarely |
| HAS_BLOG_QUERY | root.tsx | CacheNone | CacheLong | Blog existence barely changes |
| SITE_CONTENT_QUERY | root.tsx | CacheNone | CacheLong | CMS metaobject, merchant-updated |
| THEME_SETTINGS_QUERY | root.tsx | CacheNone | CacheLong | Theme colors/fonts, merchant-updated |
| FOOTER_QUERY | root.tsx (deferred) | CacheNone | CacheLong | Footer menu changes rarely |
| CART_SUGGESTIONS_QUERY | root.tsx (deferred) | CacheNone | CacheShort | Catalog shifts slowly |
| PRODUCT_QUERY | products.$handle.tsx | CacheNone | CacheShort | Prices/inventory change but short cache OK |
| SIDEBAR_COLLECTIONS_QUERY | products.$handle.tsx | CacheNone | CacheLong | Catalog metadata |
| COLLECTION_QUERY | collections.$handle.tsx | CacheNone | CacheShort | Product listing with availability |
| SIDEBAR_COLLECTIONS_QUERY | collections.$handle.tsx | CacheNone | CacheLong | Catalog metadata |
| CATALOG_QUERY | collections.all-products.tsx | CacheNone | CacheShort | All-products listing |
| SIDEBAR_COLLECTIONS_QUERY | collections.all-products.tsx | CacheNone | CacheLong | Catalog metadata |
| DISCOUNTS_QUERY | sale.tsx | CacheNone | CacheShort | Sale products |
| SIDEBAR_COLLECTIONS_QUERY | sale.tsx | CacheNone | CacheLong | Catalog metadata |
| ROBOTS_QUERY | [robots.txt].tsx | none | CacheLong | Shop ID never changes |
| RECOMMENDATIONS_QUERY | api.product.recommendations.tsx | none | CacheShort | Recommendations shift slowly |

**Files to modify**: `app/root.tsx`, `app/routes/products.$handle.tsx`, `app/routes/collections.$handle.tsx`, `app/routes/collections.all-products.tsx`, `app/routes/sale.tsx`, `app/routes/[robots.txt].tsx`, `app/routes/api.product.recommendations.tsx`

Update cache option in each query call. Replace comments like `// real-time, no cache` with `// cached: layout data, changes require cache expiry`.

### Phase 3: Timeout Protection (#4)

**File**: `app/lib/promise-utils.ts` — add to TIMEOUT_DEFAULTS:
```typescript
FOOTER: 8000,
SUGGESTIONS: 8000,
```

**File**: `app/root.tsx` `loadDeferredData` — wrap footer and cartSuggestions:
```typescript
const footerWithTimeout = withTimeoutAndFallback(footer, null, TIMEOUT_DEFAULTS.FOOTER);
const cartSuggestionsWithTimeout = withTimeoutAndFallback(cartSuggestions, null, TIMEOUT_DEFAULTS.SUGGESTIONS);
```
Return wrapped versions in the return object.

### Phase 4: Locale Hardcoding (#5, #14)

**#14** — `app/root.tsx:194`: Change `country: STORE_COUNTRY_CODE` to `country: args.context.storefront.i18n.country`. This matches the demo-store pattern and makes consent locale-aware.

**#5** — `app/root.tsx:239`: Extend SHOP_SHIPPING_CONFIG_QUERY to fetch currency:
```graphql
query ShopShippingConfig($country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
    shop {
        freeShippingThreshold: metafield(namespace: "custom", key: "free_shipping_threshold") {
            value
            type
        }
        paymentSettings {
            currencyCode
        }
    }
}
```
Use `shopData.shop.paymentSettings.currencyCode` as currency with "BDT" as fallback:
```typescript
const shippingConfig = parseShippingConfig(
    shopData?.shop?.freeShippingThreshold?.value,
    shopData?.shop?.paymentSettings?.currencyCode ?? "BDT"
);
```

### Phase 5: Over-Fetching (#6, #7)

**File**: `app/lib/fragments.ts` — rewrite MENU_COLLECTIONS_QUERY

Replace per-collection `products(first: 250) { nodes { id title productType availableForSale } }` with `products(first: 250, filters: [{available: true}]) { nodes { id } }`. This reduces payload from full product objects (id + title + productType + availableForSale) to just IDs, while maintaining accurate available-product counts via `.nodes.length`.

For `allProducts(first: 250)`, add `pageInfo { hasNextPage }` to the query. In root.tsx processing, surface an `isApproximate` flag when `hasNextPage` is true. Display "250+" in the UI (affects `FullScreenMenu.tsx` and `CollectionSidebar.tsx`).

**File**: `app/root.tsx` — update menuCollectionsData processing to use new shape (collection products are now just `{ id }` arrays, not full product objects).

### Phase 6: Collection Count (#47)

**File**: `app/routes/collections.$handle.tsx`

Line 185 computes `collectionProductCount` from `collection.products.nodes.length` which is max 24 (page size). The query already uses `filters: [{available: true}]`, so all returned nodes are available.

Fix: Add a lightweight count query in parallel with the main collection query:
```graphql
query CollectionCount($handle: String!, $country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
    collection(handle: $handle) {
        products(first: 250, filters: [{available: true}]) {
            nodes { id }
            pageInfo { hasNextPage }
        }
    }
}
```
Use `CacheLong()`. Run in `Promise.all` alongside existing queries. Use `.nodes.length` as count, with `hasNextPage` indicating approximation.

### Phase 7: Shop Fragment (#13)

**File**: `app/lib/fragments.ts` — add Shop fragment and include in HEADER_QUERY:
```graphql
fragment Shop on Shop {
    id
    name
    description
    primaryDomain { url }
    brand {
        logo {
            image { url }
        }
    }
}

query Header(...) {
    shop { ...Shop }
    menu(handle: $headerMenuHandle) { ...Menu }
}
```

This provides analytics data (`shop.id`, `shop.name`) and fallback brand info (`shop.brand.logo`). The demo-store includes this by default.

## Constraints

- `CacheLong()` introduces delay for merchant content updates. Acceptable trade-off — Hydrogen's `shouldRevalidate` in root already returns `false` for GET navigations, so root data is only loaded once per session anyway
- `allProducts(first: 250)` is a Storefront API ceiling. Stores with 250+ products get approximate counts — mitigated by showing "250+"
- Cart fragment change requires testing all cart operations: add, update quantity, remove, discount code, gift card
- The MENU_COLLECTIONS_QUERY rewrite changes the data shape consumed by root.tsx processing — all dependent code must be updated

## Execution Order

Phases 1-7 are sequential within this plan (shared files: `root.tsx`, `fragments.ts`):
1. Cart fragment fix (standalone, quick)
2. Caching overhaul (highest impact)
3. Timeout protection (small, depends on understanding deferred flow)
4. Locale hardcoding (extends shipping query)
5. Over-fetching (largest scope, changes MENU_COLLECTIONS_QUERY shape)
6. Collection count (new count query)
7. Shop fragment (extends HEADER_QUERY)

## Parallelism Notes

This plan touches `root.tsx` and `fragments.ts` extensively. Plans 4, 6, and 7 also touch `root.tsx` — execute those **after** this plan merges to avoid conflicts. Plans 2, 3, 5, 8, 9 touch entirely different files and can run in parallel.
