# Plan 5: Cart & Checkout Fixes

## Summary

The cart action handler has a null-safety issue where `result.cart.id` is accessed inconsistently, missing input validation on the quick-checkout route that accepts variant IDs and quantities from URLs, a non-atomic promo code flow that can leave the cart in an inconsistent state if intermediate API calls fail, and a potentially redundant gift card action alongside newer granular alternatives.

## Items Covered

- **#36** `cart.tsx:127-179` — `CustomPromoCodeApply` makes 3 sequential API calls with no atomicity
- **#37** `cart.tsx:185-186` — `result.cart.id` accessed inconsistently (uses `result.cart.id` instead of extracted `cartId`)
- **#39** `cart.$lines.tsx:71-80` — No validation of variant ID format or quantity
- **#51** `cart.tsx` — Redundant `GiftCardCodesUpdate` action alongside newer Add/Remove pattern

## Current State

- `app/routes/cart.tsx:127-179`: CustomPromoCodeApply flow:
  1. Try code as discount: `cart.updateDiscountCodes([promoCode, ...existing])`
  2. If not applicable, remove invalid discount: `cart.updateDiscountCodes(existing)`
  3. Try as gift card: `cart.updateGiftCardCodes([promoCode, ...existing])`
  If step 2 fails, the cart retains the invalid discount code and step 3 never executes.

- `app/routes/cart.tsx:185-186`:
  ```typescript
  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  ```
  The ternary guard prevents null access, but `result.cart.id` should be the already-extracted `cartId` for consistency.

- `app/routes/cart.$lines.tsx:71-80`:
  ```typescript
  const linesMap = lines.split(",").map(line => {
      const lineDetails = line.split(":");
      const variantId = lineDetails[0];
      const quantity = parseInt(lineDetails[1], 10);
      return {
          merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
          quantity
      };
  });
  ```
  `parseInt` returns `NaN` for non-numeric input. No validation of `variantId` format. Missing `lineDetails[1]` produces `NaN`. These invalid values are passed directly to `cart.create()`.

- `app/routes/cart.tsx`: Has `CartForm.ACTIONS.GiftCardCodesUpdate` (batch replace all codes) alongside `CartForm.ACTIONS.GiftCardCodesAdd` and `CartForm.ACTIONS.GiftCardCodesRemove` (granular operations). The batch action uses `cart.updateGiftCardCodes()`.

## Target State

- CustomPromoCodeApply step 2 (cleanup) wrapped in try/catch so gift card attempt always executes
- `result.cart.id` consistently uses extracted `cartId` variable
- Cart.$lines validates variant ID format and quantity before creating cart
- GiftCardCodesUpdate either removed (if unused) or documented as legacy alongside the granular API

## Implementation Approach

### #37 — Null Cart Check (`cart.tsx:185-186`)

Change line 186 from:
```typescript
const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
```
To:
```typescript
const headers = cartId ? cart.setCartId(cartId) : new Headers();
```

This is a minor consistency fix — the ternary already guards against null, but using the extracted `cartId` is cleaner and avoids potential issues if `result` shape changes.

### #39 — Variant Validation (`cart.$lines.tsx:71-80`)

Replace lines 71-80 with validated parsing:
```typescript
const linesMap = lines.split(",").map(line => {
    const lineDetails = line.split(":");
    const variantId = lineDetails[0];
    const quantity = parseInt(lineDetails[1], 10);

    // Validate: variantId must be numeric, quantity must be positive integer
    if (!variantId || !/^\d+$/.test(variantId) || isNaN(quantity) || quantity < 1) {
        return null;
    }

    return {
        merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
        quantity
    };
}).filter(Boolean);

// If all lines were invalid, redirect to home
if (linesMap.length === 0) return redirect("/");
```

The `^\d+$` check on `variantId` ensures it is a valid Shopify variant numeric ID. The `quantity < 1` check prevents zero, negative, and NaN quantities. Invalid individual lines are silently dropped (graceful degradation for partially valid URLs).

### #36 — Promo Code Atomicity (`cart.tsx:127-179`)

The 3-step flow is inherently sequential due to Shopify's API design. The fix is defensive: wrap step 2 (cleanup) in try/catch so failure does not prevent the gift card attempt.

Change lines 169-171 from:
```typescript
// First, remove the invalid discount code we just added
await cart.updateDiscountCodes(existingDiscountCodes);
```
To:
```typescript
// Remove the invalid discount code (defensive: don't let cleanup failure block gift card attempt)
try {
    await cart.updateDiscountCodes(existingDiscountCodes);
} catch {
    // Cleanup failed — cart may still have the invalid discount code.
    // Proceed to gift card attempt regardless.
}
```

### #51 — Redundant GiftCardCodesUpdate

**Investigation needed**: Search the codebase for any component dispatching `CartForm.ACTIONS.GiftCardCodesUpdate`:

```bash
grep -r "GiftCardCodesUpdate" app/
```

If no frontend code dispatches this action:
- Remove the `CartForm.ACTIONS.GiftCardCodesUpdate` case from the switch statement in `cart.tsx`
- This simplifies the cart handler and removes the potential for confusion between batch and granular gift card operations

If frontend code does dispatch it:
- Keep the action but add a comment:
  ```typescript
  // Legacy batch API: replaces ALL gift card codes at once.
  // Prefer GiftCardCodesAdd/GiftCardCodesRemove for granular operations.
  ```

## Constraints

- `cart.$lines.tsx` is used for external "Buy Now" links (email campaigns, QR codes, affiliate links) — must handle invalid input gracefully without showing error pages to end users
- Frontend consumers of cart action responses may depend on the response shape — do not change the `data()` return structure
- The CustomPromoCodeApply flow is the only unified promo handler — both discount and gift card code paths must remain functional
- Shopify's Cart API does not support "try discount, if not applicable try gift card" as an atomic operation

## Execution Order

1. #37 — Null cart check (one-line fix, no dependencies)
2. #39 — Variant validation (changes parsing logic)
3. #36 — Promo code atomicity (adds try/catch to step 2)
4. #51 — GiftCardCodesUpdate (investigate usage, then remove or document)

## Parallelism Notes

This plan touches `cart.tsx` and `cart.$lines.tsx`. Plan 3 also touches `cart.tsx` (lines 189-196 for redirect validation) — if running in the same worktree, coordinate changes. The affected line ranges don't overlap (Plan 3: 189-196, Plan 5: 127-186), so both can be applied cleanly. All other plans touch different files.
