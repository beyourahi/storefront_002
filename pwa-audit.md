# PWA "Open in App" — Full Audit Report

---

## 1. Manifest Audit (Workstream A)

The manifest is dynamically generated at `app/routes/manifest[.]webmanifest.tsx` via the `/manifest.webmanifest` route.

| Criterion | Status | Notes |
|---|---|---|
| `display: "standalone"` | ✅ PASS | Hardcoded, never configurable |
| `start_url: "/"` | ✅ PASS | Hardcoded |
| `scope: "/"` | ✅ PASS | Hardcoded |
| `orientation: "any"` | ✅ PASS | Hardcoded |
| `prefer_related_applications: false` | ✅ PASS | Will NOT suppress the web install prompt — this is the most common silent failure mode and it's correctly set |
| `related_applications` (webapp platform) | ✅ PASS | Self-reference with manifest URL, enables `getInstalledRelatedApps()` |
| 192×192 icon present | ✅ PASS | Built from `siteSettings.icon192Url` |
| 512×512 icon present | ⚠️ PARTIAL | Present, but `purpose: "maskable"` only — no `"any"` variant at 512px |
| Maskable icon variant | ✅ PASS | 512×512 carries `purpose: "maskable"` |
| HTTPS delivery | ✅ PASS | Oxygen = Cloudflare Workers (HTTPS only) |
| Service worker with fetch handler | ✅ PASS | Workbox strategies all register fetch routes |
| Manifest served via SW | ✅ PASS | Explicitly `NetworkOnly` in `sw.js:35-37` — prevents stale manifest being served |
| Fallback manifest (icons missing) | ⚠️ WARNING | Serves `icons: []` with `max-age=300` — app won't install but won't hard-fail |
| **Error-state fallback manifest (catch block)** | 🔴 BUG | `manifest[.]webmanifest.tsx:140-157` is **missing** `related_applications`, `prefer_related_applications`, `id`, `scope`, and `orientation` — if the data query throws, `getInstalledRelatedApps()` detection silently breaks |

---

## 2. Button Inventory (Workstream B)

Two render sites. One shared component. No divergent logic.

| # | File | Component | Variant | Visibility Condition | Install-State Guard | iOS Fallback |
|---|---|---|---|---|---|---|
| 1 | `app/root.tsx:530` | `<OpenInAppButton variant="desktop-fixed" />` | Fixed bottom-right | **Always rendered** — no guard | ❌ None | ✅ via `IosInstallInstructions` |
| 2 | `app/components/FullScreenMenu.tsx:305` | `<OpenInAppButton variant="menu-item" />` | In full-screen nav | `sm:hidden` wrapper — mobile only | ❌ None | ✅ via `IosInstallInstructions` |

**Critical observation**: The component at `OpenInAppButton.tsx:50` destructures `{canInstall, isIOS, triggerInstall, appName, appIcon}` from `usePwaInstall` — but the hook also returns `isStandalone` and `isAppDetectedAsInstalled`. **Neither is consumed by the component.** The hook's own JSDoc example (lines 53–66) shows the intended guard pattern:

```tsx
// Hook docs show this — but the component doesn't implement it:
if (isStandalone) return <AlreadyInstalledMessage />;
if (isIOS) return <IosInstallInstructions />;
if (canInstall) return <InstallButton />;
```

The component renders unconditionally.

---

## 3. Install State Lifecycle (Workstream C)

### 3.1 Event Capture Chain

```
Page load
  │
  ├─ <head> script: /pwa-install-capture.js (synchronous, no defer)
  │     └─ window.addEventListener("beforeinstallprompt", e => {
  │           e.preventDefault()  ✅
  │           window.__pwaInstallPromptEvent = e  ✅
  │        })
  │
  └─ React hydration → usePwaInstall() useEffect
        ├─ Checks window.__pwaInstallPromptEvent (event already fired?)
        │     └─ if exists → deferredPromptRef.current = event, delete window.__pwaInstallPromptEvent
        └─ Also adds window.addEventListener("beforeinstallprompt", ...)
              └─ Handles events that fire after hydration ✅
```

Both capture paths call `e.preventDefault()`. **Deferral is correct.**

### 3.2 State Across Sessions

| State | Storage | Survives Refresh | Survives Navigation |
|---|---|---|---|
| `deferredPromptRef.current` | React ref (component memory) | ❌ Lost on refresh | ✅ Preserved (root layout stays mounted) |
| `isAppMarkedAsInstalled` | `localStorage["pwa-app-installed"]` | ✅ Persists | ✅ Persists |
| `canInstall` | React state | ❌ Lost on refresh | ✅ Preserved |
| `isStandalone` | React state, re-detected on mount | ✅ Re-detected from `matchMedia` | ✅ Preserved |

After a hard refresh, the browser re-fires `beforeinstallprompt` if the app is still installable. The pre-hydration script catches it again — this is correct.

### 3.3 Post-Prompt Lifecycle

```
triggerInstall() called
  → deferredPromptRef.current.prompt()
  → await userChoice
      ├─ "accepted" → trackEvent, clear ref, setCanInstall(false), setIsInstalling(false)
      └─ "dismissed" → trackEvent, clear ref, setCanInstall(false), setIsInstalling(false)
                           ↑
                     ⚠️ Bug: button stays visible but now falls to reload fallback
                       (see Issue I-03)
```

The `appinstalled` event handler correctly calls `setAppInstalled()`, `setCanInstall(false)`, and `setIsStandalone(true)`. However, `isStandalone` being set to `true` doesn't hide the button because the button component doesn't check `isStandalone`.

### 3.4 Platform Detection

| Platform | Detection Method | Accuracy |
|---|---|---|
| iOS (iPhone/iPod/iPad) | `navigator.userAgent` regex | ⚠️ **Fails on iPadOS 13+ in desktop mode** — reports as "Macintosh" |
| Android | `navigator.userAgent` regex | ✅ Reliable |
| Desktop | `getPlatform() === "desktop"` | ✅ Correct fallback |
| Standalone mode | `matchMedia("(display-mode: standalone)") \|\| navigator.standalone` | ✅ Covers both Chromium + iOS |

---

## 4. Environment Matrix (Workstream D)

Dynamic browser testing was not run (read-only audit scope). The table below reflects **statically derived expectations** from the code.

| Browser / OS | `canInstall` | iOS Branch | Standalone Detection | Click (not installed) | Click (installed) | Fallback UX | Expected Issues |
|---|---|---|---|---|---|---|---|
| Chrome 124 / Android | ✅ Fires | ❌ | ✅ matchMedia | Triggers native prompt ✅ | Reload ⚠️ | N/A | None in happy path; I-03 post-dismiss |
| Chrome 124 / macOS | ✅ Fires | ❌ | ✅ matchMedia | Triggers native prompt ✅ | Reload ⚠️ | N/A | I-01: fixed button visible in standalone |
| Chrome 124 / Windows | ✅ Fires | ❌ | ✅ matchMedia | Triggers native prompt ✅ | Reload ⚠️ | N/A | Same as macOS |
| Edge 124 / Windows | ✅ Fires | ❌ | ✅ matchMedia | Triggers native prompt ✅ | Reload ⚠️ | N/A | Same as Chrome |
| Samsung Internet / Android | ✅ Fires | ❌ | ✅ matchMedia | Triggers prompt ✅ | Reload ⚠️ | N/A | No unique issues |
| Opera / Desktop | ✅ Fires | ❌ | ✅ matchMedia | Triggers prompt ✅ | Reload ⚠️ | N/A | Same as Chrome |
| Firefox 126 / Desktop | ❌ No event | ❌ | ✅ matchMedia | **Falls to reload** 🔴 | Reload 🔴 | None shown ❌ | I-02: button shows but does nothing useful |
| Firefox 126 / Android | ❌ No event | ❌ | ✅ matchMedia | **Falls to reload** 🔴 | Reload 🔴 | None shown ❌ | Same as Firefox desktop |
| Safari 17 / macOS | ❌ No event | ❌ | ✅ matchMedia | **Falls to reload** 🔴 | Reload 🔴 | None shown ❌ | I-02: no install path, no fallback |
| Safari 17 / iOS | ❌ No event | ✅ (detected) | ✅ navigator.standalone | Shows bottom sheet ✅ | Sheet still shows ⚠️ | ✅ IosInstallInstructions shown | I-01: shows even in standalone |
| Safari / iPadOS 13+ (desktop mode) | ❌ No event | ❌ **WRONG** | ✅ matchMedia | **Falls to reload** 🔴 | Reload 🔴 | None shown ❌ | I-04: UA reports Macintosh, iOS branch missed |

---

## 5. Issue Log

| ID | Title | Severity | Affected Environments | Root Cause |
|---|---|---|---|---|
| **I-01** | Button renders when running as installed PWA | 🔴 HIGH | All browsers | `OpenInAppButton` does not check `isStandalone` before rendering |
| **I-02** | No fallback UX on non-Chromium, non-iOS browsers | 🔴 HIGH | Firefox desktop/Android, Safari macOS | Click falls through to `window.location.href = origin` (page reload) with no explanation |
| **I-03** | Post-dismiss: button stays visible with reload-only behavior | 🟠 MEDIUM | Chrome, Edge, Samsung, Opera | After user dismisses install prompt, `canInstall` becomes `false` but button persists, silently reloading |
| **I-04** | iPadOS 13+ desktop mode UA detection failure | 🟠 MEDIUM | Safari on iPadOS 13+ with "Request Desktop Website" | UA reports "Macintosh" — iOS branch not triggered, `canInstall` also false (WebKit), button reloads |
| **I-05** | Error-state fallback manifest strips installability fields | 🟡 LOW | All browsers when metaobject query fails | `manifest[.]webmanifest.tsx:140-157` catch-block omits `related_applications`, `prefer_related_applications`, `id`, `scope`, `orientation` |
| **I-06** | 512×512 icon is `purpose: "maskable"` only | 🟡 LOW | Chrome install prompt dialog, Samsung Internet | No `"any"` purpose icon at 512px — install prompt dialog falls back to 192px icon |
| **I-07** | Button label hardcoded "Open in App" regardless of state | 🟡 LOW | All | `canInstall=true` → label should be "Install"; no-install state → label is misleading |
| **I-08** | `trackInstallPrompt()`, `trackInstallAccepted()`, `trackInstallDismissed()` never called | 🟡 LOW | All | `usePwaInstall.ts` uses ad-hoc `trackEvent()` directly; typed analytics functions in `usePwaAnalytics.ts` are dead code |

### Reproduction Steps

**I-01 (Button visible in standalone PWA):**
1. Install the PWA on Chrome / Android
2. Open the installed app (standalone mode)
3. Navigate to the homepage
4. Observe: "Open in App" fixed button is visible at bottom-right

**I-02 (Silent reload on Firefox/Safari):**
1. Open the site in Firefox desktop or Safari macOS
2. Observe: "Open in App" button is visible at bottom-right
3. Click it
4. Observe: Page refreshes to the same URL — no prompt, no instructions, no feedback

---

## 6. Prioritised Remediation Plan

### Priority 1 — 🔴 Fix: Add `isStandalone` rendering guard

**File**: `app/components/pwa/OpenInAppButton.tsx`

```tsx
// Current
const {canInstall, isIOS, triggerInstall, appName, appIcon} = usePwaInstall();

// Fixed
const {canInstall, isIOS, isStandalone, triggerInstall, appName, appIcon} = usePwaInstall();

// Add before return:
if (isStandalone) return null;
```

**Why**: The button has no purpose when the user is already inside the installed PWA. Showing it creates confusion and implies something is broken.

---

### Priority 2 — 🔴 Fix: Hide button when no install mechanism is available

**File**: `app/components/pwa/OpenInAppButton.tsx`

```tsx
// After the isStandalone guard, add:
if (!canInstall && !isIOS) return null;
```

**Why**: On Firefox desktop and Safari macOS, the click handler falls to `window.location.href = window.location.origin` — a page reload with zero user feedback. Hiding the button on unsupported browsers is cleaner than a confusing no-op.

**Caveats**: This removes the button entirely on those platforms. An alternative is rendering a tooltip explaining the limitation, but hiding is simpler and better UX.

---

### Priority 3 — 🟠 Fix: Hide button after prompt is dismissed

**File**: `app/hooks/usePwaInstall.ts` + `app/components/pwa/OpenInAppButton.tsx`

Add `wasPromptDismissed` state to the hook:

```tsx
// In usePwaInstall.ts triggerInstall():
if (outcome === "dismissed") {
    setWasPromptDismissed(true);
    // existing code...
}

// Return wasPromptDismissed from the hook.

// In OpenInAppButton.tsx:
if (!canInstall && !isIOS && wasPromptDismissed) return null;
```

**Why**: Chrome throttles re-showing the prompt after dismissal. A button that silently reloads is worse UX than no button.

---

### Priority 4 — 🟠 Fix: iPadOS 13+ desktop mode detection

**File**: `app/hooks/usePwaInstall.ts:136-143`

```tsx
function detectIOSDevice(): boolean {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent;
    // Standard iOS check
    if (/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)) return true;
    // iPadOS 13+ in desktop mode reports as Macintosh, but has multitouch
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true;
    return false;
}
```

**Why**: `navigator.maxTouchPoints > 1` reliably distinguishes an iPad from a real Mac, even when the UA is spoofed to "Macintosh".

---

### Priority 5 — 🟡 Fix: Complete the error-state fallback manifest

**File**: `app/routes/manifest[.]webmanifest.tsx:140-157`

```tsx
const fallbackManifest = {
    name: "Store",
    short_name: "Store",
    start_url: "/",
    scope: "/",                          // add
    display: "standalone",
    orientation: "any",                  // add
    background_color: "#ffffff",
    theme_color: "#000000",
    categories: ["shopping"],            // add
    icons: [],
    id: "/",                             // add
    related_applications: [              // add
        {platform: "webapp", url: manifestUrl}
    ],
    prefer_related_applications: false   // add
};
```

**Why**: Without `related_applications`, `getInstalledRelatedApps()` cannot detect the app on manifest query failure — silently breaks the "already installed" detection path in an error state.

---

### Priority 6 — 🟡 Fix: Add `"any"` purpose to 512×512 icon

**File**: `app/lib/pwa-parsers.ts:153-159`

```tsx
// Instead of a single maskable entry, emit two entries:
icons.push({src: icon512, sizes: "512x512", type: "image/png", purpose: "any"});
icons.push({src: icon512, sizes: "512x512", type: "image/png", purpose: "maskable"});
```

**Why**: The install prompt dialog uses the `"any"` purpose icon for rendering the app preview. Without a `"any"` 512px icon, browsers fall back to the 192px icon in the dialog, producing a lower-resolution install preview.

---

### Priority 7 — 🟡 Fix: Wire up dead analytics functions

**File**: `app/hooks/usePwaInstall.ts:303-316`

```tsx
import {trackInstallPrompt, trackInstallAccepted, trackInstallDismissed} from "~/hooks/usePwaAnalytics";

// In triggerInstall(), before calling prompt():
trackInstallPrompt();

// After resolving userChoice:
if (outcome === "accepted") {
    trackInstallAccepted();
} else {
    trackInstallDismissed();
}
```

**Why**: `trackInstallAccepted()` and `trackInstallDismissed()` in `usePwaAnalytics.ts` are never called anywhere. The current code pushes ad-hoc event names directly to `dataLayer`, bypassing the typed, timestamped analytics layer used everywhere else in the PWA system.

---

## Summary

| Priority | Issue | Severity | Estimated Impact |
|---|---|---|---|
| 1 | I-01: Button visible inside standalone PWA | 🔴 | Every installed user sees a broken CTA |
| 2 | I-02: Button renders on Firefox/Safari with silent reload | 🔴 | ~30% of desktop users get broken behavior |
| 3 | I-03: Post-dismiss button becomes silent reload | 🟠 | Prompt dismissers (common) get a persistent, confusing button |
| 4 | I-04: iPadOS 13+ desktop mode misidentified | 🟠 | iPad + "Request Desktop Site" gets reload instead of iOS instructions |
| 5 | I-05: Error-state manifest strips detection fields | 🟡 | Breaks `getInstalledRelatedApps()` on query failure only |
| 6 | I-06: 512px icon missing `"any"` purpose | 🟡 | Suboptimal icon quality in install prompt dialog |
| 7 | I-07: Button label hardcoded "Open in App" in all states | 🟡 | Minor semantic mismatch |
| 8 | I-08: Analytics dead code | 🟡 | No GTM data on accepted/dismissed install events |

**I-01 and I-02 are each a single early-return statement** in `app/components/pwa/OpenInAppButton.tsx`. They are the fastest path to the largest correctness improvement.

---

*Audit conducted: 2026-04-10 — Read-only static analysis. No code was modified during this audit.*

---

## Resolution Log

*All 8 issues resolved: 2026-04-10. TypeScript typecheck passes (exit 0). Zero new lint errors.*

---

### I-01 — RESOLVED

**Status**: ✅ Fixed
**File**: `app/components/pwa/OpenInAppButton.tsx`
**Change**: Destructured `isStandalone` from `usePwaInstall()` and added `if (isStandalone) return null;` as the first early-return guard.

---

### I-02 — RESOLVED

**Status**: ✅ Fixed
**File**: `app/components/pwa/OpenInAppButton.tsx`
**Change**: Added `if (!canInstall && !isIOS) return null;` guard immediately after the `isStandalone` guard — hides the button on Firefox, Safari desktop, and any browser that cannot install.

---

### I-03 — RESOLVED

**Status**: ✅ Fixed (no additional state needed)
**File**: `app/components/pwa/OpenInAppButton.tsx`
**Change**: Covered by the I-02 guard: after prompt dismissal the hook sets `canInstall=false`; with `isIOS=false` on desktop, `!canInstall && !isIOS` fires and the button hides — no separate `wasPromptDismissed` state required.

---

### I-04 — RESOLVED

**Status**: ✅ Fixed
**File**: `app/hooks/usePwaInstall.ts`
**Change**: `detectIOSDevice()` now returns `true` when `navigator.userAgent` matches `Macintosh` and `navigator.maxTouchPoints > 1` (iPadOS 13+ desktop mode). `getPlatform()` received the same additional check to keep analytics platform tagging consistent.

---

### I-05 — RESOLVED

**Status**: ✅ Fixed
**File**: `app/routes/manifest[.]webmanifest.tsx`
**Change**: The catch-block `fallbackManifest` object now includes all previously missing fields: `scope`, `orientation`, `categories`, `icons`, `id`, `related_applications`, and `prefer_related_applications`. `manifestUrl` was already in scope.

---

### I-06 — RESOLVED

**Status**: ✅ Fixed
**File**: `app/lib/pwa-parsers.ts`
**Change**: `buildIconsArray()` now emits two entries for the 512×512 icon — one with `purpose: "any"` and one with `purpose: "maskable"` — so install prompt dialogs receive a full-resolution preview icon.

---

### I-07 — RESOLVED

**Status**: ✅ Fixed
**File**: `app/components/pwa/OpenInAppButton.tsx`
**Change**: `<span>Open in App</span>` replaced with `<span>{canInstall ? "Install App" : "Open in App"}</span>`. When a native install prompt is available the label reads "Install App"; on iOS (manual instructions flow) it reads "Open in App".

---

### I-08 — RESOLVED

**Status**: ✅ Fixed
**File**: `app/hooks/usePwaInstall.ts`
**Change**: Added `import {trackInstallPrompt, trackInstallAccepted, trackInstallDismissed} from "~/hooks/usePwaAnalytics"`. In `triggerInstall()`: `trackInstallPrompt()` is called before showing the native prompt; `trackInstallAccepted()` / `trackInstallDismissed()` replace the ad-hoc `trackEvent("pwa_installed", ...)` and `trackEvent("pwa_install_prompt_dismissed", ...)` calls.
