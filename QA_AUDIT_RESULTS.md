# QA Audit Results — storefront_002

**Date:** 2026-04-01
**URL:** http://localhost:3001
**Viewport Tested:** Desktop (1440x900), Mobile (375x812)
**Auditor:** Automated QA via Playwright MCP

---

## Critical (Blocks Purchase / Crashes)

- [/blogs] Intermittent 500 crash on page load — "Cannot read properties of null (reading 'useContext')" with hydration mismatch errors. Page sometimes renders "500 Something Went Wrong" instead of blog content. Caused by duplicate React instances during hydration. Reproducible when Vite HMR has loaded stale module versions.
- [/offline] 500 crash on page load — same "useContext" null error. The offline fallback page renders a bare error screen with no header/footer, making it useless as an offline experience.
- [/account/wishlist] Intermittent 500 crash — "Account Error: Cannot read properties of null (reading 'useContext')". Same root cause as above. When it crashes, cart badge count resets from "Cart (2)" to "Cart" (state lost).
- [/products/*] Intermittent 500 crash on client-side navigation — when navigating to PDP from certain entry points (e.g., after hydration errors on other pages), the PDP renders a 500 error page. Works fine on direct/hard navigation.

## High (Broken Feature / Bad UX)

- [/cart] Route returns 404 — navigating directly to /cart shows "404 Page Not Found". There is no dedicated full-page cart view; only the cart drawer is available. Customers who bookmark or share cart URLs get a dead page.
- [/cart] 404 page layout is broken — unlike the standard 404 (which has header/footer), the /cart 404 renders with no header, no footer, no navigation. Just a bare error message on a dark background.
- [GLOBAL] Duplicate React instances detected — "Invalid hook call" errors appear on multiple pages (/blogs, /offline, /products, /account/wishlist). The console shows "You might have more than one copy of React in the same app." This is the root cause of all intermittent 500 crashes.
- [GLOBAL] PWA manifest parse error on every page — `Manifest: Line: 1, column: 1, Syntax error` fires on every page load. The manifest.webmanifest endpoint returns valid JSON when fetched directly, but the browser's manifest parser rejects it. This blocks PWA installation via the browser's native prompt.
- [FullScreenSearch] DOM nesting violation — `<button>` rendered as descendant of `<button>` inside ProductImageCarousel within search results. Warning: "validateDOMNesting(...): <button> cannot appear as a descendant of <button>."
- [/wishlist] Redirects to /account/wishlist — the header "Wishlist" link points to /wishlist but the footer links to /account/wishlist. The /wishlist route redirects to /account/wishlist, which requires authentication. Unauthenticated users clicking "Wishlist" in the header land on an account-gated page with no public wishlist view.
- [/wishlist/share] Redirects to /account/wishlist — the share wishlist route does not render a public shareable wishlist view. It just redirects to the authenticated wishlist page, defeating the purpose of sharing.

## Medium (Visual Bug / Minor Functional)

- [Homepage] Full-page screenshot shows large dark void — animated sections (product carousels, featured product, testimonials, FAQ, Instagram) use scroll-triggered animations that start invisible. On initial page load without scrolling, the vast majority of the page appears as a black void. This is an SEO/perceived-performance concern for bots and users with reduced motion preferences.
- [Homepage] Hero collection card has unstable animation — the floating "Library Collection" / "Wands" card in the hero section uses `animate-bounce-slow` which makes it impossible to click reliably (Playwright times out because "element is not stable"). Users with motor impairments will struggle to click this bouncing element.
- [Homepage] "Open in App" button persists even though no native app exists — the PWA install button is always visible in the bottom-right corner. Given the manifest parsing errors, clicking it likely fails or produces no result.
- [GLOBAL] Shopify analytics requests fail — `POST https://monorail-edge.shopifysvc.com/v1/produce` requests abort with `net::ERR_ABORTED`. This means analytics/tracking data is not being collected.
- [GLOBAL] Newsletter Subscribe button starts disabled — the Subscribe button in the footer newsletter form is disabled until the user types in the email field. While this is intentional form validation, there is no visible indication to the user why the button is disabled. No helper text like "Enter your email to subscribe" appears near the disabled button.
- [Contact] No contact form — the /contact page only shows email, phone, hours, address, and social links. There is no actual contact form for customers to submit inquiries. Customers must use email/phone instead.
- [PDP] Breadcrumbs missing — the product detail page shows a horizontal collection sidebar/nav but no traditional breadcrumb trail (e.g., Home > Wands > Elder Wand).
- [Search] Currency symbol inconsistency — search results show prices with "taka" symbol (e.g., "BDT 69" on storefront_001 homepage but "69" with taka sign on storefront_002). Within storefront_002, the currency display is consistent, but the BDT currency symbol may confuse international customers if the store targets a global audience.

## Low (Polish / Nitpick)

- [Homepage] "Recently Viewed" count in heading — the section heading says "3 Recently Viewed" or "2 items you've browsed" depending on viewport, mixing the count into the heading. Slightly unusual UX pattern; most stores show the count separately.
- [Homepage] FAQ section on homepage has generic placeholder questions — "What is this?", "Who is this for?", "How does it work?" are not specific to an e-commerce store. These should be replaced with actual product/shipping/returns questions.
- [Homepage] "Follow along" section links to generic instagram.com — all Instagram gallery links point to https://www.instagram.com (the homepage) rather than the brand's actual Instagram profile.
- [Homepage] Social links in footer go to generic platform homepages — Instagram, Facebook, and Threads links all point to the platform root URLs, not actual brand profiles.
- [Collections] "/ All Products" heading uses a leading slash — the forward slash before the collection name (e.g., "/ All Products", "/ Wands", "/ Collections") is a stylistic choice but may look like a broken breadcrumb to some users.
- [FAQ Page] Shows "No articles published yet" for blog — /blogs page sometimes shows this message when no blog articles exist in the demo store. Not a bug per se, but the empty state copy could be more helpful.
- [404] Standard 404 page shows the raw URL path — "nonexistent-page-for-404-test not found" exposes the URL path. Better to show a generic message without exposing internal paths.
- [Account] Account pages show sidebar navigation even when not logged in — the account sidebar (Dashboard, Orders, Wishlist, Account Details) is visible alongside the "Account Required" fallback, which could confuse users into thinking they are partially logged in.
- [PDP] Image thumbnails are buttons, not a traditional thumbnail strip — product images are shown as "View in fullscreen" buttons rather than a scrollable thumbnail gallery. This is a design choice but less conventional.
- [GLOBAL] Vite WebSocket connection errors in console (dev-only) — `WebSocket connection to ws://localhost:3000/ failed` appears because of port mismatch between storefront_001 (3000) and storefront_002 (3001). Dev-only issue.

## Console Errors

- [EVERY PAGE] `Manifest: Line: 1, column: 1, Syntax error` — PWA manifest fails to parse on every navigation
- [/blogs, /offline, /products/*, /account/wishlist] `Invalid hook call` — duplicate React instances cause useContext to fail
- [/blogs] `Hydration failed because the initial UI does not match what was rendered on the server` — SSR/client mismatch
- [/blogs] `An error occurred during hydration. The server HTML was replaced with client content` — full client re-render triggered
- [FullScreenSearch] `validateDOMNesting: <button> cannot appear as descendant of <button>` — ProductImageCarousel nests button in button
- [/account/login] `Failed to load resource: 400` — Shopify OAuth redirect returns 400 (expected in local dev with localhost redirect URI)
- [Homepage] `Failed to load resource: 404` — `/node_modules/.vite/deps/embla-carousel-autoplay.js` returns 404 (missing dependency)

## Failed Network Requests

- [EVERY PAGE] `POST https://monorail-edge.shopifysvc.com/v1/produce` -> ERR_ABORTED — Shopify analytics tracking aborted
- [/cart] `GET http://localhost:3001/cart` -> 404 — no cart route exists
- [Homepage] `GET embla-carousel-autoplay.js` -> 404 — carousel autoplay dependency missing from Vite deps
- [/account/login] `GET https://shopify.com/authentication/...` -> 400 — OAuth redirect fails in local dev (expected)

---

**Total Issues Found:** 29

**Summary:** The storefront has a polished visual design with well-crafted components (hero, product cards, carousels, testimonials, FAQ, Instagram gallery). The core shopping flow (browse collections -> view product -> add to cart -> checkout) works when pages load successfully via hard navigation. However, the codebase suffers from a critical **duplicate React instances** problem that causes intermittent 500 crashes on multiple pages (/blogs, /offline, /account/wishlist, and sometimes /products). The PWA manifest parsing failure blocks native installation. The missing /cart route is a significant gap. These issues should be prioritized for immediate fixing before any client deployment.
