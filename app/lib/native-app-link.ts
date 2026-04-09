/**
 * @fileoverview Native App Deep-Link Module
 *
 * @description
 * Framework-agnostic module for routing web users to the native iOS/Android app.
 * Handles platform detection, URI scheme fallback with timeout, deferred deep-link
 * encoding for post-install navigation, and App Store / Play Store redirects.
 *
 * This module has NO framework dependencies (no React, no React Router) and can
 * be tested in isolation from the UI layer.
 *
 * @configuration
 * Fill in NATIVE_APP_CONFIG before enabling the banner for a client deployment.
 * Set isConfigured: true once App Store / Play Store URLs and URI schemes are live.
 *
 * @deep_link_strategy
 *
 * Preferred — Universal Links (iOS) / App Links (Android):
 *   Requires server-hosted verification files:
 *     iOS:     /.well-known/apple-app-site-association
 *     Android: /.well-known/assetlinks.json
 *   When configured, simply navigating to the HTTPS URL causes the OS to open the
 *   app silently. No JS timeout or detection needed. Set universalLinkBase to use this.
 *
 * Fallback — URI scheme with timeout:
 *   Navigate to a custom scheme (myapp://path). Watch for window blur /
 *   document.hidden (both fire when the OS switches to the app). If neither fires
 *   within 800ms, assume the app is not installed → redirect to the store.
 *   Trade-off: some browsers show a "Open in app?" confirmation dialog for unknown schemes.
 *
 * @deferred_deep_link
 *
 * When the app is NOT installed, the user passes through the store before opening.
 * The in-app destination must survive this redirect.
 *
 *   Android (supported natively):
 *     Play Store URL gets &referrer=deeplink%3D%2Fproducts%2Fslug.
 *     The native app reads this via Play's InstallReferrerClient on first launch.
 *     No third-party service needed.
 *
 *   iOS (no native equivalent):
 *     The App Store strips referrer params. Options:
 *     - Branch.io or Firebase Dynamic Links (third-party, adds SDK dependency)
 *     - Custom backend: store the destination in your own DB, keyed on a short token
 *       appended to the App Store URL via a redirect landing page you control.
 *     For most storefronts, redirecting to the App Store homepage is acceptable.
 *
 * @web_to_app_url_mapping
 * ┌────────────────────────────────────┬──────────────────────────────┐
 * │ Web route                          │ In-app destination            │
 * ├────────────────────────────────────┼──────────────────────────────┤
 * │ /                                  │ /home                         │
 * │ /products/:handle                  │ /products/:handle             │
 * │ /collections/all-products          │ /collections/all              │
 * │ /collections/:handle               │ /collections/:handle          │
 * │ /cart                              │ /cart                         │
 * │ /account                           │ /account                      │
 * │ /account/*                         │ /account/*                    │
 * │ /search?q=:term                    │ /search?q=:term               │
 * │ /wishlist                          │ /wishlist                     │
 * │ /blogs/:blog/:article              │ /articles/:article            │
 * │ /blogs                             │ /blogs                        │
 * │ (any other)                        │ /home  (safe fallback)        │
 * └────────────────────────────────────┴──────────────────────────────┘
 *
 * @desktop_behavior
 * Desktop browsers return platform "desktop" from detectPlatform().
 * openNativeApp() returns { action: "unsupported" } immediately.
 * The NativeAppBanner component hides itself on md+ screens via md:hidden,
 * so desktop users never see the button. No store redirect is triggered.
 *
 * @module
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Native app configuration for a client deployment.
 *
 * Template default: isConfigured = false → NativeAppBanner renders nothing.
 * When deploying for a client with a live native app:
 *   1. Fill in all URL fields
 *   2. Set isConfigured: true
 *
 * URI scheme format examples:
 *   iosScheme:     "mybrand://"   (must match Info.plist CFBundleURLSchemes)
 *   androidScheme: "mybrand://"   (must match AndroidManifest intent-filter)
 *
 * Universal Link format: "https://app.mybrand.com"
 *   Requires apple-app-site-association at: https://app.mybrand.com/.well-known/apple-app-site-association
 *   Leave empty to use URI scheme fallback for iOS.
 */
export const NATIVE_APP_CONFIG = {
    /**
     * iOS Universal Link base URL (preferred over URI scheme).
     * When set, openNativeApp navigates here and the OS decides app-vs-browser.
     * Leave empty ("") to fall back to iosScheme with timeout detection.
     */
    universalLinkBase: "" as string,

    /**
     * iOS custom URI scheme (fallback when universalLinkBase is not configured).
     * Must include the trailing "://" separator.
     * Example: "mybrand://"
     */
    iosScheme: "myapp://" as string,

    /**
     * Android custom URI scheme.
     * Must include the trailing "://" separator.
     * Example: "mybrand://"
     */
    androidScheme: "myapp://" as string,

    /** Full App Store URL for this app. */
    appStoreUrl: "https://apps.apple.com/app/id0000000000" as string,

    /** Full Play Store URL for this app. */
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.myapp" as string,

    /**
     * Set to true when the native app is live and the fields above are filled in.
     * When false, NativeAppBanner returns null (safe for template demos without a real app).
     */
    isConfigured: false as boolean,
} as const;

// =============================================================================
// TYPES
// =============================================================================

/** Detected device platform. */
export type AppPlatform = "ios" | "android" | "desktop";

/** Result of an openNativeApp() call. */
export interface OpenAppResult {
    /**
     * - "opened":       App opened or Universal Link navigated (OS handles it).
     * - "store_redirect": URI scheme failed (timeout) → redirected to store.
     * - "unsupported":  Desktop browser — no action taken.
     */
    action: "opened" | "store_redirect" | "unsupported";
}

// =============================================================================
// PLATFORM DETECTION
// =============================================================================

/**
 * Detect the current device platform from the user agent.
 * SSR-safe: returns "desktop" when window is not defined.
 *
 * @returns "ios" | "android" | "desktop"
 */
export function detectPlatform(): AppPlatform {
    if (typeof window === "undefined") return "desktop";

    const ua = navigator.userAgent;

    // iOS: iPhone, iPad, iPod (excludes IE11 on Windows Phone via MSStream check)
    if (/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)) return "ios";

    // Android: all Android browsers
    if (/Android/i.test(ua)) return "android";

    return "desktop";
}

// =============================================================================
// URL MAPPING
// =============================================================================

/**
 * Map a web pathname to its equivalent in-app route segment.
 * Edit the routing table above to match your app's navigation structure.
 *
 * @param pathname - window.location.pathname (e.g. "/products/blue-shirt")
 * @returns In-app path (e.g. "/products/blue-shirt")
 */
export function mapWebPathToAppPath(pathname: string): string {
    // Product detail pages
    if (pathname.startsWith("/products/")) return pathname;

    // Collection: all-products is a special alias
    if (pathname.startsWith("/collections/all-products")) return "/collections/all";

    // Collection pages
    if (pathname.startsWith("/collections/")) return pathname;

    // Cart
    if (pathname === "/cart") return "/cart";

    // Account (all nested routes preserved)
    if (pathname.startsWith("/account")) return pathname;

    // Search (query string handled separately by caller)
    if (pathname === "/search") return "/search";

    // Wishlist
    if (pathname.startsWith("/wishlist")) return "/wishlist";

    // Blog article: /blogs/:blogHandle/:articleHandle → /articles/:articleHandle
    if (pathname.startsWith("/blogs/")) {
        const parts = pathname.split("/").filter(Boolean);

        if (parts.length === 3) return `/articles/${parts[2]}`;
        return "/blogs";
    }

    if (pathname === "/blogs") return "/blogs";

    // All other routes (home, FAQ, policies, etc.) → home
    return "/home";
}

// =============================================================================
// INTERNAL LINK BUILDERS
// =============================================================================

/**
 * Build a deep-link URL for the given platform and in-app path.
 * @internal
 */
function buildDeepLink(appPath: string, platform: AppPlatform): string {
    // Strip leading slash for URI scheme (myapp://products/handle not myapp:///products/handle)
    const pathSegment = appPath.replace(/^\//, "");

    if (platform === "ios") {
        if (NATIVE_APP_CONFIG.universalLinkBase) {
            return `${NATIVE_APP_CONFIG.universalLinkBase}${appPath}`;
        }
        return `${NATIVE_APP_CONFIG.iosScheme}${pathSegment}`;
    }

    if (platform === "android") {
        return `${NATIVE_APP_CONFIG.androidScheme}${pathSegment}`;
    }

    return "/";
}

/**
 * Build the store redirect URL, encoding the in-app destination for deferred deep linking.
 *
 * Android: &referrer=deeplink%3D%2Fproducts%2Fslug
 *   The Play Store passes this to InstallReferrerClient on first app launch.
 *   The native app reads "deeplink" from the referrer to navigate on first open.
 *
 * iOS: No deferred deep link support via App Store URLs.
 *   Consider Branch.io or a custom redirect page if deferred deep links are required on iOS.
 *
 * @internal
 */
function buildStoreUrl(platform: AppPlatform, appPath: string): string {
    if (platform === "ios") {
        // App Store does not support referrer-based deferred deep links.
        return NATIVE_APP_CONFIG.appStoreUrl;
    }

    if (platform === "android") {
        try {
            const url = new URL(NATIVE_APP_CONFIG.playStoreUrl);
            // Encode destination as referrer param for first-launch deep link
            url.searchParams.set("referrer", `deeplink=${encodeURIComponent(appPath)}`);
            return url.toString();
        } catch {
            // Malformed playStoreUrl — fall back to unmodified URL
            return NATIVE_APP_CONFIG.playStoreUrl;
        }
    }

    return "/";
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Open the native app for the current page context.
 *
 * Flow:
 * 1. Detect platform — desktop returns immediately as "unsupported".
 * 2. Map web pathname → in-app path.
 * 3. iOS with Universal Links → navigate to universal link (OS handles everything).
 * 4. iOS/Android URI scheme → attempt open, watch for blur/visibilitychange, timeout to store.
 *
 * @param pathname - Current web pathname (window.location.pathname)
 * @param search   - Current query string (window.location.search), used for /search pages
 */
export async function openNativeApp(pathname: string, search = ""): Promise<OpenAppResult> {
    if (typeof window === "undefined") return {action: "unsupported"};

    const platform = detectPlatform();

    // Desktop: no native app — return immediately, banner is hidden anyway (md:hidden)
    if (platform === "desktop") return {action: "unsupported"};

    // Build in-app path; preserve search string for search pages
    let appPath = mapWebPathToAppPath(pathname);

    if (pathname === "/search" && search) {
        appPath += search;
    }

    // iOS with Universal Links configured → navigate directly.
    // The OS intercepts the navigation and opens the app, or falls back to Safari.
    // No JS timeout or detection required.
    if (platform === "ios" && NATIVE_APP_CONFIG.universalLinkBase) {
        window.location.href = buildDeepLink(appPath, platform);
        return {action: "opened"};
    }

    // URI scheme path: attempt open with timeout-based store fallback
    return openWithUriSchemeFallback(appPath, platform);
}

/**
 * Attempt to open the app via URI scheme.
 *
 * Detection relies on the browser becoming hidden/blurred when the OS switches
 * to the native app:
 *   - visibilitychange fires with document.hidden = true
 *   - window "blur" fires as the browser loses focus
 *
 * If neither event fires within 800ms, the app did not open → redirect to store.
 * 800ms is the standard industry timeout for this pattern.
 *
 * @internal
 */
function openWithUriSchemeFallback(appPath: string, platform: AppPlatform): Promise<OpenAppResult> {
    const deepLink = buildDeepLink(appPath, platform);
    const storeUrl = buildStoreUrl(platform, appPath);

    return new Promise(resolve => {
        let appOpened = false;
        let timer: ReturnType<typeof setTimeout>;

        const markOpened = () => {
            if (appOpened) return;
            appOpened = true;
            clearTimeout(timer);
            cleanup();
            resolve({action: "opened"});
        };

        const onVisibilityChange = () => {
            if (document.hidden) markOpened();
        };

        const onBlur = () => markOpened();

        const cleanup = () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("blur", onBlur);
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("blur", onBlur);

        // Attempt to launch the app
        window.location.href = deepLink;

        // Fallback: redirect to store if app doesn't open within 800ms
        timer = setTimeout(() => {
            if (!appOpened) {
                cleanup();
                window.location.href = storeUrl;
                resolve({action: "store_redirect"});
            }
        }, 800);
    });
}
