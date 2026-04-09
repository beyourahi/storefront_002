/**
 * @fileoverview PWA Install/Open Button Component
 *
 * @description
 * Universal button for PWA installation and opening across all platforms. Intelligently
 * adapts behavior based on device platform, browser capabilities, and installation state.
 * Supports two display variants: desktop-fixed (bottom-right corner) and menu-item (navigation).
 *
 * @related
 * - ~/components/pwa/IosInstallInstructions - iOS manual installation guide
 * - ~/hooks/usePwaInstall - PWA install state and capabilities hook
 * - ~/components/Header - Renders menu-item variant in navigation
 */

import {useState} from "react";
import {Button} from "~/components/ui/button";
import {cn} from "~/lib/utils";
import {usePwaInstall} from "~/hooks/usePwaInstall";
import {IosInstallInstructions} from "./IosInstallInstructions";
import {Download} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface OpenInAppButtonProps {
    /** Button variant: desktop-fixed (bottom-right) or menu-item (in navigation) */
    variant?: "desktop-fixed" | "menu-item";
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * OpenInAppButton - Universal PWA install/open button.
 *
 * @param variant - Display variant: "desktop-fixed" or "menu-item" (default: "menu-item")
 *
 * @example
 * ```tsx
 * // In navigation menu
 * <OpenInAppButton variant="menu-item" />
 *
 * // Fixed bottom-right corner
 * <OpenInAppButton variant="desktop-fixed" />
 * ```
 */
export function OpenInAppButton({variant = "menu-item"}: OpenInAppButtonProps) {
    const {canInstall, isIOS, triggerInstall, appName, appIcon} = usePwaInstall();
    const [showIosInstructions, setShowIosInstructions] = useState(false);

    // =============================================================================
    // HANDLERS
    // =============================================================================

    /**
     * Handle install/open button click.
     * Platform and state adaptive behavior:
     * - iOS: Show manual instructions sheet
     * - Can install: Trigger native browser prompt
     * - Already installed: Reload to switch to PWA
     */
    const handleClick = async () => {
        // iOS Safari - show manual instructions
        if (isIOS) {
            setShowIosInstructions(true);
            return;
        }

        // Can install - trigger browser's install prompt
        if (canInstall) {
            await triggerInstall();
            return;
        }

        // Installed but in browser - try to open by reloading
        // On Chrome, this can trigger opening the installed PWA
        window.location.href = window.location.origin;
    };

    // =============================================================================
    // RENDER
    // =============================================================================

    const isFixed = variant === "desktop-fixed";
    const isMenuItem = variant === "menu-item";

    return (
        <>
            <Button
                onClick={() => void handleClick()}
                variant={isFixed ? "default" : "outline"}
                className={cn(
                    "gap-3",
                    // Fixed variant: visible on all screen sizes with safe-area bottom padding on mobile.
                    // z-40 on mobile sits below StickyMobileGetNow (z-50) on product pages — purchase
                    // CTA intentionally takes visual priority over the install prompt. z-[9999] on
                    // desktop matches the original behavior.
                    isFixed && [
                        "fixed right-4 md:right-6",
                        "bottom-[max(1rem,env(safe-area-inset-bottom))] md:bottom-6",
                        "z-40 md:z-[9999]",
                        "flex",
                        "animate-slide-up-fade opacity-0"
                    ],
                    // Menu item variant: full width on mobile, auto on desktop
                    isMenuItem && [
                        "w-full lg:w-auto",
                        "text-lg font-medium min-h-12",
                        "animate-slide-up-fade opacity-0"
                    ]
                )}
                style={
                    isMenuItem
                        ? {animationDelay: "400ms", animationFillMode: "both"}
                        : isFixed
                          ? {animationDelay: "800ms", animationFillMode: "both"}
                          : undefined
                }
            >
                <Download className="size-5" />
                <span>Open in App</span>
            </Button>

            {/* iOS Install Instructions Sheet */}
            <IosInstallInstructions
                open={showIosInstructions}
                onDismiss={() => setShowIosInstructions(false)}
                appName={appName}
                appIcon={appIcon}
            />
        </>
    );
}
