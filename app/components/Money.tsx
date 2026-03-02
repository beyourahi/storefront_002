/**
 * @fileoverview Money formatting component with currency symbol
 *
 * @description
 * Lightweight wrapper around Shopify's useMoney hook that formats prices with
 * Bangladeshi Taka symbol (৳) and removes unnecessary decimal places and currency codes.
 *
 * @features
 * - Uses Shopify's useMoney hook for locale-aware formatting
 * - Displays Bangladeshi Taka symbol (৳) before amount
 * - Removes .00 decimals for cleaner display
 * - Strips currency codes (e.g., "BDT") from formatted amount
 * - Removes all whitespace for tight formatting
 * - Supports optional className for styling
 * - Handles any currency code (via MoneyV2 data)
 *
 * @props
 * - data: MoneyV2 object with amount and currencyCode
 * - className: Optional CSS classes
 *
 * @formatting
 * - Input: "100.00 BDT"
 * - Output: "৳100"
 * - Input: "99.99 BDT"
 * - Output: "৳99.99"
 *
 * @usage
 * ```tsx
 * <Money data={{amount: "100.00", currencyCode: "BDT"}} />
 * // Renders: ৳100
 *
 * <Money data={product.priceRange.minVariantPrice} className="font-bold" />
 * // Renders with custom styling
 * ```
 *
 * @dependencies
 * - useMoney: Shopify Hydrogen hook for money formatting
 *
 * @related
 * - ProductPrice.tsx - Price display with ranges and sales
 * - CartSummary.tsx - Cart totals
 * - AddToCartButton.tsx - Button price display
 */

import {useMoney} from "@shopify/hydrogen";
import type {MoneyData} from "types";
import {cn} from "~/lib/utils";

// =============================================================================
// MONEY FORMATTING COMPONENT
// =============================================================================

export function Money({data, className}: {data: MoneyData | null | undefined; className?: string}) {
    // Check if data is valid before using the hook
    const isValidData = !!(data?.amount && data?.currencyCode);

    // Fallback data for useMoney when input is invalid
    // useMoney must be called unconditionally (React hooks rule)
    const safeData = isValidData
        ? (data as Parameters<typeof useMoney>[0])
        : {amount: "0", currencyCode: "BDT" as const};

    const {amount} = useMoney(safeData);

    // Return N/A for invalid data after hook is called
    if (!isValidData) {
        return <span className={cn(className)}>N/A</span>;
    }

    // Remove .00 decimals for cleaner display
    // Also remove currency code and any whitespace
    const displayAmount = amount
        .replace(/\.00$/, "") // Remove .00 decimals
        .replace(/\s*[A-Z]{3}\s*$/, "") // Remove currency code (e.g., " BDT" or "BDT ")
        .trim(); // Remove any remaining whitespace

    return <span className={cn(className)}>৳{displayAmount}</span>;
}
