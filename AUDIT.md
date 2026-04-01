# Audit Findings — storefront_002

**Date**: 2026-03-27
**Scope**: Full frontend UI/UX + backend implementation audit

---

1. React Router version mismatch — Hydrogen requires 7.9.x but 7.12.0 is installed, which may cause routing, code splitting, and other issues (dev server startup warning)
2. `app/lib/fragments.ts:242-249` — Duplicate `nodes` field in `CartApiQuery` fragment selects `nodes { ...CartLine }` then `nodes { ...CartLineComponent }` in the same selection set; GraphQL merges these, so `CartLineComponent` fragment is applied to `CartLine` nodes and silently fails on type mismatch
3. `app/root.tsx:207-234` — All 6 critical queries in `loadCriticalData` use `CacheNone()` (header, menu collections, shipping, blog, site content, theme settings), forcing fresh Shopify API calls on every page load with zero caching; demo-store uses `CacheLong()`
4. `app/root.tsx:317-327` — Deferred `footer` and `cartSuggestions` promises also use `CacheNone()` and are not wrapped with `withTimeoutAndFallback` unlike cart/isLoggedIn/hasStoreCredit; if these hang, footer and cart suggestions show infinite loading
5. `app/root.tsx:239` — Shipping currency is hardcoded to `"BDT"` making the template non-portable for client deployments using different currencies
6. `app/root.tsx:253-259` — `MENU_COLLECTIONS_QUERY` fetches `allProducts(first: 250)` so stores with more than 250 products will have inaccurate `totalProductCount`, `discountCount`, and `popularSearchTerms`
7. `app/lib/fragments.ts:393-423` — `MENU_COLLECTIONS_QUERY` fetches `products(first: 250)` for each of up to 50 collections, potentially requesting data for 12,500 products per navigation, all with `CacheNone()`
8. `app/root.tsx:540` — ErrorBoundary renders a full `<html>` document but React Router wraps it inside the Layout which already renders `<html>`, causing `validateDOMNesting` errors and hydration mismatches on every error/404 page
9. `app/root.tsx:555-557` — `trackErrorBoundary` is called as a side effect during render via `setTimeout` outside of `useEffect`, violating React's render purity rules
10. `app/routes/account.tsx:282-284` — Same render-time side effect pattern for `trackErrorBoundary` as root ErrorBoundary
11. Console error on every page: `[h2:error:ShopifyAnalytics] Unable to send Shopify analytics: Missing shop.hydrogenSubchannelId configuration`
12. Console error on every page: `Error initializing PerfKit: Either themeInstanceId or storefrontId must be defined`
13. `app/root.tsx` HEADER_QUERY is missing the `shop { ...Shop }` fragment that demo-store includes for analytics/layout data
14. `app/root.tsx` consent.country uses hardcoded `STORE_COUNTRY_CODE` ("BD") instead of `args.context.storefront.i18n.country` which is the canonical pattern
15. `app/routes/api.newsletter.tsx:94` — `Math.random()` used for password generation instead of `crypto.getRandomValues()`
16. `app/routes/api.newsletter.tsx` — No `loader` export, so GET requests return default React Router behavior instead of a clean 405
17. `app/routes/api.share.track.tsx:60` — In-memory `rateLimitStore` Map resets on every worker restart and is per-isolate, making rate limiting trivially bypassable
18. `app/routes/api.share.track.tsx:60` — The `rateLimitStore` Map never evicts expired entries, causing a memory leak within a worker's lifetime
19. `app/routes/api.share.track.tsx:165` — `Access-Control-Allow-Origin: *` allows any origin; should be restricted to the store's domain in production
20. `app/routes/api.share.track.tsx:161-173` — CORS preflight handling in loader is non-functional because React Router loaders only receive GET requests; OPTIONS never reaches the loader
21. `app/routes/api.share.track.tsx:191-194` — Redundant `request.method !== "POST"` check in action is dead code since React Router only routes POST/PUT/PATCH/DELETE to actions
22. `app/routes/api.$version.[graphql.json].tsx:62-71` — GraphQL proxy forwards raw `request.headers` including cookies and authorization headers to Shopify's checkout domain, leaking sensitive headers
23. `app/routes/api.$version.[graphql.json].tsx` — No validation of the `$version` parameter; any string is accepted and interpolated into the Shopify API URL
24. `app/routes/api.$version.[graphql.json].tsx` — No rate limiting, request size limits, or query complexity limits on the GraphQL proxy endpoint
25. `app/routes/api.wishlist-products.tsx:71` — `JSON.parse(idsString) as string[]` casts without validating individual elements; non-string elements are passed unsanitized to the Shopify `nodes()` query
26. `app/routes/api.wishlist-products.tsx:94` — Error response returns HTTP 200 instead of 500, so callers cannot distinguish success from failure via status code
27. `app/routes/api.products.$handle.tsx:14-17` — No try/catch around `context.dataAdapter.query()`; API failures produce unhandled 500 errors instead of structured JSON responses
28. `app/routes/api.product.recommendations.tsx:14-16` — No try/catch around `context.dataAdapter.query()`; same unhandled error issue
29. `app/routes/api.product.recommendations.tsx` — No caching specified for product recommendations query; each request hits Shopify fresh
30. `app/entry.server.tsx:97-98` — CSP `connectSrc` includes hardcoded ngrok development domain that should not ship to production
31. `app/entry.server.tsx` — CSP policy is missing `frame-ancestors` directive to prevent clickjacking
32. `app/components/GtmScript.tsx:67` — GTM container ID is interpolated into inline script via template literal without sanitization; a malformed `PUBLIC_GTM_CONTAINER_ID` enables XSS
33. `app/routes/favicon[.]ico.tsx:82,91,98,108` — Four `console.log` debug statements in production code; line 91 logs entire query result as JSON on every favicon request
34. `app/routes/account.profile.tsx:241-245` — `createAddress` intent requires `addressId` from form data but a new address has no ID; error message "You must provide an address id" is misleading for creation
35. `app/routes/account.profile.tsx:401-411` — Profile PUT handler does not check authentication unlike address and marketing handlers; expired session throws unhandled error instead of returning 401
36. `app/routes/cart.tsx:127-179` — `CustomPromoCodeApply` makes 3 sequential API calls with no atomicity; if the second call fails, the cart is left with an invalid discount code
37. `app/routes/cart.tsx:185-186` — `result.cart.id` is accessed without null-checking `result.cart`; if null, `cart.setCartId(result.cart.id)` throws TypeError
38. `app/routes/cart.tsx:189-196` — `redirectTo` parameter accepts arbitrary URLs enabling open redirect attacks
39. `app/routes/cart.$lines.tsx:71-80` — No validation of variant ID format or quantity; `parseInt` returns `NaN` for non-numeric input creating invalid cart line requests
40. `app/routes/discount.$code.tsx:83` — `redirectUrl` appends trailing `?` when `searchParams` is empty
41. `app/routes/discount.$code.tsx:75` — Open redirect protection only checks for `//` but misses bypass vectors like `\/\/evil.com` or `/%2f/evil.com`
42. `app/routes/[robots.txt].tsx` — No caching on the `ROBOTS_QUERY` GraphQL call; each robots.txt request fetches shop ID fresh
43. `app/routes/search.tsx:116-121` — Predictive search `.catch()` is attached for logging but original uncaught promise is awaited, so errors still propagate as unhandled 500 errors
44. `app/routes/search.tsx:125-130` — Same uncaught promise pattern for `regularSearch`
45. `app/routes/products.$handle.tsx:148-155` — Product query and sidebar collections query both use `CacheNone()` unnecessarily
46. `app/routes/collections.$handle.tsx:138-151` — Collection query and sidebar collections query both use `CacheNone()` unnecessarily
47. `app/routes/collections.$handle.tsx:185` — `collectionProductCount` is computed from first page of 24 products, not the total collection count; inaccurate for collections with more than 24 products
48. `server.ts:113` — Generic 500 error response has no `Content-Type` header set
49. `server.ts:88-89` — Session commit after `handleRequest` may overwrite `Set-Cookie` headers already set by account routes
50. `app/lib/data-source.ts` / `app/lib/context.ts` — `dataAdapter` is attached to Hydrogen context via `Object.assign()` instead of through the canonical `additionalContext` parameter of `createHydrogenContext()`
51. `app/routes/cart.tsx` has redundant `GiftCardCodesUpdate` action alongside newer `GiftCardCodesAdd`/`GiftCardCodesRemove` pattern
52. `/blogs` route returns 404 instead of rendering blog index — should handle empty state gracefully rather than throwing a 404
53. `/gallery` page renders empty — heading shows "The Gallery" but zero gallery images appear below it
54. Policy pages (`/policies/*`) render with light/grey theme that clashes with the site's dark theme; navbar text color switches to blue/teal instead of white/cream
55. `/policies/terms-of-service` and `/policies/privacy-policy` content is pushed below the viewport by excessive top padding, appearing blank at initial viewport
56. `/policies/terms-of-service` contains unfilled placeholder tokens: `[INSERT TRADING NAME]`, `[INSERT BUSINESS ADDRESS]`, `[INSERT BUSINESS PHONE NUMBER]`, etc.
57. `/policies/terms-of-service` references "horcrux-demo-store" instead of the brand name "Dropout Studio"
58. `/manifest.webmanifest` has `"short_name": "Dropout Stud"` (truncated) instead of a meaningful short name
59. `/manifest.webmanifest` has `"icons": []` — empty icons array prevents PWA installation and home screen icon display
60. Cart drawer sheet triggers `DialogContent requires a DialogTitle` accessibility error — missing title for screen readers in `PageLayout.tsx`
61. Cart drawer sheet triggers `Missing Description or aria-describedby` accessibility warning
62. Cart drawer sheet triggers `Function components cannot be given refs` error on `SheetOverlay` in `app/components/ui/sheet.tsx`
63. Homepage `FeaturedProductSpotlight.tsx` produces `Extra attributes from the server: style` hydration warning on `Button > LinkWithRef` element
64. Multiple product pages emit SEO warning: `description should not be longer than 160 characters`
65. 44 of 49 routes have no ErrorBoundary defined and rely entirely on the root ErrorBoundary which renders a full-page error without route-specific context
66. Intermittent 500 crash with `TypeError: Cannot read properties of null (reading 'useContext')` during Vite HMR due to stale vs fresh chunk version mismatches across multiple routes
67. Missing `reset.css` stylesheet that demo-store includes for cross-browser normalization
