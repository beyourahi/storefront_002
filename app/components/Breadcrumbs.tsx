/**
 * @fileoverview Reusable Breadcrumb Navigation Component
 *
 * @description
 * Renders an accessible breadcrumb trail with:
 * - Semantic `<nav aria-label="Breadcrumb">` wrapper
 * - Ordered list with `aria-current="page"` on the final item
 * - ChevronRight separators (hidden from assistive tech via `aria-hidden`)
 * - `motion-link` transition on clickable crumbs
 * - WCAG 2.5.5 compliant touch targets (min-h-11 = 44px)
 * - Truncation on the current (last) item for long titles
 *
 * Follows the same visual pattern used in the blog article breadcrumbs
 * (`routes/blogs.$blogHandle.$articleHandle.tsx`) for consistency.
 *
 * @usage
 * ```tsx
 * <Breadcrumbs
 *     items={[
 *         {label: "Home", href: "/"},
 *         {label: "Fragrances", href: "/collections/fragrances"},
 *         {label: "Amber Oud"}
 *     ]}
 * />
 * ```
 */

import {Link} from "react-router";
import {ChevronRight} from "lucide-react";
import {cn} from "~/lib/utils";

/**
 * A single breadcrumb entry. The last item (no `href`, or `href` ignored)
 * renders as static text with `aria-current="page"`.
 */
export interface BreadcrumbItem {
    /** Display label for this crumb */
    label: string;
    /** Navigation target. Omit for the current page (last item). */
    href?: string;
}

interface BreadcrumbsProps {
    /** Ordered breadcrumb items from root to current page */
    items: BreadcrumbItem[];
    /** Additional class names on the outer `<nav>` element */
    className?: string;
}

export function Breadcrumbs({items, className}: BreadcrumbsProps) {
    if (items.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className={cn("", className)}>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={item.href ?? item.label} className="flex items-center gap-1.5">
                            {/* Chevron separator — hidden from assistive tech */}
                            {index > 0 && (
                                <ChevronRight
                                    className="size-3.5 text-muted-foreground/50 shrink-0"
                                    aria-hidden="true"
                                />
                            )}

                            {/* Clickable link for all items except the last (current page) */}
                            {item.href && !isLast ? (
                                <Link
                                    to={item.href}
                                    className="motion-link hover:text-foreground min-h-11 inline-flex items-center"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className="text-foreground font-medium line-clamp-1"
                                    aria-current="page"
                                >
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
