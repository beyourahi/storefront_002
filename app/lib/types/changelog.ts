/**
 * @fileoverview Changelog type definitions
 *
 * @description
 * Shared types for the changelog feature. ChangelogEntry contains only
 * user-facing fields — raw commit SHAs, author names, and file paths are
 * never included (security boundary enforced at pipeline level).
 */

export type ChangelogCategory =
    | "New Feature"
    | "Improvement"
    | "Fix"
    | "Performance"
    | "Design";

/**
 * A single user-facing changelog entry.
 * id is an 8-char hex derived from SHA-256(commitSha) — NOT the raw git SHA.
 */
export type ChangelogEntry = {
    id: string;
    date: string; // ISO 8601
    headline: string; // ≤80 chars, plain language
    summary: string; // 1–3 sentences, user-facing
    category?: ChangelogCategory;
};

export type ChangelogLoaderData = {
    entries: ChangelogEntry[];
    total: number;
    hasMore: boolean;
    nextCursor: number | null;
};
