import type {
    NormalizedItem,
    NewsItem,
    YouTubeItem,
    TrendCluster,
    TrendMomentum,
    TrendCategory,
    SynthesizerConfig,
} from './types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateClusterId(): string {
    return `cluster-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Checks if two items share 2+ keywords OR share a named entity (capitalised, 5+ chars).
 */
function areSimilar(a: NormalizedItem, b: NormalizedItem): boolean {
    // Keyword overlap check
    const kw1 = new Set(a.keywords)
    let shared = 0
    for (const kw of b.keywords) {
        if (kw1.has(kw)) shared++
    }
    if (shared >= 2) return true

    // Named entity check — capitalised words 5+ chars present in both titles
    const namedEntities1 = extractNamedEntities(a.title)
    const namedEntities2 = new Set(extractNamedEntities(b.title))
    for (const entity of namedEntities1) {
        if (namedEntities2.has(entity)) return true
    }

    return false
}

function extractNamedEntities(text: string): string[] {
    return text
        .split(/\s+/)
        .filter(w => w.length >= 5 && /^[A-Z]/.test(w))
        .map(w => w.toLowerCase().replace(/[^a-z]/g, ''))
}

/**
 * Returns the most common keyword across all items in a cluster.
 */
function getMostCommonKeyword(items: NormalizedItem[]): string {
    const freq = new Map<string, number>()
    for (const item of items) {
        for (const kw of item.keywords) {
            freq.set(kw, (freq.get(kw) ?? 0) + 1)
        }
    }
    let topKw = ''
    let topCount = 0
    for (const [kw, count] of freq.entries()) {
        if (count > topCount) {
            topCount = count
            topKw = kw
        }
    }
    return topKw ? topKw.charAt(0).toUpperCase() + topKw.slice(1) : 'General'
}

/**
 * Finds a named entity that appears in >= 50% of items in the cluster.
 */
function findDominantEntity(items: NormalizedItem[]): string | null {
    const entityFreq = new Map<string, number>()
    for (const item of items) {
        for (const entity of extractNamedEntities(item.title)) {
            entityFreq.set(entity, (entityFreq.get(entity) ?? 0) + 1)
        }
    }
    const threshold = items.length * 0.5
    for (const [entity, count] of entityFreq.entries()) {
        if (count >= threshold && entity.length >= 5) {
            return entity.charAt(0).toUpperCase() + entity.slice(1)
        }
    }
    return null
}

/**
 * Computes sorted, deduplicated keywords across all cluster items by frequency.
 */
function mergeKeywords(items: NormalizedItem[]): string[] {
    const freq = new Map<string, number>()
    for (const item of items) {
        for (const kw of item.keywords) {
            freq.set(kw, (freq.get(kw) ?? 0) + 1)
        }
    }
    return Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([kw]) => kw)
}

/**
 * Counts unique publisher names across news items.
 */
function countPublishers(newsItems: NewsItem[]): number {
    return new Set(newsItems.map(n => n.publisherName)).size
}

/**
 * Determines the dominant category within a cluster by vote.
 */
function dominantCategory(items: NormalizedItem[]): TrendCategory {
    const weights = new Map<TrendCategory, number>()

    for (const item of items) {
        // Give 2x weight to specialized categories to prevent GENERAL from "swallowing" them
        const weight = item.category === 'GENERAL' ? 1 : 2
        weights.set(item.category, (weights.get(item.category) ?? 0) + weight)
    }

    const entries = Array.from(weights.entries())
    if (entries.length === 0) return 'GENERAL'

    // Sort by weighted frequency descending, then by non-GENERAL priority
    entries.sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1]
        if (a[0] === 'GENERAL') return 1
        if (b[0] === 'GENERAL') return -1
        return 0
    })

    return entries[0][0]
}

// ─── Clustering ───────────────────────────────────────────────────────────────

/**
 * Groups normalized items into TrendClusters using greedy keyword + entity matching.
 */
export function clusterItems(
    items: NormalizedItem[],
    config: SynthesizerConfig
): TrendCluster[] {
    // Step 1 — Sort by popularity descending
    const sorted = [...items].sort((a, b) => b.popularity - a.popularity)

    // Step 2 — Greedy clustering
    const groups: NormalizedItem[][] = []

    for (const item of sorted) {
        let placed = false
        for (const group of groups) {
            // Check similarity against the seed (first item) and a few sampled members
            const seed = group[0]
            if (areSimilar(item, seed)) {
                group.push(item)
                placed = true
                break
            }
        }
        if (!placed) {
            groups.push([item])
        }
    }

    // Step 3 — Filter small clusters (unless single item with popularity > 0.8)
    const filtered = groups.filter(
        g => g.length >= config.minItemsPerCluster || (g.length === 1 && g[0].popularity > 0.8)
    )

    // Step 4 — Assemble TrendCluster objects
    const now = Date.now()
    const clusters: TrendCluster[] = filtered.map(group => {
        const newsItems = group.filter(i => i.source === 'NEWS') as NewsItem[]
        const youtubeItems = group.filter(i => i.source === 'YOUTUBE') as YouTubeItem[]
        const allItems = group

        // Timestamps
        const timestamps = allItems.map(i => new Date(i.publishedAt).getTime())
        const firstSeenAt = new Date(Math.min(...timestamps)).toISOString()
        const lastSeenAt = new Date(Math.max(...timestamps)).toISOString()
        const firstSeenHoursAgo = (now - Math.min(...timestamps)) / (1000 * 60 * 60)

        // Velocity from YouTube
        const ytVelocityScore = youtubeItems.length > 0
            ? Math.min(
                youtubeItems.reduce((sum, y) => sum + y.viewsPerHour, 0) / youtubeItems.length / 10000,
                1
            )
            : allItems.reduce((sum, i) => sum + i.popularity, 0) / allItems.length

        // Source mix
        const newsCount = newsItems.length
        const youtubeCount = youtubeItems.length
        const totalItems = allItems.length
        const newsRatio = newsCount / totalItems

        // Scores
        const avgPopularity = allItems.reduce((s, i) => s + i.popularity, 0) / allItems.length
        const sourcesMixBonus = newsCount > 0 && youtubeCount > 0 ? 1.0 : 0.5
        const recencyBonus = firstSeenHoursAgo < 12 ? 0.1 : 0
        const clusterScore = Math.min(
            avgPopularity * 0.4 + ytVelocityScore * 0.3 + sourcesMixBonus * 0.2 + recencyBonus,
            1
        )

        // Momentum
        let momentum: TrendMomentum
        if (firstSeenHoursAgo < 6) momentum = 'EMERGING'
        else if (firstSeenHoursAgo < 24) momentum = 'RISING'
        else if (clusterScore > 0.7) momentum = 'PEAK'
        else momentum = 'DECLINING'

        // Trending probability
        const trendingProbability = Math.min(
            clusterScore * 0.5 + ytVelocityScore * 0.3 + (firstSeenHoursAgo < 12 ? 0.2 : 0),
            1
        )

        // Topic label
        const dominantEntity = findDominantEntity(allItems)
        const topic = dominantEntity ?? getMostCommonKeyword(allItems)

        // Keywords
        const keywords = mergeKeywords(allItems)

        return {
            clusterId: generateClusterId(),
            topic,
            category: dominantCategory(allItems),
            clusterScore,
            momentum,
            items: allItems,
            newsItems,
            youtubeItems,
            totalItems,
            firstSeenAt,
            firstSeenHoursAgo,
            lastSeenAt,
            publisherCount: countPublishers(newsItems),
            velocityScore: ytVelocityScore,
            sourcesMix: { newsCount, youtubeCount, newsRatio },
            keywords,
            trendingProbability,
        }
    })

    // Sort by clusterScore descending
    return clusters.sort((a, b) => b.clusterScore - a.clusterScore)
}
