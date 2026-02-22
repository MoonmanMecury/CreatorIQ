import type { NewsItem, RssFeedConfig, SynthesizerConfig, TrendCategory } from './types'
import { RSS_FEEDS } from './feedConfig'

// ─── Stop Words ───────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'not', 'this', 'that', 'it',
])

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts meaningful keywords from a text string.
 */
export function extractKeywords(text: string): string[] {
    const words = text
        .toLowerCase()
        .split(/\s+/)
        .map(w => w.replace(/[^a-z0-9]/g, ''))
        .filter(w => w.length >= 4 && !STOP_WORDS.has(w))

    // Deduplicate preserving order
    const seen = new Set<string>()
    const unique: string[] = []
    for (const w of words) {
        if (!seen.has(w)) {
            seen.add(w)
            unique.push(w)
        }
    }
    return unique.slice(0, 10)
}

/**
 * Strips HTML tags from a string.
 */
function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Calculates a recency-based popularity score.
 */
function recencyScore(publishedAt: string): number {
    const hoursAgo = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60)
    if (hoursAgo < 1) return 1.0
    if (hoursAgo < 6) return 0.8
    if (hoursAgo < 24) return 0.6
    if (hoursAgo < 48) return 0.3
    return 0.1
}

/**
 * Parses a PubDate string safely to ISO format.
 */
function parsePubDate(raw: string): string {
    try {
        return new Date(raw).toISOString()
    } catch {
        return new Date().toISOString()
    }
}

/**
 * Creates a short ID from a URL.
 */
function urlToId(url: string): string {
    try {
        return btoa(url).replace(/=/g, '').slice(0, 32)
    } catch {
        // btoa can fail on non-latin chars — fall back to a simple hash
        let hash = 0
        for (let i = 0; i < url.length; i++) {
            hash = ((hash << 5) - hash) + url.charCodeAt(i)
            hash |= 0
        }
        return `id${Math.abs(hash).toString(16).padStart(30, '0').slice(0, 30)}`
    }
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Fetches and parses a single RSS feed. Returns NewsItem[].
 */
export async function fetchRssFeed(feed: RssFeedConfig): Promise<NewsItem[]> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    let xmlText: string
    try {
        const res = await fetch(feed.url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'CreatorIQ-Trend-Synthesizer/1.0' },
        })
        if (!res.ok) {
            console.warn(`[RSS] Feed "${feed.label}" returned ${res.status}`)
            return []
        }
        xmlText = await res.text()
    } catch (err) {
        console.warn(`[RSS] Failed to fetch "${feed.label}":`, err)
        return []
    } finally {
        clearTimeout(timeout)
    }

    // Parse XML — server-side (Node) safe via JSDOM-like approach using regex
    // We use DOMParser on the client, but in Next.js server components we parse with regex
    const items: NewsItem[] = []

    // Extract all <item> blocks
    const itemPattern = /<item>([\s\S]*?)<\/item>/g
    let match: RegExpExecArray | null

    while ((match = itemPattern.exec(xmlText)) !== null) {
        const block = match[1]

        try {
            const title = extractTag(block, 'title')
            const link = extractTag(block, 'link') || extractTag(block, 'guid')
            const description = extractTag(block, 'description') || ''
            const pubDate = extractTag(block, 'pubDate') || new Date().toUTCString()
            const sourceText = extractTagAttr(block, 'source') || feed.label

            if (!title || !link) continue

            const publishedAt = parsePubDate(pubDate)
            const cleanDescription = stripHtml(description)
            const summary = cleanDescription.slice(0, 200)
            const combinedText = `${title} ${summary}`
            const keywords = extractKeywords(combinedText)
            const id = urlToId(link)
            const popularity = recencyScore(publishedAt)

            items.push({
                id,
                source: 'NEWS',
                title: stripHtml(title),
                summary,
                url: link,
                publishedAt,
                popularity,
                topic: keywords[0] ?? feed.label,
                category: feed.category as TrendCategory,
                keywords,
                publisherName: stripHtml(sourceText),
                feedCategory: feed.category,
                duplicateCount: 0,
            })
        } catch (err) {
            console.warn('[RSS] Skipping malformed item:', err)
        }
    }

    return items
}

/**
 * Fetches all RSS_FEEDS in parallel. Returns all successfully fetched items.
 */
export async function fetchAllFeeds(config: SynthesizerConfig): Promise<NewsItem[]> {
    // Calculate cutoff for clusteringWindowHours
    const cutoff = Date.now() - config.clusteringWindowHours * 60 * 60 * 1000

    const results = await Promise.allSettled(RSS_FEEDS.map(feed => fetchRssFeed(feed)))

    const allItems: NewsItem[] = []
    for (const result of results) {
        if (result.status === 'fulfilled') {
            // Filter items outside the clustering window
            const withinWindow = result.value.filter(
                item => new Date(item.publishedAt).getTime() >= cutoff
            )
            allItems.push(...withinWindow)
        } else {
            console.warn('[RSS] A feed fetch was rejected:', result.reason)
        }
    }

    return allItems
}

// ─── XML Parsing Helpers ──────────────────────────────────────────────────────

function extractTag(block: string, tag: string): string {
    // Handle CDATA
    const cdataPattern = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i')
    const cdataMatch = cdataPattern.exec(block)
    if (cdataMatch) return cdataMatch[1].trim()

    const plainPattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
    const plainMatch = plainPattern.exec(block)
    if (plainMatch) return plainMatch[1].trim()

    // For self-closing link tags (some feeds use <link>url</link>)
    const selfClose = new RegExp(`<${tag}\\s*/>`, 'i')
    if (selfClose.test(block)) return ''

    return ''
}

function extractTagAttr(block: string, tag: string): string {
    // Prefer text content, fall back to attributes
    const textResult = extractTag(block, tag)
    if (textResult) return textResult

    // Try to get URL attribute
    const attrPattern = new RegExp(`<${tag}[^>]+url="([^"]+)"`, 'i')
    const attrMatch = attrPattern.exec(block)
    return attrMatch ? attrMatch[1] : ''
}
