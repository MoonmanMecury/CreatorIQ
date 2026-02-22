import type { NormalizedItem, NewsItem } from './types'
import { extractKeywords } from './rssIngestion'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns N consecutive keywords from a title for near-duplicate detection.
 */
function getNGrams(keywords: string[], n: number): Set<string> {
    const ngrams = new Set<string>()
    for (let i = 0; i <= keywords.length - n; i++) {
        ngrams.add(keywords.slice(i, i + n).join(' '))
    }
    return ngrams
}

/**
 * Checks if two titles share `n` or more consecutive keywords.
 */
function sharesConsecutiveKeywords(kw1: string[], kw2: string[], n: number): boolean {
    const ngrams1 = getNGrams(kw1, n)
    const ngrams2 = getNGrams(kw2, n)
    for (const gram of ngrams1) {
        if (ngrams2.has(gram)) return true
    }
    return false
}

// ─── Deduplication ────────────────────────────────────────────────────────────

/**
 * Removes duplicate items using URL-hash dedup and near-duplicate title dedup.
 */
export function deduplicateItems(items: NormalizedItem[]): NormalizedItem[] {
    // Strategy 1: Exact URL / ID dedup — keep highest popularity per id
    // Tied popularity? Prefer a specific category over GENERAL
    const byId = new Map<string, NormalizedItem>()
    for (const item of items) {
        const existing = byId.get(item.id)
        if (!existing) {
            byId.set(item.id, item)
            continue
        }

        const currentIsSpecialized = item.category !== 'GENERAL'
        const existingIsSpecialized = existing.category !== 'GENERAL'

        if (item.popularity > existing.popularity) {
            byId.set(item.id, item)
            existing.duplicateCount++
        } else if (item.popularity === existing.popularity) {
            if (currentIsSpecialized && !existingIsSpecialized) {
                // Swap General for specialized
                byId.set(item.id, item)
            }
            existing.duplicateCount++
        } else {
            existing.duplicateCount++
        }
    }

    const uniqueById = Array.from(byId.values())

    // Strategy 2: Near-duplicate title dedup (NEWS only, within same category)
    // Group news items by category
    const newsItems = uniqueById.filter(i => i.source === 'NEWS') as NewsItem[]
    const nonNewsItems = uniqueById.filter(i => i.source !== 'NEWS')

    const keptNews: NewsItem[] = []

    for (const item of newsItems) {
        const itemKw = extractKeywords(item.title)
        let merged = false

        for (const kept of keptNews) {
            if (kept.category !== item.category) continue
            const keptKw = extractKeywords(kept.title)
            if (sharesConsecutiveKeywords(itemKw, keptKw, 4)) {
                // Same story — keep the higher popularity one
                if (item.popularity > kept.popularity) {
                    // Replace kept with current
                    const idx = keptNews.indexOf(kept)
                    keptNews[idx] = { ...item, duplicateCount: kept.duplicateCount + 1 }
                } else {
                    kept.duplicateCount++
                }
                merged = true
                break
            }
        }

        if (!merged) {
            keptNews.push({ ...item })
        }
    }

    return [...nonNewsItems, ...keptNews]
}

/**
 * Returns the number of items suppressed by deduplication.
 */
export function countDuplicatesSuppressed(
    original: NormalizedItem[],
    deduplicated: NormalizedItem[]
): number {
    return original.length - deduplicated.length
}
