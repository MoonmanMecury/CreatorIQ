import type { SynthesisResult, SynthesizerConfig, TrendCategory, ClusterSummary, NewsItem } from './types'
import { DEFAULT_CONFIG } from './feedConfig'
import { fetchAllFeeds } from './rssIngestion'
import { fetchYouTubeTrendingForTopics } from './youtubeIngestion'
import { deduplicateItems, countDuplicatesSuppressed } from './deduplication'
import { clusterItems } from './clustering'
import { synthesizeClusters, rankAndFilterSummaries } from './synthesis'
import { enhanceWithLLM } from '@/features/conductor/conductorService'
import { buildSynthesizerContext } from '@/features/conductor/contextBuilder'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts the top N keywords by frequency, preserving their dominant category.
 */
function extractTopTopics(items: NewsItem[], topN: number): { keyword: string, category: TrendCategory }[] {
    const freq = new Map<string, { count: number, categories: Map<TrendCategory, number> }>()
    for (const item of items) {
        for (const kw of item.keywords) {
            const entry = freq.get(kw) || { count: 0, categories: new Map() }
            entry.count++
            entry.categories.set(item.category, (entry.categories.get(item.category) ?? 0) + 1)
            freq.set(kw, entry)
        }
    }

    return Array.from(freq.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, topN)
        .map(([kw, entry]) => {
            // Find dominant category for this topic
            let dominantCat: TrendCategory = 'GENERAL'
            let maxCount = -1
            for (const [cat, count] of entry.categories.entries()) {
                if (count > maxCount || (count === maxCount && cat !== 'GENERAL')) {
                    maxCount = count
                    dominantCat = cat
                }
            }
            return { keyword: kw, category: dominantCat }
        })
}

function groupByCategory(summaries: ClusterSummary[]): Record<TrendCategory, ClusterSummary[]> {
    const result: Record<TrendCategory, ClusterSummary[]> = {
        TECHNOLOGY: [],
        BUSINESS: [],
        POLITICS: [],
        HEALTH: [],
        SCIENCE: [],
        ENTERTAINMENT: [],
        SPORTS: [],
        GENERAL: [],
    }
    for (const s of summaries) {
        result[s.category].push(s)
    }
    return result
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

/**
 * Runs the full News + YouTube Trend Synthesizer pipeline.
 * Never throws — partial failures return available data.
 */
export async function runSynthesizerPipeline(
    configOverride?: Partial<SynthesizerConfig>
): Promise<SynthesisResult> {
    const startTime = Date.now()
    const config: SynthesizerConfig = { ...DEFAULT_CONFIG, ...configOverride }

    let newsItemsFetched = 0
    let youtubeItemsFetched = 0
    let duplicatesSuppressed = 0

    // 1. Fetch all RSS feeds
    let newsItems = await fetchAllFeeds(config).catch(err => {
        console.error('[Pipeline] fetchAllFeeds failed:', err)
        return []
    })
    newsItemsFetched = newsItems.length

    // 2. Extract top topics for YouTube search (preserving category)
    const topTopics = extractTopTopics(newsItems, 15)

    // 3. Fetch YouTube trending for those topics
    let youtubeItems = await fetchYouTubeTrendingForTopics(topTopics, config).catch(err => {
        console.error('[Pipeline] fetchYouTubeTrendingForTopics failed:', err)
        return []
    })
    youtubeItemsFetched = youtubeItems.length

    // 4. Merge all items
    const allItems = [...newsItems, ...youtubeItems]

    // 5. Deduplicate
    const deduped = deduplicateItems(allItems)
    duplicatesSuppressed = countDuplicatesSuppressed(allItems, deduped)

    // 6. Cluster
    const clusters = clusterItems(deduped, config)

    // 7. Synthesize
    const allSummaries = synthesizeClusters(clusters, config)

    // 8. Rank and filter
    const rankedSummaries = rankAndFilterSummaries(allSummaries, config)

    // 9. Assemble result
    const topClusters = rankedSummaries.slice(0, 10)
    const byCategory = groupByCategory(allSummaries)
    const breakingNow = allSummaries.filter(
        s => s.firstSeenHoursAgo < config.breakingNewsWindowHours && s.trendScore > 70
    )
    const emergingOpportunities = allSummaries.filter(s => s.trendingIn24h)

    const result: SynthesisResult = {
        generatedAt: new Date().toISOString(),
        totalClustersFound: clusters.length,
        topClusters,
        byCategory,
        breakingNow,
        emergingOpportunities,
        pipelineStats: {
            newsItemsFetched,
            youtubeItemsFetched,
            clustersFormed: clusters.length,
            duplicatesSuppressed,
            processingTimeMs: Date.now() - startTime,
        },
    }

    const enhancedResult = await enhanceWithLLM('synthesizer', result, buildSynthesizerContext, {});

    // 10. Trigger existing alerts system for high-scoring trending clusters
    const highScoringClusters = enhancedResult.topClusters.filter(s => s.trendScore > 75 && s.trendingIn24h)

    if (highScoringClusters.length > 0) {
        try {
            const { processAlerts } = await import('@/features/alerts/services/processAlerts')

            const snapshots = highScoringClusters.map(cluster => ({
                nicheId: cluster.clusterId,
                keyword: cluster.topic,
                capturedAt: new Date().toISOString(),
                opportunityIndex: cluster.trendScore,
                radarScore: Math.round(cluster.velocityScore * 100),
                monetizationScore: cluster.trendScore > 80 ? 75 : 55,
                competitionScore: cluster.trendScore > 85 ? 65 : 40,
                demandScore: cluster.trendScore,
                growthScore: Math.round(cluster.velocityScore * 100),
                saturationScore: Math.max(100 - cluster.trendScore, 10),
            }))

            // No previous snapshots — will trigger NEW_EMERGING_OPPORTUNITY alerts
            await processAlerts('system', snapshots, [])
        } catch (err) {
            // Alerts integration is non-critical — log and continue
            console.warn('[Pipeline] Alerts integration failed:', err)
        }
    }

    return enhancedResult
}
