# Plan 8: Route Rendering & Content Fixes

## Summary

The account profile route has a logic bug where `createAddress` intent incorrectly requires an `addressId`, and the profile PUT handler lacks an authentication check. The blog index throws 404 instead of rendering an empty state. The gallery page renders empty with no feedback. Policy pages have theme/styling issues including clashing colors, excessive top padding, and Shopify-provided placeholder tokens.

## Items Covered

- **#34** `account.profile.tsx:241-245` — `createAddress` requires `addressId` but new addresses have no ID
- **#35** `account.profile.tsx:401-411` — Profile PUT handler missing authentication check
- **#52** `/blogs` route returns 404 instead of empty state
- **#53** `/gallery` page renders empty — no gallery images appear
- **#54** Policy pages render with theme that clashes with site's dark theme
- **#55** Policy pages have excessive top padding pushing content below viewport
- **#56** `/policies/terms-of-service` has unfilled placeholder tokens
- **#57** `/policies/terms-of-service` references "horcrux-demo-store" instead of brand name

## Current State

- `app/routes/account.profile.tsx:241-245`:
  ```typescript
  if (intent === "createAddress" || intent === "updateAddress" || intent === "deleteAddress") {
      const addressId = form.has("addressId") ? String(form.get("addressId")) : null;
      if (!addressId) {
          throw new Error("You must provide an address id.");
      }
  ```
  This checks ALL three intents for addressId. `createAddress` has no existing ID, so it always throws.

- `app/routes/account.profile.tsx:401-411`:
  ```typescript
  if (request.method === "PUT") {
      const customer: CustomerUpdateInput = {};
      // ... builds customer object
      const {data: mutationData, errors} = await customerAccount.mutate(CUSTOMER_UPDATE_MUTATION, {...});
  ```
  No `isLoggedIn` check before the mutation. If session expired, `customerAccount.mutate()` throws unhandled.

- `app/routes/blogs._index.tsx`: Throws 404 when `!hasRealContent` (no blogs with articles exist)
- `app/routes/gallery.tsx`: Renders `<GalleryGrid />` which maps `images` array — if empty, renders nothing with no user feedback
- `app/routes/policies.$handle.tsx:138-140`: Uses `bg-primary` (dark background) with `text-primary-foreground`. Policy HTML content from Shopify may have its own color styling that clashes
- `app/routes/policies.$handle.tsx:140`: `pt-32 sm:pt-36 md:pt-44 lg:pt-52 xl:pt-64` — padding ranges from 128px to 256px
- Policy content (terms of service, privacy policy) comes from Shopify's store settings and contains `[INSERT TRADING NAME]`, `[INSERT BUSINESS ADDRESS]`, etc. — these are merchant-provided placeholders that have not been filled in
- "horcrux-demo-store" appears because development uses the demo store credentials

## Target State

- `createAddress` intent does not require `addressId`
- Profile PUT handler checks authentication before mutating
- Blog index shows empty state messaging instead of 404
- Gallery shows empty state messaging when no images
- Policy pages have readable styling that works with the site's dark theme
- Policy top padding reduced to reasonable values
- Placeholder tokens and demo store names documented as merchant action items

## Implementation Approach

### #34 — createAddress Logic Bug (`account.profile.tsx:241-245`)

**File**: `app/routes/account.profile.tsx`

Restructure the address intent handling to separate create (no addressId needed) from update/delete (addressId required):

```typescript
// Handle address creation (no addressId needed)
if (intent === "createAddress") {
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
        return remixData(
            {error: {create: "Unauthorized"}},
            {status: 401, headers: {"Set-Cookie": await context.session.commit()}}
        );
    }

    const defaultAddress = form.has("defaultAddress") ? String(form.get("defaultAddress")) === "on" : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
        "address1", "address2", "city", "company", "territoryCode",
        "firstName", "lastName", "phoneNumber", "zoneCode", "zip"
    ];

    for (const key of keys) {
        const value = form.get(key);
        if (typeof value === "string") {
            address[key] = value;
        }
    }

    const {data, errors} = await customerAccount.mutate(CREATE_ADDRESS_MUTATION, {
        variables: {address, defaultAddress, language: customerAccount.i18n.language}
    });

    // ... existing error handling and response
}

// Handle address update/delete (addressId required)
if (intent === "updateAddress" || intent === "deleteAddress") {
    const addressId = form.has("addressId") ? String(form.get("addressId")) : null;
    if (!addressId) {
        throw new Error("You must provide an address id.");
    }

    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
        return remixData(
            {error: {[addressId]: "Unauthorized"}},
            {status: 401, headers: {"Set-Cookie": await context.session.commit()}}
        );
    }

    // ... existing update/delete logic
}
```

The key change: separate the `createAddress` branch before the `addressId` check. The address field parsing code (keys array, for loop) can be shared via a helper function to avoid duplication.

### #35 — Profile PUT Missing Auth Check (`account.profile.tsx:401-411`)

**File**: `app/routes/account.profile.tsx`

Add authentication check at the start of the PUT handler:

```typescript
if (request.method === "PUT") {
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
        return remixData(
            {error: {profile: "Unauthorized"}, customer: null},
            {
                status: 401,
                headers: {
                    "Set-Cookie": await context.session.commit(),
                    "Cache-Control": "no-cache, no-store, must-revalidate"
                }
            }
        );
    }

    const customer: CustomerUpdateInput = {};
    // ... rest of existing PUT logic
}
```

### #52 — Blog Index Empty State

**File**: `app/routes/blogs._index.tsx`

Replace the 404 throw when `!hasRealContent` with returning empty data that the component can render as an empty state:

```typescript
if (!hasRealContent) {
    return {
        blogs: [],
        featuredArticle: null,
        articles: [],
        // ... other expected fields with empty defaults
    };
}
```

Then in the component, add an empty state check:
```tsx
if (!blogs || blogs.length === 0) {
    return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
            <h1 className="text-2xl font-bold text-primary-foreground">Blog</h1>
            <p className="mt-4 text-primary-foreground/60">No blog posts yet. Check back soon.</p>
        </div>
    );
}
```

### #53 — Gallery Empty State

**File**: `app/routes/gallery.tsx`

Add empty state check before rendering the gallery grid. In the component, before the GalleryGrid:
```tsx
if (!images || images.length === 0) {
    return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
            <h1 className="text-2xl font-bold text-primary-foreground">The Gallery</h1>
            <p className="mt-4 text-primary-foreground/60">No gallery images available yet.</p>
        </div>
    );
}
```

### #54 — Policy Theme Clash

**File**: `app/routes/policies.$handle.tsx`

The policy prose content is set from Shopify-provided HTML and may have its own color styling that clashes with the dark theme. Wrap the prose content container with Tailwind typography plugin modifiers that force consistent readability:

```tsx
<div
    className="prose prose-sm sm:prose-base max-w-none
               prose-headings:text-primary-foreground prose-p:text-primary-foreground/80
               prose-a:text-primary-foreground prose-a:underline
               prose-strong:text-primary-foreground prose-li:text-primary-foreground/80"
>
    {/* Policy content rendered here */}
</div>
```

The `prose-*` modifiers override any inline colors from Shopify's content with the site's theme colors, ensuring headings, paragraphs, links, bold text, and list items all use the `primary-foreground` color family.

### #55 — Policy Excessive Top Padding

**File**: `app/routes/policies.$handle.tsx` line 140

Change:
```
pt-32 sm:pt-36 md:pt-44 lg:pt-52 xl:pt-64
```
To:
```
pt-24 sm:pt-28 md:pt-32 lg:pt-36
```

Current padding: 128px to 256px. Reduced to 96px to 144px. With a header height of ~80px, this gives 16-64px of breathing room below the header.

### #56, #57 — Placeholder Tokens and Demo Store Name

These are **Shopify content issues**, not code bugs:

- `[INSERT TRADING NAME]`, `[INSERT BUSINESS ADDRESS]`, etc. are Shopify's default policy template placeholders that the merchant needs to fill in via Shopify admin > Settings > Policies
- "horcrux-demo-store" appears because development uses the demo store. In a client deployment, the client's store name would appear

**Action**: Document these as merchant onboarding tasks, not code fixes. Optionally, add a development-mode visual indicator that detects the `[INSERT` pattern in policy body text and renders a warning banner suggesting the merchant update their policies in Shopify admin.

## Constraints

- Account profile restructuring must preserve the existing mutation GraphQL queries and response handling patterns
- The address field parsing (keys array loop) should be shared between create and update to avoid duplication
- Blog and gallery empty states should be visually consistent with each other and the site's design language
- Policy prose styling must work with any HTML content Shopify provides — do not assume specific structure
- Policy padding reduction must still account for the transparent/overlapping header pattern used on exception pages

## Execution Order

1. **#34** then **#35** (same file `account.profile.tsx`, sequential)
2. **#52** (blog empty state)
3. **#53** (gallery empty state)
4. **#54** then **#55** (same file `policies.$handle.tsx`, sequential)
5. **#56, #57** (documentation items — add dev-mode warning if desired)

## Parallelism Notes

This plan touches `account.profile.tsx`, `blogs._index.tsx`, `gallery.tsx`, and `policies.$handle.tsx`. No overlap with any other plan. Safe to execute in parallel with all other plans.
