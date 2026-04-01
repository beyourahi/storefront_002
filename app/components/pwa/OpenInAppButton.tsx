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
import {Download, Smartphone} from "lucide-react";

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
    const {canInstall, isIOS, isStandalone, isAppDetectedAsInstalled, triggerInstall, appName, appIcon} = usePwaInstall();
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

    /**
     * Standalone mode rendering.
     * - desktop-fixed: Hide completely (no floating indicator needed)
     * - menu-item: Show "You're in the app" text indicator
     */
    if (isStandalone) {
        // For desktop-fixed variant, hide completely in standalone (no need for floating indicator)
        if (variant === "desktop-fixed") return null;

        // For menu-item variant, show text indicator
        return (
            <div
                className={cn("flex items-center gap-3 text-primary/60", "animate-slide-up-fade opacity-0")}
                style={{animationDelay: "400ms", animationFillMode: "both"}}
            >
                <Smartphone className="size-5" />
                <span className="text-lg font-medium">You&apos;re in the app</span>
            </div>
        );
    }

    /**
     * Installability guard: only render when the PWA is actually installable.
     * The button is meaningful when at least one of these is true:
     * - canInstall: beforeinstallprompt fired (native install prompt available)
     * - isIOS: iOS Safari detected (manual "Add to Home Screen" instructions available)
     * - isAppDetectedAsInstalled: app was previously installed (deep-link back to PWA)
     * Without any of these, the button has no actionable behavior and should not render.
     */
    if (!canInstall && !isIOS && !isAppDetectedAsInstalled) return null;

    const isFixed = variant === "desktop-fixed";
    const isMenuItem = variant === "menu-item";

    return (
        <>
            <Button
                onClick={() => void handleClick()}
                variant={isFixed ? "default" : "outline"}
                className={cn(
                    "gap-3",
                    // Desktop fixed variant: bottom-right corner, hidden on mobile
                    isFixed && [
                        "fixed bottom-4 right-4 md:bottom-6 md:right-6",
                        "z-[9999]",
                        "hidden md:flex" // Only show on md+ screens
                    ],
                    // Menu item variant: full width on mobile, auto on desktop
                    isMenuItem && [
                        "w-full lg:w-auto",
                        "text-lg font-medium min-h-12",
                        "animate-slide-up-fade opacity-0"
                    ]
                )}
                style={isMenuItem ? {animationDelay: "400ms", animationFillMode: "both"} : undefined}
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
