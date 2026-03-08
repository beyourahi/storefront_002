import {useContext, useEffect, useRef, useState} from "react";
import {UNSAFE_ViewTransitionContext, useNavigationType} from "react-router";

export type NavigationDirection = "forward" | "backward" | "neutral";
export type PageTransitionMode = "native" | "fallback" | "reduced";
type NavigationAction = "POP" | "PUSH" | "REPLACE";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function getHistoryIndex() {
    if (typeof window === "undefined") return null;

    const historyState = window.history.state as {idx?: unknown} | null;
    return typeof historyState?.idx === "number" ? historyState.idx : null;
}

function isNativeViewTransitionSupported() {
    return typeof document !== "undefined" && typeof document.startViewTransition === "function";
}

function setDocumentTransitionDirection(direction: NavigationDirection) {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.transition = direction;
}

function setDocumentTransitionMode({
    mode,
    nativeViewTransitionsEnabled
}: {
    mode: PageTransitionMode;
    nativeViewTransitionsEnabled: boolean;
}) {
    if (typeof document === "undefined") return;

    document.documentElement.dataset.pageTransitionMode = mode;
    document.documentElement.dataset.nativeViewTransitions = nativeViewTransitionsEnabled ? "enabled" : "disabled";
}

export function resolveNavigationDirection({
    navigationType,
    previousIndex,
    nextIndex
}: {
    navigationType: NavigationAction;
    previousIndex: number | null;
    nextIndex: number | null;
}): NavigationDirection {
    if (navigationType === "REPLACE") return "neutral";
    if (navigationType === "PUSH") return "forward";
    if (navigationType !== "POP") return "neutral";
    if (previousIndex == null || nextIndex == null || previousIndex === nextIndex) return "neutral";

    return nextIndex < previousIndex ? "backward" : "forward";
}

export function usePageTransitionRuntime() {
    const viewTransitionState = useContext(UNSAFE_ViewTransitionContext);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
        const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

        handleChange();
        mediaQuery.addEventListener("change", handleChange);

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const nativeViewTransitionsEnabled = isNativeViewTransitionSupported() && !prefersReducedMotion;
    const nativeTransitionActive = nativeViewTransitionsEnabled && viewTransitionState.isTransitioning;
    const pageTransitionMode: PageTransitionMode = prefersReducedMotion
        ? "reduced"
        : nativeTransitionActive
          ? "native"
          : "fallback";

    return {
        nativeTransitionActive,
        nativeViewTransitionsEnabled,
        pageTransitionMode,
        prefersReducedMotion,
        shouldAnimateFallbackTransition: !prefersReducedMotion && !nativeTransitionActive
    };
}

export function usePageTransitionOrchestrator() {
    const navigationType = useNavigationType() as NavigationAction;
    const runtime = usePageTransitionRuntime();
    const previousIndexRef = useRef<number | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        previousIndexRef.current = getHistoryIndex();

        const handlePopState = () => {
            const nextIndex = getHistoryIndex();
            const direction = resolveNavigationDirection({
                navigationType: "POP",
                previousIndex: previousIndexRef.current,
                nextIndex
            });

            setDocumentTransitionDirection(direction);
        };

        const handleDocumentClickCapture = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0) return;
            if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;

            const target = event.target;
            if (!(target instanceof Element)) return;

            const anchor = target.closest("a[href]");
            if (!(anchor instanceof HTMLAnchorElement)) return;
            if (anchor.target && anchor.target !== "_self") return;
            if (anchor.hasAttribute("download")) return;

            const url = new URL(anchor.href, window.location.href);
            if (url.origin !== window.location.origin) return;

            const isHashOnlyNavigation =
                url.pathname === window.location.pathname &&
                url.search === window.location.search &&
                url.hash !== window.location.hash;

            if (isHashOnlyNavigation) return;

            setDocumentTransitionDirection("forward");
        };

        window.addEventListener("popstate", handlePopState);
        document.addEventListener("click", handleDocumentClickCapture, true);

        return () => {
            window.removeEventListener("popstate", handlePopState);
            document.removeEventListener("click", handleDocumentClickCapture, true);
        };
    }, []);

    const direction = resolveNavigationDirection({
        navigationType,
        previousIndex: previousIndexRef.current,
        nextIndex: getHistoryIndex()
    });

    useEffect(() => {
        setDocumentTransitionDirection(direction);
        setDocumentTransitionMode({
            mode: runtime.pageTransitionMode,
            nativeViewTransitionsEnabled: runtime.nativeViewTransitionsEnabled
        });

        previousIndexRef.current = getHistoryIndex();
    }, [direction, runtime.nativeViewTransitionsEnabled, runtime.pageTransitionMode]);

    return {
        ...runtime,
        direction
    };
}
