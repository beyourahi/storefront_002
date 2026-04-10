/**
 * @fileoverview Changelog Page
 *
 * @description
 * Public-facing changelog that surfaces the git commit history as user-friendly
 * product updates. Commits are fetched from GitHub, filtered, and transformed
 * into plain-language entries by Claude (Anthropic API), then cached in
 * Cloudflare Workers Cache for 1 hour with 1 hour stale-while-revalidate.
 *
 * @route GET /changelog
 * @route GET /changelog?cursor=30   (loads first 60 entries)
 * @route GET /changelog?cursor=60   (loads first 90 entries)
 *
 * @features
 * - Server-side rendering with Cloudflare Workers Cache
 * - Accumulative pagination via ?cursor query param
 * - Category filter + search (client-side, no extra requests)
 * - Graceful degradation: returns empty list on pipeline failure
 * - Response cache headers match internal cache TTL
 *
 * @security
 * - ANTHROPIC_API_KEY, GITHUB_TOKEN never appear in loader return values
 * - ChangelogEntry has no sha, author, files, or message fields
 * - New env vars are NOT prefixed PUBLIC_
 *
 * @related
 * - app/lib/changelog-pipeline.ts - Data pipeline (server-only)
 * - app/lib/types/changelog.ts - ChangelogEntry type
 * - app/components/changelog/ChangelogPage.tsx - Page layout
 */

import {data} from "react-router";
import type {Route} from "./+types/changelog";
import {getSeoMeta} from "@shopify/hydrogen";
import {ChangelogPage} from "~/components/changelog/ChangelogPage";
import {getChangelog} from "~/lib/changelog-pipeline";
import {buildCanonicalUrl, getBrandNameFromMatches, getSiteUrlFromMatches} from "~/lib/seo";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Number of entries displayed per "page" (accumulative) */
const PAGE_WINDOW = 30;

// =============================================================================
// META
// =============================================================================

export const meta: Route.MetaFunction = ({matches}) => {
    const brandName = getBrandNameFromMatches(matches);
    const siteUrl = getSiteUrlFromMatches(matches);

    return (
        getSeoMeta({
            title: "Changelog",
            titleTemplate: `%s | ${brandName}`,
            description: `What's new at ${brandName} — a running record of features, fixes, and improvements we've shipped.`,
            url: buildCanonicalUrl("/changelog", siteUrl)
        }) ?? []
    );
};

// =============================================================================
// LOADER
// =============================================================================

export async function loader({request, context}: Route.LoaderArgs) {
    return loadCriticalData({request, context});
}

async function loadCriticalData({request, context}: {request: Request; context: Route.LoaderArgs["context"]}) {
    const url = new URL(request.url);
    const cursor = Math.max(0, Number(url.searchParams.get("cursor") ?? 0) || 0);

    try {
        // waitUntil may be undefined in local Vite dev; fall back to a no-op
        const waitUntil = context.waitUntil ?? ((_p: Promise<unknown>) => void 0);
        const all = await getChangelog(context.env, waitUntil);

        // Accumulative slice: cursor=0 shows 0–29, cursor=30 shows 0–59, etc.
        const entries = all.slice(0, cursor + PAGE_WINDOW);
        const total = all.length;
        const hasMore = cursor + PAGE_WINDOW < total;
        const nextCursor = hasMore ? cursor + PAGE_WINDOW : null;

        return data(
            {entries, total, hasMore, nextCursor},
            {
                headers: {
                    "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600"
                }
            }
        );
    } catch {
        return {entries: [], total: 0, hasMore: false, nextCursor: null};
    }
}

// =============================================================================
// ROUTE COMPONENT
// =============================================================================

export default function Changelog({loaderData}: Route.ComponentProps) {
    return <ChangelogPage {...loaderData} />;
}

export {RouteErrorBoundary as ErrorBoundary} from "~/components/RouteErrorBoundary";
