/**
 * @fileoverview Product title component with two-part display support
 *
 * @description
 * Renders product titles with intelligent splitting - when a title contains " + ",
 * displays it as two separate lines with distinct visual hierarchy.
 *
 * @features
 * - Automatic title splitting by " + " delimiter
 * - Two-part visual hierarchy (primary + secondary)
 * - Responsive typography based on grid layout
 * - Semantic HTML (h3 elements for proper heading structure)
 * - Conditional rendering (second part only if exists)
 *
 * @usage_examples
 * // Simple title (no splitting)
 * <ProductTitle title="Organic Cotton T-Shirt" />
 *
 * // Two-part title (splits on " + ")
 * <ProductTitle title="Premium Hoodie + Free Tote Bag" />
 * // Renders:
 * // "Premium Hoodie" (larger, primary color)
 * // "Free Tote Bag" (smaller, muted color)
 *
 * @styling_rationale
 * - First part: Larger, primary color (text-foreground) - main product name
 * - Second part: Smaller, muted color (text-muted-foreground) - bonus/descriptor
 * - Font: font-sans font-medium for consistency with current ProductItem
 * - Responsive: Adjusts sizing based on grid column count (gridColumns prop)
 *
 * @related
 * - ProductItem.tsx - Main consumer of this component
 * - template-storefront ProductCardTitle.svelte - Original inspiration
 */

import {cn} from "~/lib/utils";
import type {GridColumns} from "~/lib/gridColumns";

interface ProductTitleProps {
    /** Full product title string (may contain " + " delimiter) */
    title: string;

    /**
     * Grid columns for dynamic font sizing.
     * - 2: Large fonts (spacious 2-column layout)
     * - 3: Medium fonts (balanced 3-column layout)
     * - 4: Smaller fonts (dense 4-column layout)
     * - undefined: Default sizing for pages without grid selector (carousels, related products)
     */
    gridColumns?: GridColumns;

    /**
     * Visual mode - card (vertical) or list (horizontal) or pdp (product detail page) or mobile-hero (mobile sticky hero) or cart (cart line item)
     * @default "card"
     */
    variant?: "card" | "list" | "pdp" | "mobile-hero" | "cart";

    /** Additional CSS classes for wrapper div */
    className?: string;

    /**
     * Compact mode - reduced font sizes and spacing
     * @default false
     */
    compactMode?: boolean;

    /**
     * Dark context mode - inverts colors for dark backgrounds (e.g., cart sheet)
     * Uses primary-foreground (light) instead of primary (dark) for text
     * @default false
     */
    darkContext?: boolean;
}

// =============================================================================
// PRODUCT TITLE
// =============================================================================

export function ProductTitle({
    title,
    gridColumns,
    variant = "card",
    className,
    compactMode = false,
    darkContext = false
}: ProductTitleProps) {
    // Split title by " + " delimiter
    // Trim to handle edge cases like "Product +  Bonus" (extra spaces)
    const parts = title.trim().split(" + ");

    // Only show second part if it exists and isn't empty after trimming
    const hasSecondPart = parts.length > 1 && parts[1] && parts[1].trim() !== "";

    // Get responsive font sizes
    const fontSizes = getFontSizes(gridColumns, variant, compactMode);

    // Mobile hero uses serif font and different text colors (white on coral background)
    // Dark context mode also uses inverted colors (for dark backgrounds like cart sheet)
    const isMobileHero = variant === "mobile-hero";
    const useLightText = isMobileHero || darkContext;
    const fontFamily = isMobileHero ? "font-serif" : "font-sans";
    const primaryColor = useLightText ? "text-primary-foreground" : "text-primary";
    const secondaryColor = useLightText ? "text-primary-foreground/70" : "text-muted-foreground opacity-75";

    // PDP variant uses negative margin to reduce gap between title parts
    const primaryMargin = variant === "pdp" ? "-mb-2" : "";

    return (
        <div className={cn(className)}>
            {/* Primary title part */}
            <h2
                className={cn(
                    fontFamily,
                    "font-medium leading-tight mb-0",
                    primaryColor,
                    fontSizes.primary,
                    primaryMargin
                )}
            >
                {parts[0]}
            </h2>

            {/* Secondary title part (conditional) */}
            {hasSecondPart && (
                <h2 className={cn(fontFamily, "font-medium leading-tight mb-2", secondaryColor, fontSizes.secondary)}>
                    {parts[1]}
                </h2>
            )}
        </div>
    );
}

// =============================================================================
// FONT SIZE CONFIGURATION
// =============================================================================

/**
 * Generate responsive font size classes based on grid columns and variant
 *
 * @param gridColumns - Grid column count (2-4 or undefined)
 * @param variant - Layout variant (card, list, pdp, mobile-hero, or cart)
 * @param compactMode - Use compact sizing
 * @returns Object with primary and secondary font size classes
 */
function getFontSizes(
    gridColumns: GridColumns | undefined,
    variant: "card" | "list" | "pdp" | "mobile-hero" | "cart",
    compactMode: boolean
) {
    // Compact mode - reduced sizes across all variants
    if (compactMode) {
        if (variant === "list") {
            return {
                primary: "text-base md:text-lg",
                secondary: "text-sm sm:text-sm"
            };
        }

        // Card compact mode
        return {
            primary: "text-sm md:text-base",
            secondary: "text-sm"
        };
    }

    // List variant - optimized for horizontal layout
    if (variant === "list") {
        return {
            primary: "text-lg md:text-xl 2xl:text-2xl",
            secondary: "text-sm sm:text-sm md:text-sm"
        };
    }

    // Cart variant - one scale down from list variant for cart line items
    // Primary: 16px → 18px → 20px (one scale smaller than list)
    // Secondary: 14px (same as list for consistency)
    if (variant === "cart") {
        return {
            primary: "text-base md:text-lg 2xl:text-xl",
            secondary: "text-sm sm:text-sm md:text-sm"
        };
    }

    // PDP variant - hero title sizing for product detail page
    // Primary: 32px → 40px → 48px → 56px → 64px (4xl → 5xl → 6xl → 7xl → 8xl)
    // Secondary: 20px → 24px → 28px → 32px → 36px (xl → 2xl → 3xl → 4xl → 5xl) - increased by one scale
    // Maintains ~60% size ratio between primary and secondary for visual hierarchy
    if (variant === "pdp") {
        return {
            primary: "text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl 3xl:text-8xl",
            secondary: "text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl"
        };
    }

    // Mobile hero variant - serif font, compact spacing, mobile-optimized sizing
    // Used in ProductHeroMobile sticky section with coral background
    // Primary: 36px (4xl) - matches original mobile hero title size
    // Secondary: 20px (xl) - proportional secondary size, readable but distinct
    if (variant === "mobile-hero") {
        return {
            primary: "text-4xl",
            secondary: "text-xl"
        };
    }

    // Card variant with grid-based sizing
    switch (gridColumns) {
        case 2:
            // 2-col: Larger fonts for spacious layout
            return {
                primary: "text-base md:text-lg xl:text-xl 3xl:text-2xl",
                secondary: "text-sm sm:text-sm md:text-sm lg:text-base"
            };
        case 3:
            // 3-col: Medium fonts for balanced layout (default)
            return {
                primary: "text-sm md:text-base lg:text-lg 2xl:text-xl",
                secondary: "text-sm sm:text-sm"
            };
        case 4:
            // 4-col: Smaller fonts for dense layout
            return {
                primary: "text-sm xl:text-base 2xl:text-lg 3xl:text-xl",
                secondary: "text-sm sm:text-sm"
            };
        case 1:
        case undefined:
        default:
            // Default sizing for carousels, related products (matches 2-col)
            return {
                primary: "text-base md:text-lg xl:text-xl 3xl:text-2xl",
                secondary: "text-sm sm:text-sm md:text-sm lg:text-base"
            };
    }
}
