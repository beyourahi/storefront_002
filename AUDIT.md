# Audit Findings — storefront_002

**Date**: 2026-03-27 (original audit)
**Last updated**: 2026-04-02
**Scope**: Full frontend UI/UX + backend implementation audit

---

## Resolved

62 of the original 67 audit items have been implemented and verified. This file tracks only the **5 remaining items**.

---

## Remaining Items

### 1. React Router version mismatch (CRITICAL)

Hydrogen requires React Router 7.9.x but 7.12.0 is installed. Dev server emits a version mismatch warning on every startup.

- **File**: `package.json`
- **Risk**: Routing, code splitting, and other framework-level issues
- **Action**: Investigate whether any 7.10-7.12 APIs are in use, then downgrade

### 2. Missing `PUBLIC_STOREFRONT_ID` configuration (MEDIUM)

`PUBLIC_STOREFRONT_ID=` is empty in `.env`. This causes two console errors on every page load:

- `[h2:error:ShopifyAnalytics] Unable to send Shopify analytics: Missing shop.hydrogenSubchannelId configuration`
- `Error initializing PerfKit: Either themeInstanceId or storefrontId must be defined`

- **File**: `.env`
- **Action**: Retrieve the Hydrogen app ID from Shopify admin and set `PUBLIC_STOREFRONT_ID`

### 3. Placeholder tokens in Terms of Service (DEFERRED — merchant content)

`/policies/terms-of-service` contains unfilled placeholder tokens: `[INSERT TRADING NAME]`, `[INSERT BUSINESS ADDRESS]`, `[INSERT BUSINESS PHONE NUMBER]`, etc.

- **Source**: Shopify admin policy content, not codebase
- **Action**: Client must fill in policy details via Shopify admin

### 4. Demo store name in policy content (DEFERRED — merchant content)

`/policies/terms-of-service` references "horcrux-demo-store" instead of the client's brand name.

- **Source**: Shopify admin policy content, not codebase
- **Action**: Client must update policy content via Shopify admin

---

## Notes

- Items #3 and #4 are deferred by design — policy content is managed in Shopify admin, not in code
- Item #2 covers both original audit items #11 and #12 (same root cause)
- The full original 67-item audit and verification report are preserved in git history (commit range up to 2026-03-28)
