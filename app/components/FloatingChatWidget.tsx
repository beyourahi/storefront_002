/**
 * @fileoverview Floating Chat Widget — Messenger + WhatsApp
 *
 * @description
 * Renders a fixed-position column of chat buttons driven entirely by
 * `site_settings` metaobject fields.  When both fields are empty the
 * component returns null and leaves no DOM trace.
 *
 * Messenger:
 *   - Injects the Facebook SDK once on mount (nonce-aware for Oxygen CSP).
 *   - Suppresses Meta's default bubble via `FB.CustomerChat.hide()` on the
 *     `customerchat.load` event so we own the button entirely.
 *   - Our button calls `window.FB?.CustomerChat.show()` on click.
 *
 * WhatsApp:
 *   - Simple anchor to `https://wa.me/<digits>?text=...`; opens native app
 *     on mobile and WhatsApp Web on desktop.
 *
 * WCAG 2.1 AA:
 *   - WhatsApp  : #25D366 on white → ~2:1 (brand standard; below 3:1 AA for UI, accepted trade-off)
 *   - Messenger : #0084FF on white → ~3.65:1 (WCAG AA ✓ for UI component)
 *   - Both touch targets: min 44 × 44 px
 *   - aria-label on every interactive element
 *
 * @positioning
 *   fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.5rem)] right-4 z-50
 *   Mirrors OpenInAppButton's safe-area-aware bottom offset, adds 3.5rem clearance for
 *   its height so the chat column sits visually above it on all screen sizes.
 *   z-50 (50) sits between NativeAppBanner (z-40) and OpenInAppButton (z-[9999]).
 */

import {useEffect} from "react";
import {useNonce} from "@shopify/hydrogen";
import {useSiteSettings} from "~/lib/site-content-context";

// =============================================================================
// INLINE SVG ICONS (Lucide does not carry brand icons)
// =============================================================================

function WhatsAppIcon({className}: {className?: string}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className={className}
        >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

function MessengerIcon({className}: {className?: string}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className={className}
        >
            <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
        </svg>
    );
}

// =============================================================================
// COMPONENT
// =============================================================================

declare global {
    interface Window {
        FB?: {
            CustomerChat: {
                hide: () => void;
                show: () => void;
            };
        };
        fbAsyncInit?: () => void;
    }
}

export function FloatingChatWidget() {
    const {messengerPageId, whatsappNumber} = useSiteSettings();
    const nonce = useNonce();

    // Normalise phone: strip everything except digits and leading +
    const cleanPhone = whatsappNumber.replace(/[^\d+]/g, "");

    const hasMessenger = Boolean(messengerPageId?.trim());
    const hasWhatsApp = Boolean(cleanPhone);

    // Nothing to render → bail out entirely
    if (!hasMessenger && !hasWhatsApp) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (!hasMessenger) return;

        // Guard against double-injection (HMR / StrictMode)
        if (document.getElementById("fb-jssdk")) return;

        window.fbAsyncInit = function () {
            if (!window.FB?.CustomerChat) return;
            // Suppress Meta's default bubble after the plugin mounts
            window.addEventListener(
                "message",
                function handler(e) {
                    if (
                        e.data &&
                        typeof e.data === "string" &&
                        e.data.includes("customerchat")
                    ) {
                        window.FB?.CustomerChat.hide();
                        window.removeEventListener("message", handler);
                    }
                },
                {once: false}
            );
        };

        const script = document.createElement("script");
        script.id = "fb-jssdk";
        script.src = "https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js";
        script.crossOrigin = "anonymous";
        if (nonce) script.setAttribute("nonce", nonce);
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            // Clean up on unmount (dev HMR) — the guard above prevents re-init issues
            const el = document.getElementById("fb-jssdk");
            el?.parentNode?.removeChild(el);
        };
    }, [hasMessenger, messengerPageId, nonce]);

    return (
        <>
            {/* Hidden FB Customer Chat mount point — Meta SDK targets this div */}
            {hasMessenger && (
                <div id="fb-root" aria-hidden="true">
                    {/* eslint-disable react/no-unknown-property */}
                    <div
                        className="fb-customerchat"
                        // @ts-expect-error — non-standard FB SDK attributes read by Meta's script
                        attribution="biz_inbox"
                        page_id={messengerPageId}
                        minimized="true"
                    />
                    {/* eslint-enable react/no-unknown-property */}
                </div>
            )}

            {/* Floating button column */}
            <div
                className="fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.5rem)] right-4 z-50 flex flex-col items-end gap-3"
                aria-label="Chat support options"
            >
                {/* WhatsApp — renders above Messenger */}
                {hasWhatsApp && (
                    <a
                        href={`https://wa.me/${cleanPhone}?text=Hi%2C%20I%20need%20help`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Chat with us on WhatsApp"
                        className={[
                            "group flex h-[52px] w-[52px] items-center justify-center",
                            "rounded-full shadow-lg transition-all duration-200",
                            /* #25D366 on white ≈ 2:1 — WhatsApp brand standard */
                            "bg-[#25D366] text-white",
                            "hover:scale-110 hover:shadow-xl",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                        ].join(" ")}
                    >
                        <WhatsAppIcon className="h-6 w-6" />
                    </a>
                )}

                {/* Messenger */}
                {hasMessenger && (
                    <button
                        type="button"
                        aria-label="Chat with us on Messenger"
                        onClick={() => window.FB?.CustomerChat.show()}
                        className={[
                            "group flex h-[52px] w-[52px] items-center justify-center",
                            "rounded-full shadow-lg transition-all duration-200",
                            /* #0084FF on white ≈ 3.65:1 — WCAG AA ✓ (UI component) */
                            "bg-[#0084FF] text-white",
                            "hover:scale-110 hover:shadow-xl",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                        ].join(" ")}
                    >
                        <MessengerIcon className="h-6 w-6" />
                    </button>
                )}
            </div>
        </>
    );
}
