/**
 * @fileoverview Keyboard Shortcut Hook for Search Activation
 *
 * @description
 * Provides a global keyboard shortcut (Cmd+K / Ctrl+K) to quickly open the search
 * interface. This is a common UX pattern used by modern web applications and
 * developer tools. The hook should be mounted once at the app level to avoid
 * duplicate event listeners.
 *
 * @architecture
 * - Single global event listener for keydown events
 * - Platform-aware: Uses Meta key on Mac, Ctrl on Windows/Linux
 * - Integrates with Aside component system for search overlay
 * - Prevents default browser behavior (e.g., Chrome's bookmark search)
 *
 * @dependencies
 * - React useEffect hook
 * - Aside context (from ~/components/Aside)
 * - Browser keyboard event API
 * - navigator.platform for OS detection
 *
 * @related
 * - Aside.tsx - Provides open/close functionality
 * - FullScreenSearch.tsx - The search UI opened by this shortcut
 * - Header.tsx - Mounts this hook for global availability
 * - PageLayout.tsx - Alternative mounting location
 *
 * @accessibility
 * The keyboard shortcut provides an accessible way to access search
 * without mouse interaction. The shortcut label helper function
 * returns the appropriate symbol for the user's platform.
 *
 * @example
 * ```tsx
 * // Mount once at app level
 * function PageLayout() {
 *   useSearchKeyboard();
 *   return <main>...</main>;
 * }
 *
 * // Display shortcut hint to users
 * <button>
 *   Search <kbd>{getKeyboardShortcutLabel()}</kbd>
 * </button>
 * ```
 */

import {useEffect} from "react";
import {useAside} from "~/components/Aside";

// =============================================================================
// HOOK
// =============================================================================

/**
 * Registers a global keyboard shortcut (Cmd+K / Ctrl+K) to open the search overlay.
 *
 * Should be mounted ONCE at the app level (Header or PageLayout) to prevent
 * duplicate event listeners. Uses the Aside context to trigger search open.
 *
 * @sideeffect Adds and removes a global keydown event listener
 */
export function useSearchKeyboard() {
    const {open, type} = useAside();

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
            const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
            const modifier = isMac ? event.metaKey : event.ctrlKey;

            if (modifier && event.key.toLowerCase() === "k") {
                event.preventDefault();
                event.stopPropagation();

                // Toggle search: if already open, close it; otherwise open
                if (type === "search") {
                    // Let ESC handle closing, or do nothing
                    return;
                }

                open("search");
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, type]);
}

/**
 * Returns keyboard shortcut display based on platform.
 * @returns "⌘K" for Mac, "Ctrl+K" for others
 */
export function getKeyboardShortcutLabel(): string {
    // Guard against SSR where navigator or navigator.platform may be undefined
    if (typeof navigator === "undefined" || !navigator.platform) return "⌘K";
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    return isMac ? "⌘K" : "Ctrl+K";
}
