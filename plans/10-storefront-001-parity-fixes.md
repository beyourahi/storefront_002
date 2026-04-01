# Plan 10: storefront_001 Parity Fixes

## Summary

These are fixes and improvements already proven in `storefront_001` that have **not** been applied to `storefront_002`. Each item was verified against Shopify Hydrogen docs (shopify-dev MCP) and cross-referenced against the existing 57 uncommitted changes and Plans 01–09 to eliminate duplicates.

**Scope**: 16 items across 5 parallel workstreams, touching ~30 files.

**Verification basis**:
- Hydrogen SEO docs confirm `getSeoMeta` supports `url` (canonical), `jsonLd` (structured data), and `meta` exports on all routes.
- Hydrogen analytics docs confirm dedicated `product_added_to_cart` / `product_removed_from_cart` subscribe events exist (better than manual delta from `cart_updated`).
- `OptimisticCart<T>` is the official return type of `useOptimisticCart` — `as any` casts are unnecessary.
- `react-router-dom` and `next-themes` are not Hydrogen dependencies. Hydrogen uses `react-router` only.
- Hydrogen robots.txt docs say Oxygen overrides robots.txt on non-production deployments, so blocking `/policies/` in the template actively harms production SEO.

---

## Execution Strategy

**All 5 workstreams run in parallel** using git worktrees and sub-agents. Each worktree gets a narrow, focused scope with no cross-dependencies.

```bash
# From storefront_002 root — create all worktrees
git worktree add ../storefront_002-ws1-rate-limit
git worktree add ../storefront_002-ws2-deps-cleanup
git worktree add ../storefront_002-ws3-seo-meta
git worktree add ../storefront_002-ws4-ssr-perf
git worktree add ../storefront_002-ws5-gtm-css

# After all agents complete, merge changes back to main worktree
# Then clean up:
git worktree remove ../storefront_002-ws1-rate-limit
git worktree remove ../storefront_002-ws2-deps-cleanup
git worktree remove ../storefront_002-ws3-seo-meta
git worktree remove ../storefront_002-ws4-ssr-perf
git worktree remove ../storefront_002-ws5-gtm-css
git worktree prune
```

**Sub-agent dispatch**: Launch 5 agents simultaneously, one per workstream. Each agent receives:
- Its workstream scope (files + changes)
- storefront_001 as reference implementation
- Constraints (no cross-workstream file edits)

---

## Pre-flight: Existing Uncommitted Changes

storefront_002 already has 57 modified files with 623 insertions / 400 deletions. These changes **must be committed first** (or stashed) before creating worktrees, so each worktree starts from a clean base. Otherwise, worktrees inherit dirty state and merge conflicts become inevitable.

```bash
# Option A: Commit everything as a checkpoint
git add -A && git commit -m "chore: checkpoint before parity fixes"

# Option B: Stash if not ready to commit
git stash push -m "existing audit work"
```

---

## Workstream 1: API Rate Limiting (HIGH priority)

**Worktree**: `storefront_002-ws1-rate-limit`
**Files**: 6 new/modified

### Context

storefront_002 has **zero rate limiting** on any API endpoint. All 5 public API routes accept unlimited requests. Plan 02 notes the existing `api.share.track.tsx` rate limiter is "ephemeral" and "trivially bypassable" — it needs to be replaced, and the same protection needs to be added everywhere.

The storefront_001 solution uses an in-memory sliding-window rate limiter. On Cloudflare Workers/Oxygen, each isolate has its own Map, so this provides **per-isolate burst protection** — not global rate limiting. This is the best available approach without external state (KV/Durable Objects) and is sufficient for preventing abuse within a single isolate's lifetime.

### Items

| # | File | Change | Reference |
|---|------|--------|-----------|
| 1 | `app/lib/rate-limit.ts` | **Create** — sliding-window rate limiter with per-IP tracking, configurable window/max, periodic cleanup every 100 checks, LRU eviction at 10K entries, `CF-Connecting-IP` / `X-Forwarded-For` extraction, 429 response with `Retry-After` header | storefront_001 `app/lib/rate-limit.ts` |
| 2 | `app/routes/api.newsletter.tsx` | Import limiter, configure 5 req/60s, check at top of `action` | storefront_001 same file |
| 3 | `app/routes/api.product.recommendations.tsx` | Import limiter, configure 30 req/60s, check at top of `loader` | storefront_001 same file |
| 4 | `app/routes/api.products.$handle.tsx` | Import limiter, configure 30 req/60s, check at top of `loader` | storefront_001 same file |
| 5 | `app/routes/api.share.track.tsx` | **Replace** existing broken rate limiter with new module. Configure 30 req/60s. Remove the old in-file `rateLimitStore` Map and `checkRateLimit` function entirely | storefront_001 same file |
| 6 | `app/routes/api.wishlist-products.tsx` | Import limiter, configure 20 req/60s, check at top of `action` | storefront_001 same file |

### Implementation pattern (same for all routes)

```typescript
import {createRateLimiter, getClientIP, getRateLimitResponse} from "~/lib/rate-limit";

const limiter = createRateLimiter({windowMs: 60_000, maxRequests: 30});

export const loader = async ({request, context}: Route.LoaderArgs) => {
    const rateLimitResponse = getRateLimitResponse(limiter.check(getClientIP(request)));
    if (rateLimitResponse) return rateLimitResponse;
    // ... existing logic
};
```

### Verification

- `bun run typecheck` passes
- Each rate-limited route returns 429 with `Retry-After` header after exceeding limit
- Existing route functionality unchanged when under limit

---

## Workstream 2: Dependency Cleanup (MEDIUM priority)

**Worktree**: `storefront_002-ws2-deps-cleanup`
**Files**: 3 modified

### Context

Two packages (`next-themes`, `react-router-dom`) are installed but shouldn't be. `next-themes` is a Next.js package with no Hydrogen equivalent — it's only used by `sonner.tsx` (a shadcn/ui generated file). `react-router-dom` is redundant because Hydrogen re-exports everything from `react-router`.

### Items

| # | File | Change | Reference |
|---|------|--------|-----------|
| 1 | `app/components/ui/sonner.tsx` | Remove `import {useTheme} from "next-themes"`. Replace `const {theme = "system"} = useTheme()` with hardcoded `theme="system"` on the `<Sonner>` component | storefront_001 `app/components/ui/sonner.tsx` |
| 2 | `package.json` | Remove `"next-themes"` and `"react-router-dom"` from dependencies | storefront_001 `package.json` |
| 3 | `bun.lock` | Regenerate by running `bun install` after package.json changes | — |

### Verification

- `bun install` succeeds
- `bun run build` succeeds (no broken imports)
- `grep -r 'next-themes' app/` returns zero matches
- `grep -r 'react-router-dom' app/` returns zero matches
- Toast notifications still work (sonner renders with system theme)

---

## Workstream 3: SEO & Meta Exports (MEDIUM priority)

**Worktree**: `storefront_002-ws3-seo-meta`
**Files**: ~17 modified

### Context

Hydrogen's `getSeoMeta` supports `jsonLd` for structured data and `url` for canonical URLs. storefront_002 already uses `buildCanonicalUrl` on content routes, but:
- 12+ redirect/utility routes have no `meta` export at all (no `<title>`, no `noindex`)
- `FALLBACK_SITE_URL` is `"https://example.com"` which leaks into production structured data
- Homepage has no Organization JSON-LD
- FAQ JSON-LD is injected via inline script instead of through `getSeoMeta`
- `robots.txt` blocks `/policies/` (preventing legal page indexing) and has inconsistent `/search` rules
- `dateModified` in blog schema always equals `datePublished` with no explanatory comment

### Items

| # | File | Change |
|---|------|--------|
| 1 | `app/lib/seo.ts` | Change `FALLBACK_SITE_URL` from `"https://example.com"` to `""`. Update `buildCanonicalUrl` to handle empty siteUrl gracefully (return path-only when base is empty). Add comment on `dateModified = datePublished` explaining Shopify API limitation |
| 2 | `app/routes/$.tsx` | Add `export const meta` with `{title: "Page Not Found"}` and `{name: "robots", content: "noindex"}` |
| 3 | `app/routes/cart.tsx` | Add `export const meta` with `{title: "Cart"}` and `{name: "robots", content: "noindex"}` |
| 4 | `app/routes/wishlist.tsx` | Add `export const meta` with `{title: "Redirecting..."}` and `{name: "robots", content: "noindex"}` |
| 5 | `app/routes/cart.$lines.tsx` | Add `export const meta` with `{title: "Redirecting..."}` and `{name: "robots", content: "noindex"}` |
| 6 | `app/routes/discount.$code.tsx` | Add `export const meta` with `{title: "Redirecting..."}` and `{name: "robots", content: "noindex"}` |
| 7 | `app/routes/collections.all.tsx` | Add `export const meta` with `{title: "Redirecting..."}` and `{name: "robots", content: "noindex"}` |
| 8 | `app/routes/account.$.tsx` | Add `export const meta` with `{title: "Redirecting..."}` and `{name: "robots", content: "noindex"}` |
| 9 | `app/routes/account.addresses.tsx` | Add `export const meta` with `{title: "Redirecting..."}` and `{name: "robots", content: "noindex"}` |
| 10 | `app/routes/[robots.txt].tsx` | Remove `Disallow: /policies/` line. Remove `Allow: /search/` line (consolidate to just `Disallow: /search`) |
| 11 | `app/routes/_index.tsx` | Import and emit `generateOrganizationSchema` via `getSeoMeta({jsonLd: ...})` — pulls brand name, logo, social links from root data |
| 12 | `app/routes/faq.tsx` | Move FAQ JSON-LD from inline script into the `meta` export via `getSeoMeta({jsonLd: faqSchema})`. Remove the inline script element. Add proper `description` to meta |
| 13 | `app/root.tsx` | Replace `<html lang="en">` with `<html lang={STORE_LANGUAGE_CODE.toLowerCase()}>` using import from `~/lib/store-locale`. Add `\|\| "0"` fallback to `publicStorefrontId` in `getShopAnalytics` call |

### Verification

- `bun run typecheck` passes
- `bun run build` succeeds
- View page source on each modified route: confirm `<title>` and `<meta name="robots">` present
- Homepage source: confirm Organization JSON-LD in `<head>`
- FAQ page source: confirm FAQPage JSON-LD via meta tags (not inline script)
- `/robots.txt` output: no `/policies/` disallow, clean `/search` rules
- Product/collection structured data: no `example.com` URLs

---

## Workstream 4: SSR & Performance (MEDIUM priority)

**Worktree**: `storefront_002-ws4-ssr-perf`
**Files**: ~4 modified

### Context

Three performance and SSR issues that are independent of each other but small enough to group:

1. `useInView` hook starts with `useState(disabled)` which means content is **invisible during SSR** until JavaScript hydrates and IntersectionObserver fires. This causes "black rectangles" for any content wrapped in `AnimatedSection`. The fix: start visible (`useState(true)`), then after mount hide and animate in.

2. `useGeneratedTheme` calls `generateTheme()` on every render without memoization, creating a new theme object each time. Wrap in `useMemo`.

3. `metaobject-parsers.ts` has ~20 `any` type annotations that bypass TypeScript's safety. Replace with proper `MetaobjectField` / `MetaobjectData` types with runtime narrowing.

### Items

| # | File | Change | Reference |
|---|------|--------|-----------|
| 1 | `app/hooks/useInView.ts` | Change `useState(disabled)` to `useState(true)`. Add `const [mounted, setMounted] = useState(false)`. In `useEffect`: set `inView` to `false` then `mounted` to `true` before creating IntersectionObserver. Return `mounted` from hook. Handle `prefers-reduced-motion` by keeping `inView` true | storefront_001 `app/hooks/useInView.ts` |
| 2 | `app/components/sections/AnimatedSection.tsx` (or equivalent) | Use `mounted` from `useInView` — only apply animation CSS classes after mount so SSR output is fully visible. Pattern: `mounted && baseClasses`, `mounted && transitionClasses` | storefront_001 `app/components/sections/AnimatedSection.tsx` |
| 3 | `app/lib/site-content-context.tsx` | Wrap `generateTheme(...)` call in `useGeneratedTheme` with `useMemo(() => generateTheme(colors, fonts, borderRadius), [colors, fonts, borderRadius])` | storefront_001 `app/lib/site-content-context.tsx` |
| 4 | `app/lib/metaobject-parsers.ts` | Define `MetaobjectField` and `MetaobjectData` types. Replace all `any` parameter types in parser functions (`parseHeroMedia`, `parseBrandWords`, `parseAnnouncementTexts`, `parseFeaturedProductSection`, `parseFreeShippingThreshold`, `parseSocialLinks`, `parseTestimonialsJson`, `parseFaqItemsJson`, `parseInstagramMedia`, `parseThemeFonts`, `parseThemeColors`, `parseThemeSettings`, `parseSiteSettings`) with `MetaobjectField` or `MetaobjectData`. Add proper runtime narrowing with type assertions after null checks | storefront_001 `app/lib/metaobject-parsers.ts` |

### Verification

- `bun run typecheck` passes with zero errors
- `bun run build` succeeds
- SSR output: content wrapped in AnimatedSection is visible in page source (not hidden via CSS)
- After hydration: animations work normally
- `grep ': any' app/lib/metaobject-parsers.ts` returns zero matches (or near-zero — some `as any` casts in JSON-LD may remain)

---

## Workstream 5: GTM Analytics & CSS (LOW priority)

**Worktree**: `storefront_002-ws5-gtm-css`
**Files**: 2 modified

### Context

1. **GTM cart tracking** currently compares `prevTotal` vs `currTotal` (aggregate quantities) to decide `add_to_cart` vs `remove_from_cart`. This fires the wrong event when a user removes one item and adds another in the same cart update — the totals might be equal or the delta misleading. Hydrogen provides dedicated `product_added_to_cart` and `product_removed_from_cart` subscribe events, but the richer approach is per-line-item delta comparison (as implemented in storefront_001) which captures quantity changes and reports accurate item-level data to GTM.

2. **Mobile horizontal overflow** — no `overflow-x: clip` on `<body>`, which can cause horizontal scroll on narrow viewports (375px).

### Items

| # | File | Change | Reference |
|---|------|--------|-----------|
| 1 | `app/components/GtmScript.tsx` | In the `cart_updated` subscriber: build `prevMap` and `currMap` (keyed by line ID to quantity). Compute `addedItems` (new lines or increased quantity — report delta). Compute `removedItems` (deleted lines or decreased quantity — report delta). Fire separate `add_to_cart` and `remove_from_cart` dataLayer pushes with accurate per-item data. Remove the old `prevTotal`/`currTotal` comparison | storefront_001 `app/components/GoogleTagManager.tsx` |
| 2 | `app/styles/tailwind.css` | Add `body { overflow-x: clip; }` near the top of the file, before theme tokens | storefront_001 `app/styles/app.css` |

### Verification

- Open cart, add an item: GTM dataLayer shows `add_to_cart` with correct item and quantity delta
- Remove an item: GTM dataLayer shows `remove_from_cart` with correct item
- Change quantity: fires the right event with the right delta
- Mobile viewport (375px): no horizontal scrollbar

---

## Overlap with Existing Plans

Some items in this plan touch the same files as Plans 01–09. Coordinate carefully:

| This plan | Existing plan | Overlap | Resolution |
|-----------|--------------|---------|------------|
| WS1 (rate limiting on api.share.track) | Plan 02 (item 17–21) | Same file | WS1 replaces the broken in-file rate limiter; Plan 02 fixes CORS/dead code. Apply WS1 first, then Plan 02 on top |
| WS3 (robots.txt) | Plan 01 (caching) | robots.txt caching | WS3 only changes disallow rules, not caching. No conflict |
| WS3 (root.tsx lang + publicStorefrontId) | Plans 01, 07, 09 | Same file | WS3 changes only the `<html lang>` attribute and `getShopAnalytics` call. Non-overlapping hunks |
| WS3 (homepage Organization schema) | — | _index.tsx | No overlap — _index.tsx is not touched by other plans |
| WS4 (metaobject-parsers.ts) | Plan 01 (caching/queries) | Same file | WS4 changes type annotations only, Plan 01 changes caching. Non-overlapping |

---

## Post-implementation

After all 5 workstreams complete:

```bash
# Verify everything together
bun run typecheck
bun run lint
bun run build

# If build succeeds, commit each workstream as a separate atomic commit:
# feat: add rate limiting to all API routes
# chore: remove next-themes and react-router-dom dependencies
# fix: SEO meta exports, canonical URLs, and structured data
# perf: fix useInView SSR, memoize theme generation, remove any types
# fix: GTM per-item cart tracking and mobile overflow
```

---

## Items NOT included (already done or covered elsewhere)

These storefront_001 fixes are **already applied** in storefront_002's uncommitted changes or existing plans:

| Fix | Status |
|-----|--------|
| Newsletter `crypto.getRandomValues` | Already in uncommitted changes |
| Ngrok CSP removal | Already in uncommitted changes (fully removed, not DEV-gated) |
| Open redirect URL constructor fix | Already in uncommitted changes |
| Cart drawer `SheetTitle`/`SheetDescription` a11y | Already in uncommitted changes |
| Manifest `short_name` word-boundary truncation | Already in uncommitted changes |
| GraphQL proxy version validation + header allowlist | Already done (pre-existing) |
| Canonical URLs on content routes | Already done (pre-existing) |
| Collection JSON-LD schema | Already done (pre-existing) |
| `react-icons` removal | Never used in storefront_002 |
| Dead policy components | Never existed in storefront_002 |
| `text-format.ts` XSS | File does not exist in storefront_002 |
| `/blogs` 404 to empty state | Covered by Plan 05 |
| Cart `Money` hydration nesting | Needs investigation — storefront_002 uses custom `Money` component, not Hydrogen's |
