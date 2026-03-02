# storefront_002

## Always Do First

**Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## ⚠️ Git Worktree Workflow (MANDATORY)

**NEVER CREATE BRANCHES**. Use git worktrees for parallel work:

```bash
git worktree add ../storefront_002-<feature-name>   # Create worktree
git worktree list                              # List worktrees
git worktree remove <path>                     # Remove worktree
git worktree prune                             # Clean stale refs
```

Direct commits to main only. Enables parallel AI development, eliminates branch overhead.

**Always break large tasks into focused scopes** — run parallel agents with git worktrees, each with a narrow, well-defined goal.

---

## Project Overview

High-performance Shopify Hydrogen storefront (React Router 7, Shopify Oxygen/Cloudflare Workers) with PWA, metaobject CMS, wishlist, blog, offline support. **Critical**: Import from `react-router`, NOT `@remix-run/react`.

## Tech Stack

| Category      | Tech             | Version    | Notes                               |
| ------------- | ---------------- | ---------- | ----------------------------------- |
| **Framework** | React            | 18.3.1     | React Compiler enabled              |
|               | React Router     | 7.12       | Hydrogen preset, file-based routing |
|               | Shopify Hydrogen | 2026.1.0   | Storefront + Customer Account APIs  |
|               | Storefront API   | 2026-01    | GraphQL API version                 |
|               | TypeScript       | 5.9        | Strict mode, ES2022 target          |
|               | Vite             | 6          | Build tooling                       |
| **UI**        | Tailwind CSS     | v4         | CSS-first config via `@import`      |
|               | shadcn/ui        | -          | 27 Radix UI components              |
|               | Lucide React     | -          | Icons                               |
|               | OKLCH colors     | -          | WCAG 2.1 AA compliant               |
| **Features**  | Lenis            | 1.3.16     | GPU-accelerated smooth scroll       |
|               | Workbox          | 7.0.0      | Service worker, offline support     |
|               | Embla Carousel   | -          | Autoplay, auto-scroll               |
|               | next-themes      | -          | Dark mode                           |
|               | colorjs.io       | -          | Color manipulation                  |
| **Dev**       | ESLint           | 9          | TypeScript, React, a11y             |
|               | Prettier         | 3          | Shopify config                      |
|               | Node.js          | >= 20.19.0 | **Strict requirement**              |

**GraphQL**: Dual-project (Storefront API + Customer Account API)
**Path Alias**: `~/` → `app/`

## Core Architecture

```
storefront_002/
├── app/
│   ├── routes/              # 45+ routes
│   ├── components/          # 114+ components
│   │   ├── ui/              # 27 shadcn
│   │   ├── blog/            # 7 blog
│   │   └── pwa/             # 6 PWA
│   ├── lib/                 # 45 utilities
│   │   ├── metaobject-*.ts  # CMS
│   │   ├── pwa-*.ts         # PWA
│   │   ├── color/           # WCAG
│   │   └── fragments/       # GraphQL
│   ├── hooks/               # 9 hooks
│   ├── graphql/customer-account/  # 14 queries
│   └── styles/tailwind.css  # v4 + animations
├── public/sw.js             # Workbox
├── vite.config.ts           # React Compiler
└── react-router.config.ts   # Hydrogen preset
```

## Common Commands

```bash
npm run dev          # Dev server + GraphQL codegen
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # ESLint
npm run typecheck    # TypeScript + route types
npm run codegen      # Regenerate GraphQL types
```

## Code Style

**ESLint**: `eslint:recommended` + TypeScript + React + JSX a11y

- camelCase/PascalCase naming, `no-console: warn`, `object-shorthand: error`
- React hooks v7 rules disabled (TODO: refactor)

**Prettier**: 4 spaces, 120 chars, double quotes, no trailing commas, `avoid` arrow parens

**TypeScript**: Strict mode, ES2022, Bundler resolution, `~/` alias

**React**: No manual memoization (React Compiler), import from `react-router`, JSDoc comments

**Files**: Co-locate related files, PascalCase components, camelCase utilities

## MCP Servers

**shopify-dev**: Hydrogen, Storefront/Customer Account APIs, `validate_graphql_codeblocks` (MANDATORY for GraphQL)
**context7**: Tailwind, shadcn, Radix UI, React, TypeScript

Always use MCP tools over web search for official docs. Validate GraphQL after ANY query change.

## Testing

**Current**: None
**Recommended**: Vitest, React Testing Library, Playwright, MSW

## Cart Actions Reference (`app/routes/cart.tsx`)

| Action                                 | Method                          | Notes                                  |
| -------------------------------------- | ------------------------------- | -------------------------------------- |
| `CartForm.ACTIONS.LinesAdd`            | `cart.addLines()`               | Add line items                         |
| `CartForm.ACTIONS.LinesUpdate`         | `cart.updateLines()`            | Update quantities / attributes         |
| `CartForm.ACTIONS.LinesRemove`         | `cart.removeLines()`            | Remove line items                      |
| `CartForm.ACTIONS.DiscountCodesUpdate` | `cart.updateDiscountCodes()`    | Replace all discount codes             |
| `CartForm.ACTIONS.GiftCardCodesUpdate` | `cart.updateGiftCardCodes()`    | Replace all gift card codes            |
| `CartForm.ACTIONS.GiftCardCodesAdd`    | `cart.addGiftCardCodes()`       | Append gift card codes (2026.1.0+)     |
| `CartForm.ACTIONS.GiftCardCodesRemove` | `cart.removeGiftCardCodes()`    | Remove applied gift card codes         |
| `CartForm.ACTIONS.NoteUpdate`          | `cart.updateNote()`             | Update cart note                       |
| `CartForm.ACTIONS.BuyerIdentityUpdate` | `cart.updateBuyerIdentity()`    | Update buyer country / customer        |
| `"CustomPromoCodeApply"`               | discount → gift card fallback   | Unified promo handler (custom action)  |

## Repository

**Commits**: Conventional (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `perf:`)
**Before Push**: `npm run typecheck`, `npm run lint`, `npm run codegen` (after GraphQL changes)
**Code Review**: Read comments, update on change, test WCAG compliance

## Environment

**Node.js**: >= 20.19.0 (strict)
**Env Vars** (`.env`):

```bash
SESSION_SECRET=<32chars>                        # Required
PUBLIC_STORE_DOMAIN=<store>.myshopify.com      # Required
PUBLIC_STOREFRONT_API_TOKEN=<token>            # Required
PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX            # Optional
```

**Setup**: `npm install && npm run codegen && npm run dev`
**Dev URL**: http://localhost:3000, hot reload enabled

## Key Files

**Architecture**: `lib/pwa-queries.ts`, `lib/pwa-parsers.ts`, `lib/color/`, `lib/metaobject-*.ts`, `public/sw.js`
**Config**: `vite.config.ts` (React Compiler), `react-router.config.ts`, `eslint.config.js`, `styles/tailwind.css`
**GraphQL**: `storefrontapi.generated.d.ts`, `customer-accountapi.generated.d.ts`
**Solutions**: `lib/color/contrast.ts` (WCAG), `lib/wishlist-context.tsx` (SSR), `lib/smoothScroll.ts` (Lenis)
**Data Source Resolver**: `lib/data-source.ts` — centralized Shopify/mock adapter selection based on env credentials
**Mock Data**: `lib/mock-data.ts` — 24 products, 6 collections consumed through DataAdapter mock handlers

## Critical Warnings

**1. React Router Imports**

- **Problem**: `@remix-run/react` causes runtime errors
- **Solution**: Always import from `react-router`

**2. React Compiler Target**

- **Problem**: Must target "18" for React 18.x
- **Location**: `vite.config.ts` - `{target: "18"}`

**3. WCAG Contrast**

- **Problem**: 4.5:1 (text) or 3:1 (UI) required
- **Solution**: `ensureContrastCompliance()`, test https://contrast-ratio.com

**4. SSR Hydration**

- **Problem**: LocalStorage during SSR breaks hydration
- **Solution**: `useState` + `useEffect` pattern (see `lib/wishlist-context.tsx`)

**5. GraphQL Codegen**

- **Problem**: Stale types after query changes
- **Solution**: `npm run codegen` after ANY GraphQL modification

**6. Service Worker Cache**

- **Problem**: Old content after deployments
- **Dev**: Disable cache or use Incognito
- **Production**: Auto-updates, version in `sw.js`

**7. Metaobject Fallbacks**

- **Problem**: Missing data breaks pages
- **Solution**: All parsers in `lib/metaobject-parsers.ts` have fallbacks

**8. Node Version**

- **Problem**: Node < 20.19.0 fails builds
- **Solution**: Use nvm/nodenv, verify `node --version`

**9. Path Alias**

- **Problem**: `~/` imports fail in tests
- **Solution**: `vite-tsconfig-paths` plugin loaded

**10. ESLint Hooks**

- **Problem**: React hooks v7 rules disabled
- **Status**: TODO - refactor to comply
- **Disabled**: `set-state-in-effect`, `refs`, `purity`

## Code Comments (MANDATORY)

Read all comments before editing. Update when changing code. Add for complex logic. Comments document intent, constraints, dependencies, edge cases, architecture.

## WCAG Accessibility (MANDATORY)

### Contrast Ratios

| Content                      | Minimum | WCAG        |
| ---------------------------- | ------- | ----------- |
| Normal text                  | 4.5:1   | 1.4.3 (AA)  |
| Large text (≥18pt/14pt bold) | 3:1     | 1.4.3 (AA)  |
| UI components                | 3:1     | 1.4.11 (AA) |
| Touch targets                | 44x44px | 2.5.5 (A)   |

**Color System**: OKLCH in `styles/tailwind.css`, contrast ratios documented inline, utility: `lib/color/contrast.ts`

**Checklist**:

1. Convert OKLCH→RGB (https://oklch.com)
2. Calculate ratio (https://contrast-ratio.com)
3. Verify 4.5:1 (text) or 3:1 (UI)
4. Document inline: `/* fg on bg = X.XX:1 (WCAG AA) ✓ */`
5. Test with a11y tools

**Merchant Colors**: Use `ensureContrastCompliance(merchantColor, background, fallback, 4.5)` - Shopify brand API may not be WCAG compliant.

**Tools**: contrast-ratio.com, oklch.com, axe DevTools, Chrome Accessibility Panel

## Performance

**React Compiler**: Auto-memoization in `vite.config.ts` via Babel plugin `{target: "18"}`. Eliminates manual `useMemo`/`useCallback`.

**Lenis**: GPU-accelerated smooth scrolling, `LenisProvider` in `root.tsx`, hooks: `useScrolled.ts`, `useScrollProgress.ts`

**Service Worker**: Workbox 7.0.0, 5 caching strategies:

1. Shopify CDN (images/fonts): CacheFirst, 30 days
2. Google Fonts: StaleWhileRevalidate, 365 days
3. API: NetworkFirst, 5 min
4. Product images: CacheFirst, 7 days
5. Pages: NetworkFirst + `/offline` fallback

**PWA Components**: ServiceWorkerRegistration, ServiceWorkerUpdateBanner, PwaAppIcon, IosInstallInstructions, OpenInAppButton, NetworkStatusIndicator

**PWA Hooks**: usePwaInstall, useServiceWorkerUpdate, useNetworkStatus, usePwaAnalytics

## UI Guidelines (MANDATORY)

1. Use Tailwind CSS classes for all styling
2. Use shadcn components from `/app/components/ui`
3. Use context7 MCP server for Tailwind/shadcn docs

## Key Features

**Metaobject CMS**:

- `site_settings` (singleton): Brand, hero, testimonials, FAQs, Instagram, shipping
- `theme_settings` (singleton): Fonts (Google), colors (OKLCH/HEX)
- 80/20 architecture: High-value content only
- Files: `lib/metaobject-queries.ts`, `lib/metaobject-parsers.ts`, `lib/fallback-data.ts`, `lib/site-content-context.tsx`

**PWA Manifest**: Generated from metaobjects via `lib/pwa-queries.ts`, `lib/pwa-parsers.ts`, `routes/manifest[.]webmanifest.tsx`

| Field            | Source                           | Notes                      |
| ---------------- | -------------------------------- | -------------------------- |
| name             | site_settings.brand_name         | Fallback: shop.name        |
| description      | site_settings.brand_mission      | Fallback: shop.description |
| theme_color      | theme_settings.color_primary     | OKLCH→HEX                  |
| background_color | theme_settings.color_background  | OKLCH→HEX                  |
| icons            | site_settings.icon_192, icon_512 | Required                   |

**Wishlist**: `lib/wishlist-context.tsx` - React Context + LocalStorage, SSR-safe, cross-tab sync, optimistic updates, 6 animations. Routes: `/wishlist`, `/wishlist/share`, `/account/wishlist`, API: `/api/wishlist-products`

**Color System**: `lib/color/` - OKLCH parsing, sRGB conversion, dual contrast (WCAG 2.1 + APCA), swatch borders, 500+ color names, `ensureContrastCompliance()`

**Hooks** (9): useInView, useScrolled, useScrollProgress, useNetworkStatus, useServiceWorkerUpdate, usePwaInstall, useRecentSearches, useSearchKeyboard, usePwaAnalytics

**Animations**: 30+ `@keyframes` in `tailwind.css` - product (fade-in, image-hover), wishlist (heart-beat, heart-glow, burst-ring), hero (shimmer), GPU-accelerated, respects `prefers-reduced-motion`

**Search**: Regular (full data), predictive (autocomplete), popular terms, recent (LocalStorage), keyboard (Cmd/Ctrl+K), full-screen overlay

**Blog**: 7 components in `components/blog/` - ArticleCard, ArticleHero, AuthorBio, ReadingTime, RelatedArticles, ShareButtons, TagBadge. SEO-optimized (JSON-LD), tag filtering. Routes: `/blogs`, `/blogs/:blogHandle`, `/blogs/:blogHandle/:articleHandle`

**Gallery**: Responsive grid + lightbox, route: `/gallery`, components: GalleryGrid, GalleryImageCard, metaobject-driven

---

## Frontend UI Visual Verification (REQUIRED)

**During any frontend UI or design work, you MUST use Playwright MCP to visually verify your changes.**

### Workflow

1. **Determine the active port** for this project before taking screenshots (see Port Detection below)
2. **Take screenshots** via Playwright MCP targeting the correct `http://localhost:<port>`
3. **Save to `tmp_screenshots/`** at the root of this repository
4. **Analyze each screenshot** against the plan or requirements to verify accuracy
5. **Iterate** — fix discrepancies, re-screenshot, re-analyze until requirements are met

### Rules

- **ALWAYS** take at least one screenshot per UI change before considering it done
- **NEVER** mark frontend work as complete without visual verification
- Screenshots go in `tmp_screenshots/` at the project root (create the directory if it doesn't exist)
- Name screenshots descriptively: `tmp_screenshots/homepage-hero.png`, `tmp_screenshots/cart-drawer-open.png`
- Take screenshots at multiple viewport sizes when responsive behavior matters (mobile + desktop)
- After each batch of changes, compare the screenshots against the original requirements or design spec and explicitly state what matches and what still needs work

### Port Detection

Multiple dev servers may be running simultaneously across projects. **Always identify the correct port before screenshotting.**

Detection order (use the first that works):

1. **Check dev server output** — the terminal running `bun run dev` prints the active URL (e.g. `Local: http://localhost:4457`)
2. **Check `vite.config.ts`** — look for an explicit `server.port` value
3. **Check `package.json`** — some scripts hardcode a port via `--port` flag
4. **Scan active ports** — run `lsof -i :3000-4999 | grep LISTEN` to see what's bound, then match the process to this project's directory

**Never assume port 3000.** If multiple Vite/Hydrogen servers are running, confirm you're screenshotting the right one by checking the page title or a unique element.

### Example Playwright MCP Usage

```
// First confirm the port (e.g. from dev server output: http://localhost:4457)
navigate to http://localhost:4457
take screenshot → tmp_screenshots/homepage-initial.png

// After making changes, verify
take screenshot → tmp_screenshots/homepage-after-fix.png
// Analyze: does this match the requirement?
```

### What to Check in Screenshots

- Layout matches the intended design/spec
- Spacing, typography, and colors are correct
- Interactive states (hover, focus, open/closed) render properly
- No visible layout breaks or overflow issues
- Responsive breakpoints behave as expected
