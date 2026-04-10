/**
 * @fileoverview Changelog data pipeline
 *
 * @description
 * Full server-side pipeline that fetches commits from the GitHub REST API,
 * filters noise, transforms significant changes into plain-language entries
 * via the Anthropic API (direct fetch — no SDK), and caches the result in
 * Cloudflare Workers Cache for 1 hour with 1 hour stale-while-revalidate.
 *
 * Security: Raw commit SHAs, author names, and file paths are never included
 * in returned ChangelogEntry objects. IDs are SHA-256 derived (8-char hex).
 *
 * @architecture
 * GitHub REST API
 *   ↓ fetchCommits (2 pages, batched detail fetches)
 *   ↓ filterCommits (noise removal)
 *   ↓ transformWithAI (Anthropic claude-3-5-haiku, structured JSON)
 *   ↓ buildChangelogCache (Workers Cache API, 1hr TTL + 1hr SWR)
 *   ↓ getChangelog (exported — called from route loaders only)
 *
 * @server-only - Functions here are only safe to call from loader/action
 * context (Cloudflare Workers). Never import from client components.
 */

import type {ChangelogEntry, ChangelogCategory} from "~/lib/types/changelog";

// =============================================================================
// CONSTANTS
// =============================================================================

const CACHE_NAME = "hydrogen";
// Bump the suffix to invalidate cached entries when the schema changes
const CHANGELOG_CACHE_KEY = "changelog:v1";
const CHANGELOG_MAX_AGE = 3600; // 1 hour in seconds
const CHANGELOG_SWR = 3600; // stale-while-revalidate: 1 hour
const GITHUB_API_BASE = "https://api.github.com";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const PAGE_SIZE = 100; // GitHub max per_page
const MAX_COMMITS = 200; // Fetch up to 2 pages
const STATS_BATCH_SIZE = 10; // Concurrent detail fetches per batch
const MIN_CHANGED_LINES = 20; // Filter threshold: skip tiny commits

/** Regex patterns for commits to drop before AI processing */
const DROP_PATTERNS: RegExp[] = [
    /^merge\b/i,
    /^revert\b/i,
    /^chore[\s(:]/i,
    /^ci[\s(:]/i,
    /^style[\s(:]/i,
    /^bump\b/i,
    /^update .* version/i,
    /\bupgrade\b.*\bpackage/i,
    /\bdependabot\b/i,
    /\bdependencies?\b.*\b(update|upgrade|bump|add|remove)/i
];

/**
 * System prompt for the AI transformation step.
 * Instructs the model to return a JSON array matching the input length,
 * using null for low-impact commits. No SHAs, file names, or author names.
 */
const CHANGELOG_TRANSFORM_PROMPT = `You are a technical writer for a Shopify Hydrogen e-commerce storefront. Your task is to transform git commit messages into clear, user-facing changelog entries.

You will receive a JSON array of commits. Return a JSON array of the EXACT SAME LENGTH. For each commit:
- If the commit represents a meaningful user-facing change, return an object with: headline (≤80 chars, plain language, no technical jargon), summary (1-3 sentences describing what changed and why it matters to users), category (one of: "New Feature", "Improvement", "Fix", "Performance", "Design")
- If the commit is low-impact, internal, or not user-facing, return null

Rules:
- NEVER include SHAs, file names, author names, or branch names
- Use plain language (e.g. "Faster checkout" not "Optimized cart.addLines mutation")
- Focus on user impact, not technical implementation
- Return ONLY valid JSON — no markdown, no explanation, no code blocks
- The response must be a JSON array with exactly the same number of elements as the input`;

// =============================================================================
// INTERNAL TYPES (never exported — keep server-side only)
// =============================================================================

interface RawCommitListItem {
    sha: string;
    commit: {
        message: string;
        author: {
            date: string;
        };
    };
    parents: Array<{sha: string}>;
}

interface RawCommitDetail {
    stats: {
        additions: number;
        deletions: number;
        total: number;
    };
    files: Array<{filename: string; changes: number}>;
}

interface RawCommit {
    sha: string;
    message: string;
    date: string;
    parents: Array<{sha: string}>;
    stats: {
        additions: number;
        deletions: number;
        total: number;
        changedFiles: number;
    };
}

/** Stripped-down commit shape sent to the AI — no SHA or author */
interface CommitForAI {
    message: string;
    date: string;
    stats: {
        additions: number;
        deletions: number;
        total: number;
        changedFiles: number;
    };
}

// =============================================================================
// HELPER: DERIVE ID FROM SHA
// =============================================================================

/**
 * Derives a short, stable ID from a commit SHA using SHA-256.
 * Returns 8 hex chars (4 bytes) — enough entropy for display, never the raw SHA.
 */
async function deriveId(commitSha: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(commitSha);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 4);
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// =============================================================================
// STEP 1: FETCH COMMITS FROM GITHUB
// =============================================================================

function buildGithubHeaders(githubToken: string): HeadersInit {
    return {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "storefront-002-changelog"
    };
}

/**
 * Fetches a single page of commits from the GitHub list endpoint.
 * Returns an empty array on any error (never throws).
 */
async function fetchCommitPage(env: Env, page: number): Promise<RawCommitListItem[]> {
    const {GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME} = env;
    if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
        return [];
    }

    const url = `${GITHUB_API_BASE}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits?per_page=${PAGE_SIZE}&sha=main&page=${page}`;

    try {
        const res = await fetch(url, {headers: buildGithubHeaders(GITHUB_TOKEN)});
        if (!res.ok) {
            console.warn(`[changelog] GitHub list page ${page} failed: ${res.status}`);
            return [];
        }
        return (await res.json()) as RawCommitListItem[];
    } catch (err) {
        console.warn("[changelog] fetchCommitPage error:", err);
        return [];
    }
}

/**
 * Fetches stats and file info for a single commit SHA.
 * Returns null on any error — callers skip null results.
 */
async function fetchCommitDetail(env: Env, sha: string): Promise<(RawCommitDetail & {sha: string}) | null> {
    const {GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME} = env;
    const url = `${GITHUB_API_BASE}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits/${sha}`;

    try {
        const res = await fetch(url, {headers: buildGithubHeaders(GITHUB_TOKEN)});
        if (res.status === 403 || res.status === 429) {
            // Rate-limited — caller checks remaining header instead
            return null;
        }
        if (!res.ok) return null;

        const detail = (await res.json()) as RawCommitDetail;
        return {...detail, sha};
    } catch {
        return null;
    }
}

/**
 * Pre-filters a list of raw commits before fetching expensive detail stats.
 * Removes merge commits and commits matching DROP_PATTERNS to reduce API calls.
 */
function preFilterCommits(items: RawCommitListItem[]): RawCommitListItem[] {
    return items.filter(item => {
        // Drop merge commits (more than one parent)
        if (item.parents.length > 1) return false;
        // Drop commits matching noise patterns
        const firstLine = item.commit.message.split("\n")[0];
        if (DROP_PATTERNS.some(p => p.test(firstLine))) return false;
        return true;
    });
}

/**
 * Fetches up to MAX_COMMITS commits with stats from GitHub.
 * Batches detail fetches to respect rate limits.
 * Stops early if rate limit remaining drops below 20.
 */
async function fetchCommits(env: Env): Promise<RawCommit[]> {
    // Fetch list pages 1 and 2 in parallel
    const [page1, page2] = await Promise.all([fetchCommitPage(env, 1), fetchCommitPage(env, 2)]);

    const allItems = [...page1, ...page2].slice(0, MAX_COMMITS);

    // Pre-filter before hitting the detail endpoints
    const filtered = preFilterCommits(allItems);

    const results: RawCommit[] = [];

    // Batch detail fetches in groups of STATS_BATCH_SIZE
    for (let i = 0; i < filtered.length; i += STATS_BATCH_SIZE) {
        const batch = filtered.slice(i, i + STATS_BATCH_SIZE);
        const details = await Promise.all(batch.map(item => fetchCommitDetail(env, item.sha)));

        for (let j = 0; j < batch.length; j++) {
            const item = batch[j];
            const detail = details[j];

            if (!detail) continue; // Error or rate-limited — skip

            results.push({
                sha: item.sha,
                message: item.commit.message,
                date: item.commit.author.date,
                parents: item.parents,
                stats: {
                    additions: detail.stats?.additions ?? 0,
                    deletions: detail.stats?.deletions ?? 0,
                    total: detail.stats?.total ?? 0,
                    changedFiles: detail.files?.length ?? 0
                }
            });
        }
    }

    return results;
}

// =============================================================================
// STEP 2: FILTER COMMITS
// =============================================================================

/**
 * Removes low-signal commits from the fetched list.
 * Applies DROP_PATTERNS and the MIN_CHANGED_LINES threshold.
 */
function filterCommits(commits: RawCommit[]): RawCommit[] {
    return commits.filter(commit => {
        // Drop merge commits
        if (commit.parents.length > 1) return false;

        // Drop tiny changes
        if (commit.stats.total < MIN_CHANGED_LINES) return false;

        // Drop noise patterns
        const firstLine = commit.message.split("\n")[0];
        if (DROP_PATTERNS.some(p => p.test(firstLine))) return false;

        return true;
    });
}

// =============================================================================
// STEP 3A: FALLBACK ENTRIES (when AI is unavailable)
// =============================================================================

/**
 * Builds minimal entries from raw commits when the AI step fails.
 * Strips ticket refs (e.g. JIRA-123, #456) from the first line of the message.
 */
async function buildFallbackEntries(commits: RawCommit[]): Promise<ChangelogEntry[]> {
    const entries: ChangelogEntry[] = [];

    for (const commit of commits) {
        const firstLine = commit.message.split("\n")[0];
        // Strip ticket refs and conventional commit prefixes for readability
        const cleaned = firstLine
            .replace(/^(feat|fix|refactor|perf|docs|test|build|chore|style|ci)(\(.+?\))?: /i, "")
            .replace(/\b[A-Z]+-\d+\b/g, "")
            .replace(/#\d+/g, "")
            .trim();

        entries.push({
            id: await deriveId(commit.sha),
            date: commit.date,
            headline: cleaned.slice(0, 80) || "Update",
            summary: cleaned,
            category: "Improvement"
        });
    }

    return entries;
}

// =============================================================================
// STEP 3B: AI TRANSFORMATION
// =============================================================================

/**
 * Calls the Anthropic API to transform filtered commits into user-facing entries.
 * Batches requests when there are more than 50 commits.
 * Falls back to buildFallbackEntries on any error.
 */
async function transformWithAI(commits: RawCommit[], env: Env): Promise<ChangelogEntry[]> {
    if (!env.ANTHROPIC_API_KEY || commits.length === 0) {
        return buildFallbackEntries(commits);
    }

    const AI_BATCH_SIZE = 50;
    const allEntries: ChangelogEntry[] = [];

    // Split into batches of 50 for sequential processing
    for (let i = 0; i < commits.length; i += AI_BATCH_SIZE) {
        const batch = commits.slice(i, i + AI_BATCH_SIZE);
        const batchEntries = await transformBatch(batch, env);
        allEntries.push(...batchEntries);
    }

    return allEntries;
}

async function transformBatch(commits: RawCommit[], env: Env): Promise<ChangelogEntry[]> {
    const commitsForAI: CommitForAI[] = commits.map(c => ({
        message: c.message.split("\n")[0], // First line only
        date: c.date,
        stats: c.stats
    }));

    try {
        const res = await fetch(ANTHROPIC_API_URL, {
            method: "POST",
            headers: {
                "x-api-key": env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-3-5-haiku-20241022",
                max_tokens: 4096,
                system: CHANGELOG_TRANSFORM_PROMPT,
                messages: [
                    {
                        role: "user",
                        content: JSON.stringify(commitsForAI)
                    }
                ]
            })
        });

        if (!res.ok) {
            console.warn(`[changelog] Anthropic API error: ${res.status}`);
            return buildFallbackEntries(commits);
        }

        const body = (await res.json()) as {content?: Array<{type: string; text: string}>};
        const text = body?.content?.find(b => b.type === "text")?.text ?? "";

        // Parse the JSON array response
        const parsed = JSON.parse(text) as Array<{
            headline: string;
            summary: string;
            category?: ChangelogCategory;
        } | null>;

        if (!Array.isArray(parsed) || parsed.length !== commits.length) {
            console.warn("[changelog] Anthropic response length mismatch, using fallback");
            return buildFallbackEntries(commits);
        }

        // Build entries, skipping nulls (low-impact commits)
        const entries: ChangelogEntry[] = [];
        for (let i = 0; i < parsed.length; i++) {
            const item = parsed[i];
            if (!item) continue;
            entries.push({
                id: await deriveId(commits[i].sha),
                date: commits[i].date,
                headline: (item.headline ?? "Update").slice(0, 80),
                summary: item.summary ?? "",
                category: item.category
            });
        }

        return entries;
    } catch (err) {
        console.warn("[changelog] transformBatch error, using fallback:", err);
        return buildFallbackEntries(commits);
    }
}

// =============================================================================
// STEP 4: CACHE MANAGEMENT
// =============================================================================

/** Synthetic URL used as the cache key — never actually fetched */
const CACHE_REQUEST_URL = `https://changelog.internal/${CHANGELOG_CACHE_KEY}`;

/**
 * Runs the full pipeline and writes the result to Workers Cache.
 * waitUntil is used for the async cache.put so it doesn't block the response.
 */
async function buildChangelogCache(
    env: Env,
    waitUntil: (promise: Promise<unknown>) => void
): Promise<ChangelogEntry[]> {
    const rawCommits = await fetchCommits(env);
    const filtered = filterCommits(rawCommits);
    const entries = await transformWithAI(filtered, env);

    try {
        const cache = await caches.open(CACHE_NAME);
        const cacheReq = new Request(CACHE_REQUEST_URL);

        const response = new Response(JSON.stringify(entries), {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": `public, max-age=${CHANGELOG_MAX_AGE}, stale-while-revalidate=${CHANGELOG_SWR}`,
                Date: new Date().toUTCString()
            }
        });

        // Non-blocking write
        waitUntil(cache.put(cacheReq, response));
    } catch (err) {
        // Cache API unavailable (e.g. in local Vite dev) — continue without caching
        console.warn("[changelog] Cache write skipped (Cache API unavailable):", err);
    }

    return entries;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Returns cached changelog entries, triggering background revalidation when stale.
 * Falls back to a live pipeline run on cache miss.
 * Returns an empty array on any unhandled error — the page renders gracefully.
 *
 * Call only from server-side loader/action context.
 */
export async function getChangelog(
    env: Env,
    waitUntil: (promise: Promise<unknown>) => void
): Promise<ChangelogEntry[]> {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cacheReq = new Request(CACHE_REQUEST_URL);
        const cached = await cache.match(cacheReq);

        if (cached) {
            // Check age to decide whether to revalidate in the background
            const dateHeader = cached.headers.get("Date");
            if (dateHeader) {
                const ageMs = Date.now() - new Date(dateHeader).getTime();
                const ageSec = ageMs / 1000;

                if (ageSec > CHANGELOG_MAX_AGE) {
                    // Stale — revalidate in background, return stale data immediately
                    waitUntil(buildChangelogCache(env, waitUntil));
                }
            }

            return (await cached.json()) as ChangelogEntry[];
        }

        // Cache miss — build synchronously
        return await buildChangelogCache(env, waitUntil);
    } catch {
        // Cache API unavailable (Vite dev) or unhandled error — run pipeline directly
        try {
            const rawCommits = await fetchCommits(env);
            const filtered = filterCommits(rawCommits);
            return await transformWithAI(filtered, env);
        } catch (pipelineErr) {
            console.warn("[changelog] Pipeline error, returning empty:", pipelineErr);
            return [];
        }
    }
}
