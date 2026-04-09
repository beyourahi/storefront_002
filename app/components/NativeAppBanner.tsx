/**
 * @fileoverview Native App Banner Component
 *
 * @description
 * Persistent floating pill button that appears on iOS and Android devices, routing
 * users to the native app (if installed) or to the App Store / Play Store.
 *
 * This is NOT the PWA OpenInAppButton — that handles browser-to-PWA installation.
 * This component targets a fully native iOS/Android app in the App Store / Play Store.
 *
 * @features
 * - Mobile-only: hidden on md+ screens via md:hidden (desktop has no native app equivalent)
 * - Platform-aware: different label/icon for iOS vs Android
 * - Session-dismissible: X button writes to sessionStorage, banner stays hidden for the tab session
 * - Safe-area-inset-bottom: respects iOS notch / Android gesture nav via CSS env()
 * - Entrance animation: slides up from below viewport after 1.5s page-load delay
 * - Z-index z-40: below StickyMobileGetNow (z-50) on product pages — product CTA takes priority
 * - Config-guarded: renders null when NATIVE_APP_CONFIG.isConfigured is false (template demo mode)
 *
 * @z_index_rationale
 * StickyMobileGetNow is z-50 and only appears on product pages when the user has scrolled
 * past the buy section. When it slides in (from bottom), it covers the native app banner —
 * this is the correct behavior: the purchase CTA takes visual priority over the app install
 * prompt. On all other pages and scroll positions, z-40 is uncontested at the bottom.
 *
 * @desktop_behavior
 * Desktop users see nothing. The component renders null for "desktop" platform and is
 * additionally hidden via md:hidden CSS. No store redirect is ever triggered on desktop.
 *
 * @related
 * - ~/lib/native-app-link - Deep-link logic (platform detection, URI scheme, store redirect)
 * - ~/components/StickyMobileGetNow - Product-page CTA that takes z-50 priority
 * - ~/components/pwa/OpenInAppButton - Separate PWA install button (different concern)
 * - ~/root.tsx - Mount point (alongside OpenInAppButton)
 */

import {useState, useEffect} from "react";
import {useLocation} from "react-router";
import {Smartphone, X} from "lucide-react";
import {cn} from "~/lib/utils";
import {detectPlatform, openNativeApp, NATIVE_APP_CONFIG} from "~/lib/native-app-link";
import type {AppPlatform} from "~/lib/native-app-link";

// =============================================================================
// CONSTANTS
// =============================================================================

/** sessionStorage key for banner dismissal. Resets on new browser session. */
const DISMISSED_KEY = "native-app-banner-dismissed";

// Platform-specific label copy
const PLATFORM_LABELS: Record<Exclude<AppPlatform, "desktop">, string> = {
    ios: "Get it on App Store",
    android: "Get it on Google Play"
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * NativeAppBanner — Floating mobile app install / open button.
 *
 * Renders a pill-shaped button at the bottom-right of the screen on iOS and Android.
 * On tap, attempts to open the native app via URI scheme; redirects to the
 * appropriate store if the app is not installed.
 *
 * @example
 * ```tsx
 * // In root.tsx, at the shell level (outside PageLayout)
 * <NativeAppBanner />
 * ```
 */
export function NativeAppBanner() {
    const location = useLocation();
    const [platform, setPlatform] = useState<AppPlatform>("desktop");
    const [dismissed, setDismissed] = useState(true); // start hidden, reveal after hydration check
    const [isOpening, setIsOpening] = useState(false);

    // Detect platform and check dismissal state after hydration (SSR-safe)
    useEffect(() => {
        const detected = detectPlatform();
        setPlatform(detected);

        if (detected !== "desktop") {
            const wasDismissed = sessionStorage.getItem(DISMISSED_KEY) === "1";
            setDismissed(wasDismissed);
        }
    }, []);

    // =============================================================================
    // GUARDS
    // =============================================================================

    // Don't render when the feature isn't configured (template demo mode)
    if (!NATIVE_APP_CONFIG.isConfigured) return null;

    // Don't render on desktop (no native app equivalent; also hidden via md:hidden)
    if (platform === "desktop") return null;

    // Don't render when dismissed for this session
    if (dismissed) return null;

    // =============================================================================
    // HANDLERS
    // =============================================================================

    const handleOpen = async () => {
        if (isOpening) return;
        setIsOpening(true);

        try {
            await openNativeApp(location.pathname, location.search);
        } finally {
            // Reset after the timeout resolves (either opened or store redirect was triggered)
            setIsOpening(false);
        }
    };

    const handleDismiss = (e: React.MouseEvent) => {
        // Prevent the dismiss click from bubbling to the open handler
        e.stopPropagation();
        sessionStorage.setItem(DISMISSED_KEY, "1");
        setDismissed(true);
    };

    // =============================================================================
    // RENDER
    // =============================================================================

    const label = PLATFORM_LABELS[platform as Exclude<AppPlatform, "desktop">];

    return (
        /**
         * Positioning:
         * - fixed: stays in place regardless of scroll
         * - right-4: 16px from right edge
         * - bottom-[max(1rem,env(safe-area-inset-bottom))]: at least 16px from bottom,
         *   or safe-area-inset-bottom if larger (handles iPhone home indicator + Android gesture nav)
         * - md:hidden: desktop users never see this
         * - z-40: below StickyMobileGetNow (z-50) — product CTA takes visual priority
         * - animate-pill-slide-up: entrance from below viewport, delayed 1.5s
         */
        <div
            className={cn(
                // Position
                "fixed right-4 z-40 md:hidden",
                // Safe-area-inset-bottom: minimum 1rem, expands for notched/gesture-nav phones
                "bottom-[max(1rem,env(safe-area-inset-bottom))]",
                // Entrance animation (1.5s delay lets the page load first)
                "animate-pill-slide-up opacity-0",
                // Pill shape
                "flex items-center gap-2.5 rounded-full",
                // Color: bg-primary = dark, text-primary-foreground = white
                // primary (#1f1f1f) on primary-foreground (#fff) = 14.68:1 (WCAG AAA) ✓
                "bg-primary text-primary-foreground",
                // Elevation shadow
                "shadow-xl",
                // Padding: vertical is symmetric, right is tighter because dismiss btn is there
                "pl-4 pr-3 py-3",
                // Touch target minimum: height is py-3 (24px×2) + content (~20px) = 64px > 44px ✓
                "min-h-[52px]"
            )}
            style={{animationDelay: "1500ms", animationFillMode: "both"}}
            // Accessible role for the whole pill group
            role="group"
            aria-label="Open in native app"
        >
            {/* Open app button — occupies most of the pill */}
            <button
                type="button"
                onClick={() => void handleOpen()}
                disabled={isOpening}
                className={cn(
                    "flex items-center gap-2.5",
                    // Inherit colors from parent pill
                    "text-primary-foreground",
                    // Cursor and interaction
                    "cursor-pointer",
                    // Keyboard focus: visible ring inset on the pill
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60 focus-visible:ring-offset-1 focus-visible:ring-offset-primary rounded-full",
                    // Loading state opacity
                    isOpening && "opacity-70"
                )}
                aria-label={label}
            >
                {/* App icon placeholder — swap with <img> once branding is available */}
                <Smartphone
                    className="size-4 shrink-0"
                    aria-hidden="true"
                />
                <span className="text-sm font-medium leading-none whitespace-nowrap">
                    Open in App
                </span>
            </button>

            {/* Divider */}
            <span className="h-4 w-px bg-primary-foreground/20 shrink-0" aria-hidden="true" />

            {/* Dismiss button */}
            <button
                type="button"
                onClick={handleDismiss}
                className={cn(
                    "flex items-center justify-center rounded-full",
                    // Touch target: 28×28px (above WCAG minimum when combined with pill padding)
                    "size-7",
                    // Subtle hover state
                    "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10",
                    "transition-colors duration-150",
                    // Keyboard focus
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
                )}
                aria-label="Dismiss app banner"
            >
                <X className="size-3.5" aria-hidden="true" />
            </button>
        </div>
    );
}
