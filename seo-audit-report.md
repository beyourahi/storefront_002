# SEO & Metadata Audit — storefront_002

## 1. Executive Summary

storefront_002 has a well-structured SEO foundation: `getSeoMeta()` is consistently used, all four dynamic content types (products, collections, articles, blogs) correctly request and consume `seo { title description }` from the Storefront API with graceful fallbacks, robots.txt and sitemap.xml are functional, and structured data coverage spans 6 schema types. However, **four critical gaps undermine production readiness**. The root `meta()` PWA tags are silently dropped on every single page due to React Router 7's replacement (not merge) behavior. `og:type`, `og:site_name`, and `twitter:card` are entirely absent across all 17 audited routes, making all social sharing previews blank or minimal. The Product and ItemList JSON-LD schemas use relative paths in `offers.url` and `itemListElement[n].url`, directly failing Google's rich result requirements. The canonical URL strategy depends on a metaobject `siteUrl` field — when unconfigured in a new client deployment, all canonicals emit relative paths, which Google does not recognize as valid. Playwright MCP had browser initialization issues during this audit; HTML was extracted via SSR curl analysis against the live dev server on port 3000.

---

## 2. Meta Tag System Overview

| Route | Title | Desc | Canonical | og:image | robots | JSON-LD Types |
|-------|-------|------|-----------|----------|--------|---------------|
| `/` | ⚠ (14 chars, no keyword) | ✓ | ✓ | ✗ | ✓ | Organization |
| `/products/[handle]` | ✓ | ✓ | ✓ | ✓ | ✓ | Product |
| `/collections/[handle]` | ⚠ (no brand suffix) | ✓ | ✓ | ✓ | ✓ | ItemList |
| `/collections` | ⚠ (11 chars) | ✓ | ✓ | ✗ | ✓ | — |
| `/collections/all-products` | ⚠ (12 chars) | ⚠ (58 chars) | ✓ | ✗ | ✓ | ItemList |
| `/faq` | ⚠ (no brand suffix) | ✓ | ✓ | ✗ | ✓ | FAQPage |
| `/contact` | ⚠ (no brand suffix) | ✓ | ✓ | ✗ | ✓ | — |
| `/gallery` | ⚠ (no brand suffix) | ⚠ (63 chars) | ✓ | ✗ | ✓ | — |
| `/sale` | ⚠ (no brand suffix) | ⚠ (55 chars) | ✓ | ✗ | ✓ | — |
| `/blogs` | ⚠ (no brand suffix) | ✓ | ✓ | ✗ | ✓ | — |
| `/blogs/[handle]` | ✓ | ✓ | ✓ | ⚠ (absent if no featured article) | ✓ | — |
| `/blogs/[handle]/[article]` | ✓ | ✓ | ✓ | ✓ | ✓ | BlogPosting |
| `/cart` | ✓ | ✗ | ✗ | ✗ | ✓ noindex | — |
| `/search` | ✓ | ✓ | ✓ | ✗ | ✓ noindex,follow | — |
| `/account` sub-routes | ⚠ | ✗ | ✗ | ✗ | ✗ MISSING noindex | — |
| `/account/wishlist` | ✓ | ✓ | ✓ | ✗ | ✗ (blocked by robots.txt) | — |
| `/policies/[handle]` | ⚠ (no brand suffix) | ✓ | ✓ | ✗ | ✓ | — |

**Universal absences across all 17 routes:** `og:type`, `og:site_name`, `twitter:card`

---

## 3. Playwright Rendered Head Findings

**Audit method note:** Playwright MCP and Chrome DevTools MCP both experienced browser session initialization failures during this audit. All head data was extracted using `curl` + Python analysis against the live SSR output on port 3000, which captures the full server-rendered HTML including all React Router meta output. The findings below reflect what search engines and social crawlers actually receive from the SSR layer.

**Root meta() PWA tag drop:** `root.tsx` declares `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, `mobile-web-app-capable`, and `format-detection` in its `meta()` export. None of these appear in rendered HTML on any page. React Router 7 meta is collected from matched route hierarchy — child routes replace the parent array entirely.

**Duplicate meta tags:** None found anywhere. The replacement behavior prevents duplicates but causes silent omission of parent-level tags.

**Canonical URLs:**
- All configured pages: canonical resolves to `https://dropoutstudio.co/[path]` (metaobject `siteUrl` is set in the demo store)
- `/cart` and `/account` sub-routes: no canonical present (acceptable given noindex status of cart, but account routes need noindex added)

**Social preview quality:**
- Products and collections with images: og:image, og:title, og:description present — passable social preview but missing `og:type`, `twitter:card`
- All static pages (homepage, FAQ, contact, gallery, sale, blogs): no og:image at all — blank social preview

**Structured data:**
- `FAQPage` on `/faq`: valid JSON, 5 well-formed Q&A pairs — rich result eligible ✓
- `Product` on `/products/[handle]`: valid JSON but `offers.url` is relative path — fails Google validation ✗
- `ItemList` on `/collections/[handle]`: valid JSON but `itemListElement[n].url` values are all relative ✗
- `Organization` on `/`: valid JSON but `logo` field null (no logo uploaded in demo metaobject)
- `BlogPosting` on articles: valid but `publisher.url` may be empty string when `SEO_CONFIG.siteUrl` isn't set
- `WebSite` schema: `generateWebsiteSchema()` exists in `lib/seo.ts` but is **never called anywhere**

**H1 findings:**

| Route | H1 Count | H1 Content |
|-------|----------|------------|
| `/` | 1 | "Designed for everyday. Built to last." |
| `/products/[handle]` | 0 (rendered via JS component, not static H1) | Product title via `<ProductTitle>` |
| `/collections/robes` | 1 | "Robes" |
| `/faq` | 1 | "Frequently AskedQuestions" ⚠ concatenation artifact |
| `/contact` | 1 | "Get inTouch" ⚠ concatenation artifact |
| `/collections` | 1 | "Collections" |
| `/gallery` | 1 | "The Gallery" |
| `/sale` | 1 | "SALE" |
| `/account/wishlist` | 1 | "Wishlist" |
| `/blogs` | 1 | "The Journal" |

---

## 4. Storefront API SEO Field Verification

All four dynamic content types correctly request `seo { title description }`:

| Route Type | `seo {}` in Query | Fallback When Empty | Status |
|------------|------------------|---------------------|--------|
| Products | ✓ `PRODUCT_FRAGMENT` | `parseProductTitle()` + `stripHtml(description)` | ✓ Graceful |
| Collections | ✓ `COLLECTION_QUERY` | `${collection.title} Collection` | ✓ Graceful |
| Blog articles | ✓ `ARTICLE_QUERY` | `article.title` + `truncate(article.excerpt)` | ✓ Graceful |
| Blog listing | ✓ `BLOG_QUERY` | `${blog.title} \| Blog` | ✓ Graceful |

The API layer is sound. No mismatches between API-returned values and rendered meta.

---

## 5. Findings by Severity

### CRITICAL

**C1: Root PWA meta tags silently dropped on all pages**
- **Location:** `app/root.tsx` meta() export — 6 PWA meta tags declared
- **Current value:** None of the 6 PWA meta tags appear in any rendered page
- **Recommended value:** Move static PWA tags into `Layout` component's `<head>` JSX — outside the meta function system
- **Reason:** React Router 7 meta replacement silently discards root-level tags. PWA installability (`apple-mobile-web-app-capable`, `theme-color`) are critical for PWA scoring and mobile browser behavior.

**C2: `og:type`, `og:site_name`, `twitter:card` absent across all 17 routes**
- **Location:** `app/lib/seo.ts` `getSeoDefaults()` — these fields are never added to the shared defaults
- **Current value:** Zero pages have `og:type`, `og:site_name`, or `twitter:card`
- **Recommended value:** Add to `getSeoDefaults()`: `og:type: "website"` (override to `"product"` on product pages), `og:site_name: brandName`, `twitter:card: "summary_large_image"`, plus a fallback `og:image` from brand logo
- **Reason:** Without `og:type` and `twitter:card`, link unfurls on Twitter/X, Slack, and iMessage show no visual preview, destroying social sharing click-through rates.

**C3: `Product` and `ItemList` schema URLs are relative paths**
- **Location:** `app/lib/seo.ts` `generateProductSchema()` (offers.url), `generateCollectionSchema()` (itemListElement[n].url)
- **Current value:** `offers.url: "/products/elder-wand"`, `itemListElement[n].url: "/products/robe-handle"`
- **Recommended value:** Pass `siteUrl` to both generators and use `buildCanonicalUrl()` — e.g. `offers.url: buildCanonicalUrl(\`/products/${product.handle}\`, siteUrl)`
- **Reason:** Google's Product rich result specification requires absolute URLs. Relative paths fail Rich Results Test validation and block rich snippet eligibility.

**C4: Canonical falls back to relative path when `siteUrl` metaobject field is empty**
- **Location:** `app/lib/seo.ts` `buildCanonicalUrl()` — `SEO_CONFIG.siteUrl = ""`
- **Current value:** With unconfigured `siteUrl`, canonicals emit `/products/handle` (path-only)
- **Recommended value:** Derive canonical base from `new URL(request.url).origin` as primary source; use metaobject `siteUrl` as optional override. Pass `request` to `getSeoDefaults()`.
- **Reason:** Path-only canonical tags are not recognized by Google as valid, losing all canonical consolidation for new client deployments without metaobject configuration.

---

### MAJOR

**M1: Brand name absent from 12 static route titles**
- **Location:** `faq.tsx`, `contact.tsx`, `gallery.tsx`, `sale.tsx`, `collections._index.tsx`, `collections.all-products.tsx`, `blogs._index.tsx`, `blogs.$blogHandle._index.tsx`, `account.wishlist.tsx`, `policies.$handle.tsx`, `search.tsx`
- **Current value:** `"Frequently Asked Questions"`, `"Contact Us"`, `"The Gallery"`, `"Collections"`, `"All Products"`, `"Wishlist"` (no brand suffix)
- **Recommended value:** Append `| ${brandName}` to all static route titles via a shared `buildStaticPageMeta()` utility
- **Reason:** Brand name in title is a significant CTR driver in SERPs; Google often rewrites context-free titles with the domain URL.

**M2: Account sub-routes missing `robots: noindex`**
- **Location:** `account._index.tsx`, `account.orders._index.tsx`, `account.profile.tsx`, `account.subscriptions._index.tsx`, `account.orders.$id.tsx`, `account.returns._index.tsx`
- **Current value:** Only `{title: "..."}` — no robots directive. Relies on `robots.txt Disallow: /account` alone.
- **Recommended value:** Create `getAccountMeta(title)` helper returning `[{title}, {name: "robots", content: "noindex, nofollow"}]` — use in all account sub-routes
- **Reason:** Defense-in-depth: robots.txt rules can change or be misconfigured; meta noindex is an independent protection layer.

**M3: `WebSite` schema with `SearchAction` never rendered**
- **Location:** `app/lib/seo.ts` `generateWebsiteSchema()` exists but `app/routes/_index.tsx` never calls it
- **Current value:** Homepage only has `Organization` JSON-LD
- **Recommended value:** Add `generateWebsiteSchema(siteSettings)` alongside Organization schema in `_index.tsx` meta function
- **Reason:** `WebSite + SearchAction` schema enables a Google Sitelinks search box, significantly increasing SERP real estate and brand recognition.

**M4: `BlogPosting.publisher.url` may be empty string**
- **Location:** `app/lib/seo.ts` line ~333 — `publisher: { url: SEO_CONFIG.siteUrl }`
- **Current value:** `publisher.url: ""` when metaobject `siteUrl` not configured
- **Recommended value:** Pass `siteUrl` into `generateBlogPostingSchema()` and use it for `publisher.url` and `mainEntityOfPage["@id"]`
- **Reason:** Empty `publisher.url` fails structured data validation and reduces BlogPosting rich result eligibility.

**M5: `/account/wishlist` blocked by `robots.txt` despite full SEO investment**
- **Location:** `app/routes/[robots.txt].tsx` `Disallow: /account` covers wishlist; `account.wishlist.tsx` has canonical, og:tags, description
- **Current value:** Wishlist has complete SEO meta but is uncrawlable — architectural contradiction
- **Recommended value:** Add `Allow: /account/wishlist` above `Disallow: /account`, or add `robots: noindex` to `account.wishlist.tsx` and remove its SEO meta
- **Reason:** Either the wishlist is meant to be indexed (fix robots.txt) or not (remove SEO investment) — currently neither goal is achieved.

**M6: H1 word-concatenation artifacts on FAQ, contact, and policy pages**
- **Location:** `app/routes/faq.tsx`, `contact.tsx`, `policies.$handle.tsx` — multi-line H1 JSX text nodes with no space between
- **Current value:** "Frequently AskedQuestions", "Get inTouch", "PrivacyPolicy"
- **Recommended value:** Ensure space characters between JSX text nodes in H1 elements
- **Reason:** Search engines extract H1 text for topic understanding; concatenated keywords are unparseable.

**M7: `Organization` schema logo field null (data gap)**
- **Location:** `app/lib/seo.ts` `generateOrganizationSchema()` — code is correct; no logo uploaded in demo store `site_settings` metaobject
- **Current value:** `logo` field absent from rendered Organization JSON-LD
- **Recommended value:** Ensure `brandLogo` is configured in `site_settings` metaobject for each deployment
- **Reason:** Google uses `Organization.logo` for Knowledge Panel and SERP brand identification.

---

### MINOR

**m1: Product description 1 char over target (156 vs 155)**
- **Location:** `app/lib/seo.ts` `truncateDescription(maxLength = 155)` — truncation adds `"..."` after the limit
- **Recommended value:** Use `maxLength = 152` to keep total output within 155 chars
- **Reason:** Cosmetic — descriptions slightly over 160 chars get mid-sentence SERP truncation.

**m2: Invalid hreflang BCP 47 tag in sitemap (`EN-BD` → should be `en-BD`)**
- **Location:** `app/lib/store-locale.ts` `STORE_SITEMAP_LOCALE = "EN-BD"`; sitemap hreflang alternate URLs point to `/EN-BD/products/...` (non-functional routes)
- **Recommended value:** `en-BD` per BCP 47; or disable hreflang entirely if the store targets a single locale
- **Reason:** Invalid hreflang tags generate Search Console warnings; alternate URLs pointing to non-existent routes may cause crawl errors.

**m3: Homepage title `"Dropout Studio"` (14 chars) — no keyword context**
- **Location:** `app/routes/_index.tsx` — title derived from `brandName` only
- **Recommended value:** Compose the homepage title as `` `${brandName} | ${defaultPageTitle}` `` using the existing `site_settings.default_page_title` field. Each client sets their own keyword-rich suffix via this field. No title content should be hardcoded in the route.
- **Reason:** 14-char title wastes title tag space and provides no keyword signals for homepage-level ranking. `default_page_title` already exists in the `site_settings` metaobject schema for exactly this purpose — no new field is needed.

**m4: Sale page description embeds dynamic item count that goes stale in CDN cache**
- **Location:** `app/routes/sale.tsx` — description `"Discover 1 discounted items..."`
- **Recommended value:** Use stable percentage (`"...up to 84% off"`) instead of live item count
- **Reason:** Stale "1 discounted items" in SERPs undermines urgency signaling.

---

## 6. Crawler and Indexability Report

**robots.txt:** Functional. Correctly disallows `/admin`, `/cart`, `/orders`, `/checkouts`, `/carts`, `/account`, `/search`. Sitemap directive present. MJ12bot section has no `Disallow` rules (can crawl all pages). `EN-BD` path issue applies here for any locale-prefixed paths.

**sitemap.xml:** Generated via Hydrogen's `getSitemapIndex` — products (24 URLs), collections, pages, blogs sub-sitemaps. `lastmod` timestamps present. hreflang alternates use invalid `EN-BD` locale code pointing to non-existent paths. Sitemap URLs correctly derive from request origin (will work on Oxygen with correct domain).

**Noindex audit:**

| Route | Status |
|-------|--------|
| `/cart` | ✓ noindex |
| `/search` | ✓ noindex,follow |
| `/account/wishlist` | ✗ no noindex (intended indexable, but robots.txt blocks it) |
| Account sub-routes (`orders`, `profile`, etc.) | ✗ missing noindex (robots.txt blocks, no meta fallback) |
| All other indexable routes | ✓ correctly indexable |

**Canonical strategy:** Currently functional when metaobject `siteUrl` is configured. Fragile for new client onboarding when field is empty. No `request.url` derivation as fallback. No www/non-www inconsistency observed.

**Paths accidentally blocked:** `/account/wishlist` blocked by `Disallow: /account` despite having full SEO meta investment.

---

## 7. Structured Data Report

| Schema Type | Route | Required Fields | Missing/Incomplete | Rich Result Eligible | Issues |
|-------------|-------|-----------------|--------------------|----------------------|--------|
| Organization | `/` | Partial | `logo` (null in demo) | No | logo absent; `sameAs` bare domain URLs |
| WebSite | `/` | **MISSING** | All fields | N/A | `generateWebsiteSchema()` never called |
| Product | `/products/[handle]` | Partial | `offers.url` must be absolute | No | Relative `offers.url` fails Google validation |
| ItemList | `/collections/[handle]` | Partial | `itemListElement[n].url` must be absolute | Partial | All item URLs are relative paths |
| FAQPage | `/faq` | ✓ Complete | — | ✓ Yes | Valid, 5 Q&A pairs |
| BlogPosting | `/blogs/[handle]/[article]` | Mostly complete | `publisher.url` may be empty | Partial | Empty `publisher.url` when `siteUrl` unset |

---

## 8. Metrics Summary Tables

### Meta Completeness

| Tag Type | Present | Missing | Routes Missing |
|----------|---------|---------|----------------|
| `<title>` | 17/17 | 0 | — |
| `meta description` | 15/17 | 2 | `/cart`, account sub-routes (noindex — acceptable) |
| `link canonical` | 14/17 | 3 | `/cart`, `/account` non-wishlist routes |
| `og:title` | 14/17 | 3 | `/cart`, `/account` non-wishlist, resource routes |
| `og:description` | 14/17 | 3 | Same |
| `og:url` | 14/17 | 3 | Same |
| `og:image` | 3/17 | 14 | All non-product/collection pages |
| `og:type` | **0/17** | 17 | **ALL routes** |
| `og:site_name` | **0/17** | 17 | **ALL routes** |
| `twitter:card` | **0/17** | 17 | **ALL routes** |
| `twitter:image` | 3/17 | 14 | All non-product/collection pages |
| `theme-color` (PWA) | **0/17** | 17 | **ALL routes** (root meta dropped) |

### Title Length Audit

| Route | Title | Chars | Status |
|-------|-------|-------|--------|
| `/` | Dropout Studio | 14 | ⚠ Short, no keywords |
| `/products/elder-wand` | Elder Wand Replica \| HP Wands \| Dropout Studio | 46 | ✓ |
| `/collections/robes` | Robes Collection | 16 | ⚠ No brand |
| `/collections` | Collections | 11 | ⚠ Very short |
| `/faq` | Frequently Asked Questions | 26 | ⚠ No brand |
| `/contact` | Contact Us | 10 | ⚠ No brand |
| `/gallery` | The Gallery | 11 | ⚠ No brand |
| `/sale` | SALE - Up to 84% Off | 20 | ⚠ No brand |
| `/blogs` | The Journal | 11 | ⚠ No brand |
| `/account/wishlist` | Wishlist | 8 | ⚠ No brand |
| `/policies/privacy-policy` | Privacy Policy | 14 | ⚠ No brand |

### Description Length Audit

| Route | Char Count | Status |
|-------|------------|--------|
| `/` | 137 | ✓ Good |
| `/products/elder-wand` | 156 | ⚠ 1 char over target |
| `/collections/robes` | 155 | ✓ Perfect |
| `/faq` | 113 | ✓ Good |
| `/contact` | 113 | ✓ Good |
| `/gallery` | 63 | ⚠ Short but acceptable |
| `/sale` | 55 | ⚠ Short |
| `/collections` | 84 | ✓ Good |
| `/collections/all-products` | 58 | ⚠ Short |
| `/account/wishlist` | 94 | ✓ Good |
| `/blogs` | 83 | ✓ Good |

### Noindex Audit

| Route | robots meta | Status |
|-------|-------------|--------|
| `/cart` | noindex | ✓ |
| `/search` | noindex,follow | ✓ |
| Account dashboard + sub-routes | MISSING | ⚠ relies on robots.txt only |
| `/account/wishlist` | MISSING (public page) | ⚠ blocked by robots.txt |
| All indexable content routes | none (indexable) | ✓ |

---

## 9. Standardization Recommendations

**1. Move PWA tags to `Layout` `<head>` JSX**

The `Layout` function in `root.tsx` renders the `<head>` structure. Move static PWA meta tags there as JSX, not via the meta function system:

```tsx
// In Layout() in root.tsx
<head>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  {/* Static PWA meta — not subject to route meta replacement */}
  <meta name="theme-color" content={generatedTheme?.themeColor ?? "#000000"} />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content={data?.siteContent?.siteSettings?.brandName ?? "Store"} />
  <meta name="mobile-web-app-capable" content="yes" />
  <Meta />
  <Links />
</head>
```

**2. Add `og:type`, `og:site_name`, `twitter:card`, and fallback `og:image` to `getSeoDefaults()`**

A one-line change in `lib/seo.ts` that fixes 0/17 → 17/17 for three universal meta types simultaneously. Override `og:type` to `"product"` in the Product schema context.

**3. Pass `siteUrl` into schema generators**

`generateProductSchema()` and `generateCollectionSchema()` need `siteUrl` as a parameter to produce absolute URLs in `offers.url` and `itemListElement[n].url`. Two targeted changes in `lib/seo.ts`.

**4. Derive canonical base from `request.url`**

```ts
const siteUrl = siteSettings?.siteUrl?.trim()
  || (requestUrl ? new URL(requestUrl).origin : SEO_CONFIG.siteUrl);
```

Pass `request.url` through the loader → meta chain for all routes. This makes the canonical strategy robust for new client deployments where metaobject `siteUrl` may not yet be configured.

**5. Add `generateWebsiteSchema()` call to `_index.tsx`**

The function already exists in `lib/seo.ts`; it just needs to be called. Immediately enables Google Sitelinks search box eligibility:

```ts
const websiteSchema = generateWebsiteSchema(rootData?.siteContent?.siteSettings);
const organizationSchema = generateOrganizationSchema(/* ... */);
return getSeoMeta({ ..., jsonLd: [websiteSchema, organizationSchema] as any }) ?? [];
```

**6. Create `buildStaticPageMeta()` shared utility**

```ts
export function buildStaticPageMeta({ title, description, path, matches, ogImage? }) {
  const brandName = getBrandNameFromMatches(matches);
  const siteUrl = getSiteUrlFromMatches(matches);
  const defaultOgImage = getDefaultOgImage(/* from root siteSettings */);
  return getSeoMeta({
    title: `${title} | ${brandName}`,
    description,
    url: buildCanonicalUrl(path, siteUrl),
    media: ogImage ?? defaultOgImage,
  }) ?? [];
}
```

All 12 static routes currently missing brand suffix should use this utility.

**7. Fix BCP 47 hreflang**

Change `STORE_SITEMAP_LOCALE` from `"EN-BD"` to `"en-BD"` in `app/lib/store-locale.ts`. If the store targets a single locale, disable hreflang in the sitemap generator entirely.

**8. Create `getAccountMeta()` helper**

```ts
export function getAccountMeta(title: string) {
  return [
    { title },
    { name: "robots", content: "noindex, nofollow" }
  ];
}
```

Use in: `account._index.tsx`, `account.orders._index.tsx`, `account.profile.tsx`, `account.subscriptions._index.tsx`, `account.orders.$id.tsx`, `account.returns._index.tsx`.

**9. Resolve wishlist crawlability decision**

Pick one:
- If public/indexable: Add `Allow: /account/wishlist` above `Disallow: /account` in `[robots.txt].tsx`
- If private/noindex: Add `{name: "robots", content: "noindex"}` to `account.wishlist.tsx` and remove og:tags and canonical

**10. Fix H1 JSX text concatenation**

In `faq.tsx`, `contact.tsx`, `policies.$handle.tsx` — add space characters between split JSX text nodes:

```tsx
// WRONG
<h1>Frequently Asked
Questions</h1>

// CORRECT
<h1>Frequently Asked Questions</h1>
```

---

---

## 10. Key Files Referenced

| File | Relevance |
|------|-----------|
| `app/root.tsx` | Root `meta()` export with PWA tags; `Layout` component `<head>` structure |
| `app/lib/seo.ts` | All schema generators (`generateProductSchema`, `generateCollectionSchema`, `generateOrganizationSchema`, `generateWebsiteSchema`, `generateBlogPostingSchema`); `buildCanonicalUrl`; `getSeoDefaults`; `SEO_CONFIG` |
| `app/routes/_index.tsx` | Homepage meta, `Organization` JSON-LD — missing `WebSite` schema call |
| `app/routes/products.$handle.tsx` | `Product` schema, `seo {}` field consumption from Storefront API |
| `app/routes/collections.$handle.tsx` | `ItemList` schema, `seo {}` field consumption |
| `app/routes/blogs.$blogHandle.$articleHandle.tsx` | `BlogPosting` schema, `publisher.url` issue |
| `app/routes/[robots.txt].tsx` | robots.txt generator — `Disallow: /account` blocks wishlist; MJ12bot missing Disallow |
| `app/routes/[sitemap.xml].tsx` | Sitemap index entry point |
| `app/routes/sitemap.$type.$page[.xml].tsx` | Individual sitemap pages with invalid `EN-BD` hreflang |
| `app/lib/store-locale.ts` | `STORE_SITEMAP_LOCALE = "EN-BD"` — invalid BCP 47, should be `en-BD` |
| `app/routes/account.wishlist.tsx` | Full SEO meta investment on a page blocked by robots.txt |
| `app/routes/faq.tsx` | H1 word-concatenation artifact; missing brand suffix in title |
| `app/routes/contact.tsx` | H1 word-concatenation artifact; missing brand suffix in title |
| `app/routes/sale.tsx` | Dynamic item count in description goes stale in CDN cache |
| `app/lib/metaobject-parsers.ts` | Fallback constants for all SEO-relevant content fields; `FALLBACK_SOCIAL_LINKS` placeholder URLs |
| `wrangler.jsonc` | Portfolio Cloudflare Workers deployment config — no canonical override mechanism |

---

## 11. Cross-Storefront SEO Comparison (storefront_001 + demo-store)

### Feature Parity Table

| Feature | storefront_001 | storefront_002 | demo-store | Gap |
|---------|---------------|----------------|------------|-----|
| `getSeoMeta()` (Hydrogen-native) | ✓ | ✓ | ✗ (raw title arrays) | 001+002 ahead |
| `generateOrganizationSchema` on homepage | ✓ | ✓ | ✗ | 001+002 ahead |
| `generateWebsiteSchema` wired up | **✓** (root meta + loader) | **✗** (function exists, never called) | ✗ | **002 missing** |
| `generateProductSchema` on product pages | ✓ | ✓ | ✗ | 001+002 ahead |
| `generateCollectionSchema` on collection pages | ✓ | ✓ | ✗ | 001+002 ahead |
| `generateBlogPostingSchema` on article pages | ✓ | ✓ | ✗ | 001+002 ahead |
| `buildCanonicalUrl()` utility | ✓ | ✓ | ✗ (path-only hardcoded) | 001+002 ahead |
| `getSiteUrlFromMatches()` / `getBrandNameFromMatches()` | ✓ | ✓ | ✗ | Parity between 001+002 |
| `og:type` | ✗ | ✗ | ✗ | Missing across all three |
| `og:site_name` | ✗ | ✗ | ✗ | Missing across all three |
| `twitter:card` | ✗ | ✗ | ✗ | Missing across all three |
| `twitter:site` handle | ✗ (no `handle` passed to `getSeoMeta`) | ✗ | ✗ | Missing across all three |
| Full robots.txt with shopId rules | ✓ | ✓ | Basic only | 001+002 ahead |
| Sitemap with locale support | ✓ | ✓ | ✗ | 001+002 ahead |
| `noindex` on private routes | ✓ | ✓ | ✗ | 001+002 ahead |
| Root `meta()` export | ✓ | ✓ | ✗ | 001+002 ahead |
| `schema-dts` typed imports | ✓ | ✓ | ✗ | Parity 001+002 |

### Key Finding: `generateWebsiteSchema` is wired in storefront_001 but dead in storefront_002

In `storefront_001/app/root.tsx`, `generateWebsiteSchema()` is called in `loadCriticalData()` and emitted as `{"script:ld+json": data.websiteSchema}` in the root meta function. In storefront_002, the same function exists in `seo.ts` and is imported, but the root meta function never calls it and no `websiteSchema` key flows from the loader. The storefront_002 `seo.ts` and storefront_001 `seo.ts` are otherwise functionally identical — the only divergence is this single wiring gap in `root.tsx`.

### Key Finding: `og:type`, `og:site_name`, and `twitter:card` are absent across all three codebases

Hydrogen's `getSeoMeta()` utility does not output these fields — it handles `title`, `description`, `url`, `handle` (→ `twitter:site`), `media` (→ `og:image`), `jsonLd`, and `robots`. None of the three storefronts pass a `handle` to `getSeoMeta`, so `twitter:site` and `twitter:creator` are also never emitted. In storefront_002, the fix belongs in `seo.ts` `getSeoDefaults()` — see C2 and Standardization Recommendation #2.

---

## 12. Dual-Deployment Canonical and Meta Environment Analysis

### Environment Behavior Summary

| Behavior | Shopify Oxygen (client) | Cloudflare Workers (portfolio) |
|----------|------------------------|-------------------------------|
| Canonical domain source | Client's `website_url` metaobject field | Demo store's `website_url` metaobject = `https://dropoutstudio.co` |
| Canonical tag value | `https://clientbrand.com/[path]` | `https://dropoutstudio.co/[path]` |
| `og:url` value | `https://clientbrand.com/[path]` | `https://dropoutstudio.co/[path]` |
| Actual host of the deployment | Client's Oxygen domain | `*.workers.dev` or portfolio domain |
| Cross-domain canonical mismatch? | No — canonical matches host | **Yes** — canonical points to a different domain than the actual host |
| Override mechanism in `wrangler.jsonc`? | N/A | **None** — no `CANONICAL_BASE_URL` or `IS_PORTFOLIO_DEMO` env var |

### Q1: What domain do canonical tags point to on the portfolio deployment?
`https://dropoutstudio.co/[path]` — derived from the demo store's `site_settings` metaobject `website_url` field. The actual Cloudflare Workers URL is never used.

### Q2: Is `https://dropoutstudio.co` a real site? What does cross-domain canonical mean here?
`dropoutstudio.co` is the developer/agency's own studio brand domain. Portfolio pages at the Workers URL emit canonicals pointing to `dropoutstudio.co/products/...` — paths on a domain the portfolio deployment does not control. If those paths return 404 on `dropoutstudio.co`, Google will likely ignore the canonical hint and either index the Workers URL uncanonicalized or drop it. If `dropoutstudio.co` serves different content, Google may consolidate signals there instead of the Workers URL.

### Q3: What does `og:url` resolve to on the portfolio?
`https://dropoutstudio.co` (homepage) and `https://dropoutstudio.co/products/handle` (product pages). The Workers URL never appears in any meta tag.

### Q4: Cross-domain canonical from a search engine perspective
A crawler arriving at `https://storefront-002.[worker].workers.dev/products/foo` sees:
```html
<link rel="canonical" href="https://dropoutstudio.co/products/foo" />
```
This is cross-domain canonicalization. Google may consolidate to `dropoutstudio.co` or ignore the canonical entirely. The Workers portfolio URL cannot rank on its own while this mismatch exists.

### Q5: Does `wrangler.jsonc` have an environment-override mechanism?
**No.** `wrangler.jsonc` contains only `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`, and related Shopify credentials. There is no `IS_PORTFOLIO_DEMO`, `CANONICAL_BASE_URL`, or any variable that would cause `seo.ts` to derive the canonical origin from `request.url` instead of the metaobject.

### Q6: First SEO failure a new client hits without metaobject configuration
**All canonicals and `og:url` values become absent or path-only.** When `site_settings.website_url` is empty, `buildCanonicalUrl("/products/handle", "")` returns `/products/handle`. `getSeoMeta({ url: "" })` receives a falsy value and skips the canonical `<link>` and `og:url` entirely. Every page launches with no canonical — maximum duplicate content risk.

### Overall Assessment
The canonical strategy is **correct for Oxygen** once the client sets `website_url`, but **architecturally broken for the portfolio Cloudflare Workers deployment**. The code conflates "the URL the store owner wants to canonicalize to" (a client SEO preference, stored in a metaobject) with "the URL this deployment is actually served from" (an infrastructure fact, available via `request.url`). The fix is to use `new URL(request.url).origin` as the canonical base when `siteUrl` is either empty or points to a different domain than the current host.

---

## 13. Multi-Client Onboarding SEO Checklist

### Metaobject Fields Consumed for SEO

| Field Key | Metaobject | Used For | Required / Recommended | Fallback Value | Breaks Silently If Empty? |
|-----------|------------|----------|----------------------|----------------|--------------------------|
| `website_url` | `site_settings` | Canonical URLs, `og:url`, `WebSite`/`Organization` schema `url` | **Required** | `""` → no canonical emitted | **Yes** |
| `brand_name` | `site_settings` | `<title>`, `titleTemplate`, `og:title`, schema `name`, `apple-mobile-web-app-title` | **Required** | `""` → titles show "Store" | Yes |
| `brand_logo` | `site_settings` | `og:image`, `og:image:width/height`, `Organization.logo`, PWA icon fallback | **Required** | `null` → no `og:image` on any page | **Yes** |
| `default_page_title` | `site_settings` | Homepage `<title>` suffix / SEO title keyword context | Recommended | `""` → title shows brand name only | No |
| `default_page_description` | `site_settings` | Fallback `meta description` and `og:description` for pages without explicit descriptions | Recommended | `""` → no meta description emitted | No |
| `brand_mission` | `site_settings` | `meta description`, `og:description`, `Organization.description` | Recommended | `"Your store. Your story. Built to sell."` | No |
| `social_links_data` | `site_settings` | `Organization.sameAs` | Recommended | Placeholder URLs from `FALLBACK_SOCIAL_LINKS` | **Yes** — placeholder social URLs appear in schema |
| `faq_items_data` | `site_settings` | `FAQPage` JSON-LD on `/faq` | Optional | 5 generic e-commerce FAQ items | No |
| `favicon` | `site_settings` | `<link rel="icon">` | Recommended | Static `favicon.svg` | No |
| `icon_192` | `site_settings` | PWA manifest 192px icon | Recommended | `null` → PWA not installable | No |
| `icon_512` | `site_settings` | PWA manifest 512px icon | Recommended | `null` → PWA not installable | No |
| `color_primary` | `theme_settings` | `<meta name="theme-color">`, PWA `theme_color` | Recommended | `oklch(0.2 0 0)` (near-black) | No |
| `color_background` | `theme_settings` | PWA manifest `background_color` | Recommended | `oklch(1 0 0)` (white) | No |

### Minimum Viable SEO Configuration — New Client Launch Checklist

Before a new client deployment is SEO-safe, these three metaobject fields **must** be configured:

1. **`website_url`** in `site_settings` — set to the client's live production domain (e.g., `https://clientbrand.com`). This is the single most critical field. Without it, every canonical link and `og:url` across every page is absent, leaving the entire site with maximum duplicate content risk.

2. **`brand_name`** in `site_settings` — the client's public store name. Without it, all `<title>` tags fall back to "Store", making pages indistinguishable in SERPs.

3. **`brand_logo`** in `site_settings` — a Shopify-hosted image reference. Without it, `og:image` is absent on every static page and the homepage, producing blank social preview cards for all non-product/collection pages.

Additionally, before launch:
- Replace all demo store credentials in `.env` with client's Shopify store credentials
- Never deploy `wrangler.jsonc` demo credentials to Oxygen
- Verify `website_url` matches the Oxygen deployment domain exactly — no trailing slash, correct protocol (`https://`)
- Remove or update `FALLBACK_SOCIAL_LINKS` placeholder URLs in `app/lib/metaobject-parsers.ts` to prevent dummy social URLs appearing in `Organization.sameAs` schema

---

*Audit conducted: 2026-04-06*
*Method: Static code analysis + SSR HTML extraction via dev server (port 3000)*
*Playwright MCP unavailable during audit session — head data extracted via curl + Python analysis*
*Target: storefront_002 on branch `main`*
*Supplemental analysis: cross-storefront comparison (storefront_001, demo-store), dual-deployment canonical behavior, multi-client onboarding checklist*
