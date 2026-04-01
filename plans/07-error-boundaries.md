# Plan 4: Error Boundaries & Render Purity

## Summary

The root ErrorBoundary renders a full `<html>` document, but React Router wraps it inside the Layout which already renders `<html>`, causing `validateDOMNesting` errors and hydration mismatches on every error/404 page. `trackErrorBoundary` is called as a side effect during render via `setTimeout`, violating React's render purity rules. 44 of 49 routes lack ErrorBoundary exports, relying entirely on the root ErrorBoundary which shows a full-page error without route-specific context.

## Items Covered

- **#8** `root.tsx:540` — ErrorBoundary renders full `<html>` inside Layout's `<html>`
- **#9** `root.tsx:555-557` — `trackErrorBoundary` called via `setTimeout` during render
- **#10** `account.tsx:282-284` — Same render-time side effect pattern
- **#65** 44 of 49 routes have no ErrorBoundary

## Current State

- `app/root.tsx:540-582`: ErrorBoundary returns `<html><head>...</head><body>...</body></html>` with tailwindCss link, Meta, Links, CachedThemeInjector, OfflineAwareErrorPage, Scripts
- `app/root.tsx:555-557`: `if (typeof window !== "undefined") { setTimeout(() => trackErrorBoundary(errorStatus, errorType, "root"), 0); }` — runs during render phase
- `app/routes/account.tsx:282-284`: Same pattern: `setTimeout(() => trackErrorBoundary(...), 0)` in render
- Demo-store (`~/Desktop/projects/demo-store/app/root.tsx:145-166`): Has a separate `export function Layout({children})` that provides `<html>` shell. ErrorBoundary (line 188-209) renders just content, no document wrapper
- Only ~5 routes export ErrorBoundary: root, account, search, products.$handle, collections.$handle

## Target State

- Root has a `Layout` export providing the `<html>` document shell (React Router 7 pattern)
- ErrorBoundary renders content only, no `<html>` wrapper — relies on Layout
- Analytics tracking uses `useEffect`, not render-time side effects
- All user-facing routes export a basic ErrorBoundary

## Implementation Approach

### Step 1: Create Reusable RouteErrorBoundary Component

**New file**: `app/components/RouteErrorBoundary.tsx`

```tsx
import {isRouteErrorResponse, useRouteError, Link} from "react-router";

export function RouteErrorBoundary() {
    const error = useRouteError();
    let errorMessage = "An unexpected error occurred";
    let errorStatus = 500;

    if (isRouteErrorResponse(error)) {
        errorMessage = error?.data?.message ?? error.data;
        errorStatus = error.status;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    const title = errorStatus === 404
        ? "Page Not Found"
        : errorStatus >= 500
            ? "Something Went Wrong"
            : "An Error Occurred";

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <h1 className="text-4xl font-bold text-primary-foreground">{errorStatus}</h1>
            <h2 className="mt-2 text-xl text-primary-foreground/80">{title}</h2>
            {errorMessage && (
                <p className="mt-4 max-w-md text-sm text-primary-foreground/60">{errorMessage}</p>
            )}
            <Link
                to="/"
                className="mt-8 rounded-md bg-primary-foreground/10 px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/20"
            >
                Return Home
            </Link>
        </div>
    );
}
```

### Step 2: Extract Layout Export from Root (#8)

**File**: `app/root.tsx`

Extract the `<html>` shell from the current ErrorBoundary and the App component into a dedicated `Layout` export. React Router 7 uses this as the document wrapper for both the App and ErrorBoundary.

Current structure:
- App component contains the full page with providers
- ErrorBoundary independently renders `<html><head>...</head><body>...</body></html>`

Target structure:
```tsx
export function Layout({children}: {children?: React.ReactNode}) {
    const nonce = useNonce();
    const data = useRouteLoaderData<RootLoader>("root");
    const generatedTheme = data?.generatedTheme;

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {generatedTheme?.googleFontsUrl && (
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    // ... font links
                )}
                <link rel="stylesheet" href={tailwindCss} />
                {generatedTheme && <ThemeStyleTag cssVariables={generatedTheme.cssVariables} />}
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration nonce={nonce} />
                <Scripts nonce={nonce} />
            </body>
        </html>
    );
}
```

The ErrorBoundary then simplifies to:
```tsx
export function ErrorBoundary() {
    const error = useRouteError();
    let errorMessage: string | undefined;
    let errorStatus = 500;

    if (isRouteErrorResponse(error)) {
        errorMessage = error?.data?.message ?? error.data;
        errorStatus = error.status;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    const title = errorStatus === 404 ? "Page Not Found"
        : errorStatus >= 500 ? "Something Went Wrong"
        : "An Error Occurred";

    return (
        <>
            <CachedThemeInjector />
            <ErrorTracker statusCode={errorStatus} errorType={isRouteErrorResponse(error) ? "route_error" : "js_error"} route="root" />
            <OfflineAwareErrorPage statusCode={errorStatus} title={title} message={errorMessage} />
        </>
    );
}
```

**Key consideration**: The Layout may not have access to theme data when an error occurs (if `loadCriticalData` failed). The `CachedThemeInjector` provides a fallback by reading from localStorage. The Layout should gracefully handle `data` being `undefined` (error case).

### Step 3: Fix Render Side Effects (#9, #10)

**New component** (can be in the same file or a shared utility):
```tsx
function ErrorTracker({
    statusCode,
    errorType,
    route
}: {
    statusCode: number;
    errorType: "route_error" | "js_error";
    route: string;
}) {
    useEffect(() => {
        trackErrorBoundary(statusCode, errorType, route);
    }, [statusCode, errorType, route]);
    return null;
}
```

**File**: `app/root.tsx` — Replace the inline `setTimeout` block (lines 553-558) with `<ErrorTracker />` in the ErrorBoundary JSX.

**File**: `app/routes/account.tsx` — Same change: replace `setTimeout(() => trackErrorBoundary(...), 0)` with `<ErrorTracker />` in the account ErrorBoundary.

### Step 4: Add ErrorBoundary to Routes (#65)

Add `export { RouteErrorBoundary as ErrorBoundary } from "~/components/RouteErrorBoundary";` to all user-facing routes that currently lack an ErrorBoundary.

Routes needing coverage (user-facing, non-API):
- `blogs._index.tsx`
- `blogs.$blogHandle._index.tsx`
- `blogs.$blogHandle.$articleHandle.tsx`
- `gallery.tsx`
- `policies.$handle.tsx`
- `faq.tsx`
- `contact.tsx` (if exists)
- `wishlist.tsx`
- `wishlist.share.tsx`
- `account.wishlist.tsx`
- `discount.$code.tsx`
- `cart.$lines.tsx`
- `manifest[.]webmanifest.tsx`
- `[sitemap.xml].tsx`
- `[robots.txt].tsx`
- `favicon[.]ico.tsx`
- `collections._index.tsx`
- `collections.all-products.tsx`
- `sale.tsx`
- Any other route files without an ErrorBoundary export

API routes (`api.*`) do not need ErrorBoundary exports — they return JSON responses directly and handle errors in their own try/catch blocks.

## Constraints

- The Layout export must handle both normal case (full data available) AND error case (data is undefined)
- `useRouteLoaderData("root")` returns undefined when the root loader itself failed — Layout must gracefully degrade
- CachedThemeInjector must remain as a progressive enhancement fallback for error states
- The `useEffect` approach in ErrorTracker will not fire during SSR — this is correct, analytics should only track client-side errors
- Some routes (like products.$handle, collections.$handle) already have custom ErrorBoundary — do not overwrite those

## Execution Order

1. Create `RouteErrorBoundary.tsx` component (no dependencies)
2. Extract `Layout` export from root.tsx (most complex — restructures the document shell)
3. Fix `trackErrorBoundary` side effects in root.tsx and account.tsx
4. Add ErrorBoundary exports to all uncovered routes (bulk, mechanical)

## Parallelism Notes

This plan touches `root.tsx` extensively. Execute **after** Plan 1 (caching) merges to avoid conflicts. Plans 2, 3, 5, 8, 9 touch different files and can run in parallel with this plan. Plan 6 also touches root.tsx — coordinate or sequence with this plan.
