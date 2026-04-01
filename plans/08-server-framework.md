# Plan 6: Server, Framework & Dependencies

## Summary

React Router 7.12.0 is installed but Hydrogen 2026.1.0 expects 7.9.x, causing a dev server warning and potential routing issues. The server error handler returns a response with no Content-Type. Session cookie commit uses `.set()` which can overwrite cookies already set by account routes. The data adapter is attached via `Object.assign()` instead of Hydrogen's canonical `additionalContext` parameter. An intermittent HMR crash occurs from stale module chunks. The demo-store includes a `reset.css` that this project doesn't have.

## Items Covered

- **#1** React Router 7.12.0 installed but Hydrogen expects 7.9.x
- **#48** `server.ts:113` — Generic 500 error response has no `Content-Type` header
- **#49** `server.ts:88-89` — Session commit may overwrite `Set-Cookie` headers from account routes
- **#50** `context.ts:159-161` — `dataAdapter` attached via `Object.assign()` instead of `additionalContext`
- **#66** Intermittent HMR crash: `TypeError: Cannot read properties of null (reading 'useContext')`
- **#67** Missing `reset.css` that demo-store includes

## Current State

- `package.json`: `"react-router": "7.12.0"`, `"react-router-dom": "7.12.0"`, `"@react-router/dev": "7.12.0"`, `"@react-router/fs-routes": "7.12.0"`
- `server.ts:113`: `return new Response("An unexpected error occurred", {status: 500});` — no headers specified
- `server.ts:88-89`: `response.headers.set("Set-Cookie", await hydrogenContext.session.commit());` — `.set()` replaces existing Set-Cookie headers
- `app/lib/context.ts:159-161`: `const dataAdapter = createDataAdapter(hydrogenContext.storefront, env); return Object.assign(hydrogenContext, {dataAdapter});`
- HMR crash occurs intermittently across multiple routes during Vite hot module replacement
- Demo-store (`~/Desktop/projects/demo-store/app/root.tsx:154`): `<link rel="stylesheet" href={resetStyles}>` importing a `reset.css` file
- storefront_002: Only imports `tailwind.css` which includes Tailwind's preflight (built-in normalization)

## Target State

- React Router version aligned with Hydrogen's requirements
- Server error responses include proper Content-Type
- Session cookies appended (not replaced) to preserve account route cookies
- Data adapter attached via canonical Hydrogen pattern if available
- HMR crash resolved
- reset.css evaluated and included if it provides value beyond Tailwind's preflight

## Implementation Approach

### #1 — React Router Version

**Investigation first**: Check if any code uses React Router 7.12-specific APIs that don't exist in 7.9.x. Key 7.10-7.12 additions include new hooks and middleware features. Search for any usage:

```bash
grep -rn "useMiddleware\|unstable_\|patchRoutesOnNavigation" app/
```

If no 7.12-specific APIs are used, downgrade:

**File**: `package.json` — change:
```json
"react-router": "^7.9.0",
"react-router-dom": "^7.9.0",
"@react-router/dev": "^7.9.0",
"@react-router/fs-routes": "^7.9.0",
```

Then run `bun install`.

If 7.12-specific features ARE used, check if Hydrogen 2026.1.0 actually works with 7.12.0 despite the warning. The warning may be overly conservative. In that case, document the version mismatch and monitor for issues.

### #48 — Server Content-Type

**File**: `server.ts` line 113

Change:
```typescript
return new Response("An unexpected error occurred", {status: 500});
```
To:
```typescript
return new Response("An unexpected error occurred", {
    status: 500,
    headers: {"Content-Type": "text/plain; charset=utf-8"}
});
```

### #49 — Session Cookie Overwrite

**File**: `server.ts` lines 88-89

Change:
```typescript
response.headers.set("Set-Cookie", await hydrogenContext.session.commit());
```
To:
```typescript
response.headers.append("Set-Cookie", await hydrogenContext.session.commit());
```

`append` adds a new `Set-Cookie` header without replacing existing ones. This preserves cookies set by Customer Account API routes (login, token refresh, etc.) that may have already added their own `Set-Cookie` headers during request handling.

### #50 — Data Adapter Context

**File**: `app/lib/context.ts` lines 159-161

**Investigation**: Check if `createHydrogenContext()` in Hydrogen 2026.1.0 supports an `additionalContext` parameter. Use the shopify-dev MCP to check the API.

If supported:
```typescript
const dataAdapter = createDataAdapter(hydrogenContext.storefront, env);
const hydrogenContext = createHydrogenContext({
    // ... existing options
    additionalContext: { dataAdapter }
});
return hydrogenContext;
```

If NOT supported in this version:
```typescript
// WORKAROUND: Hydrogen 2026.1.0 does not expose additionalContext in createHydrogenContext().
// Attach dataAdapter directly to the context object. Upgrade to newer Hydrogen version when
// additionalContext is supported.
const dataAdapter = createDataAdapter(hydrogenContext.storefront, env);
return Object.assign(hydrogenContext, {dataAdapter});
```

The `HydrogenAdditionalContext` interface declaration at lines 80-82 already types this correctly.

### #66 — HMR Crash

`TypeError: Cannot read properties of null (reading 'useContext')` during Vite HMR is typically caused by stale module chunks referencing a React context from a previous render tree version.

**Step 1**: Apply React Router downgrade (#1) first. Version mismatches between React Router and Hydrogen are a known cause of this issue.

**Step 2**: If the crash persists, add to `vite.config.ts`:
```typescript
optimizeDeps: {
    exclude: ["@shopify/hydrogen"]
}
```

**Step 3**: If still persisting, check if `server.hmr` settings in `vite.config.ts` need adjustment. Some configurations cause partial module invalidation that leaves React context in an inconsistent state.

This is a **dev-only** issue — it does not affect production builds.

### #67 — Missing reset.css

**Investigation**: Check what demo-store's `reset.css` contains and whether Tailwind's preflight covers the same ground.

Demo-store's reset.css location: `~/Desktop/projects/demo-store/app/styles/reset.css`

Tailwind CSS v4's preflight (included via `@import "tailwindcss"`) provides comprehensive cross-browser normalization based on modern-normalize. If demo-store's `reset.css` provides additional rules beyond preflight (e.g., specific Shopify Hydrogen resets), those should be added.

If the reset.css is equivalent to or a subset of Tailwind's preflight: document as "by design — Tailwind preflight provides equivalent normalization" and close the item.

If it provides additional useful resets: copy the non-overlapping rules into `app/styles/tailwind.css` under a `@layer base { ... }` block.

## Constraints

- React Router downgrade may require updating code if any 7.10-7.12 APIs are used
- Session cookie `.append()` fix must not break Customer Account API login/logout flow — test the full auth cycle
- HMR fix is dev-only — do not introduce production-affecting changes to resolve it
- The `Object.assign()` pattern for data adapter is a known workaround — changing it requires Hydrogen API compatibility

## Execution Order

1. **#1** — React Router version (may resolve #66 as side effect)
2. **#66** — HMR crash (verify if #1 resolved it, apply additional fixes if needed)
3. **#48** — Server Content-Type (trivial one-line fix)
4. **#49** — Session cookie overwrite (one-line change, test auth flow)
5. **#50** — Data adapter context (investigate API, apply if supported)
6. **#67** — reset.css (investigate, apply if needed)

## Parallelism Notes

This plan touches `package.json`, `server.ts`, `app/lib/context.ts`, and potentially `vite.config.ts` and `app/root.tsx` (for reset.css import). The `root.tsx` touch is minimal and only if reset.css is added. Run **after** Plan 1 (which heavily modifies root.tsx) to avoid conflicts. All other plans touch different files.
