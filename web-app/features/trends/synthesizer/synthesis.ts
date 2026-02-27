import type {
    TrendCluster,
    ClusterSummary,
    SynthesizerConfig,
    TrendCategory,
    DataSource,
    YouTubeItem,
} from './types'
import { enhanceWithLLM } from '../../conductor/conductorService'
import { buildSynthesizerContext } from '../../conductor/contextBuilder'

// ─── WHY IT MATTERS ────────────────────────────────────────────────────────────

function whyItMattersForCategory(category: TrendCategory): string {
    const map: Record<TrendCategory, string> = {
        TECHNOLOGY: 'Tech creators can capitalize on audience curiosity around this development',
        BUSINESS: 'Finance and business creators have a high-CPM audience actively searching for analysis',
        HEALTH: 'Health creators can produce timely explainer content while search intent is elevated',
        POLITICS: 'News commentary creators can drive high engagement with rapid-response content',
        ENTERTAINMENT: 'Entertainment creators can ride the virality wave with reaction or commentary content',
        SCIENCE: 'Science communicators have an opportunity to simplify this story for mass audiences',
        SPORTS: 'Sports creators can capture fan traffic with timely analysis and highlights coverage',
        GENERAL: "Broad appeal topic — general lifestyle creators can connect this to their audience's interests",
    }
    return map[category]
}

// ─── CONTENT OPPORTUNITY ──────────────────────────────────────────────────────

function buildContentOpportunity(cluster: TrendCluster): string {
    const { topic, momentum, category } = cluster

    if (momentum === 'EMERGING') {
        return `Be among the first to publish a breakdown of ${topic} — early movers capture disproportionate traffic before mainstream coverage peaks`
    }
    if (momentum === 'RISING') {
        return `Publish a beginner explainer or reaction video about ${topic} while search intent is building toward peak`
    }
    if (momentum === 'PEAK') {
        return `React to the latest ${topic} developments with your unique perspective within 24 hours to capture trending traffic`
    }
    // DECLINING
    const categoryAngle: Partial<Record<TrendCategory, string>> = {
        TECHNOLOGY: `Publish a retrospective or "what we learned" piece on ${topic} to capture long-tail search traffic as hype settles`,
        BUSINESS: `Produce an analysis of how ${topic} affected markets — evergreen content that will rank as audiences research the aftermath`,
        ENTERTAINMENT: `Create a recap or "everything you need to know" summary video for late-arriving audiences still discovering ${topic}`,
    }
    return categoryAngle[category] ?? `Create a comprehensive summary of the ${topic} story to serve audiences still discovering it`
}

// ─── SUMMARY ──────────────────────────────────────────────────────────────────

function buildSummary(cluster: TrendCluster): string {
    const { topic, sourcesMix, momentum, youtubeItems, firstSeenHoursAgo, clusterScore } = cluster

    const s1 = `${topic} is being covered by ${sourcesMix.newsCount} news publisher${sourcesMix.newsCount !== 1 ? 's' : ''}${sourcesMix.youtubeCount > 0 ? ` and ${sourcesMix.youtubeCount} YouTube video${sourcesMix.youtubeCount !== 1 ? 's' : ''}` : ''} in the last 48 hours.`

    const s2 = youtubeItems.length > 0
        ? `Momentum is ${momentum.toLowerCase()} with ${youtubeItems.length} YouTube video${youtubeItems.length !== 1 ? 's' : ''} published recently, accumulating views rapidly.`
        : `News momentum is ${momentum.toLowerCase()}, with content first surfacing ${firstSeenHoursAgo.toFixed(0)} hours ago.`

    const s3 = clusterScore > 0.7
        ? `This topic shows strong signals across multiple sources and is likely approaching or at its virality window.`
        : clusterScore > 0.4
            ? `Creator opportunity exists now while the story expands before mainstream saturation.`
            : `This story is settling; evergreen content can still capture residual search traffic.`

    return `${s1} ${s2} ${s3}`
}

// ─── GROWTH SIGNALS ───────────────────────────────────────────────────────────

function buildGrowthSignals(cluster: TrendCluster): string[] {
    const signals: string[] = []
    const topYt = cluster.youtubeItems.sort((a, b) => b.viewsPerHour - a.viewsPerHour)[0]

    if (cluster.velocityScore > 0.7 && topYt) {
        signals.push(`High view velocity — ${topYt.viewsPerHour.toFixed(0)} views/hour on top video`)
    }
    if (cluster.sourcesMix.newsCount > 5) {
        signals.push(`${cluster.sourcesMix.newsCount} news publishers covering this story`)
    }
    if (cluster.firstSeenHoursAgo < 6) {
        signals.push(`Breaking — first detected ${cluster.firstSeenHoursAgo.toFixed(1)} hours ago`)
    }
    if (cluster.trendingProbability > 0.7) {
        signals.push(`High trending probability — likely to peak in 24–48 hours`)
    }

    // Fallback signals if none triggered
    if (signals.length === 0) {
        signals.push(`${cluster.totalItems} items across ${cluster.publisherCount} source${cluster.publisherCount !== 1 ? 's' : ''}`)
        if (cluster.firstSeenHoursAgo < 24) {
            signals.push(`Story emerged ${cluster.firstSeenHoursAgo.toFixed(0)} hours ago`)
        }
    }

    return signals.slice(0, 4)
}

// ─── TOP ITEMS ────────────────────────────────────────────────────────────────

function buildTopItems(cluster: TrendCluster): ClusterSummary['topItems'] {
    const topNews = [...cluster.newsItems].sort((a, b) => b.popularity - a.popularity)[0]
    const topYt = [...cluster.youtubeItems].sort((a, b) => b.popularity - a.popularity)[0]

    const items: ClusterSummary['topItems'] = []

    if (topNews) {
        items.push({
            source: 'NEWS' as DataSource,
            title: topNews.title,
            url: topNews.url,
            publishedAt: topNews.publishedAt,
            popularity: topNews.popularity,
        })
    }
    if (topYt) {
        items.push({
            source: 'YOUTUBE' as DataSource,
            title: topYt.title,
            url: topYt.url,
            publishedAt: topYt.publishedAt,
            popularity: topYt.popularity,
        })
    }

    // If we still have room, fill from all items by popularity
    if (items.length < 3) {
        const usedUrls = new Set(items.map(i => i.url))
        const remaining = [...cluster.items]
            .sort((a, b) => b.popularity - a.popularity)
            .filter(i => !usedUrls.has(i.url))
            .slice(0, 3 - items.length)

        for (const item of remaining) {
            items.push({
                source: item.source,
                title: item.title,
                url: item.url,
                publishedAt: item.publishedAt,
                popularity: item.popularity,
            })
        }
    }

    return items.slice(0, 3)
}

// ─── Synthesis ────────────────────────────────────────────────────────────────

/**
 * Converts TrendCluster[] into ClusterSummary[].
 */
export async function synthesizeClusters(
    clusters: TrendCluster[],
    _config: SynthesizerConfig
): Promise<ClusterSummary[]> {
    const summaries = clusters.map(cluster => ({
        clusterId: cluster.clusterId,
        topic: cluster.topic,
        category: cluster.category,
        trendScore: Math.round(cluster.clusterScore * 100),
        momentum: cluster.momentum,
        summary: buildSummary(cluster),
        whyItMatters: whyItMattersForCategory(cluster.category),
        growthSignals: buildGrowthSignals(cluster),
        trendingIn24h: cluster.trendingProbability > 0.65,
        topItems: buildTopItems(cluster),
        contentOpportunity: buildContentOpportunity(cluster),
        firstSeenHoursAgo: cluster.firstSeenHoursAgo,
        velocityScore: cluster.velocityScore,
    }))

    const result = { topClusters: summaries }

    // LLM Enhancement
    const enhanced = await enhanceWithLLM('synthesizer', result, buildSynthesizerContext, {})

    return enhanced.topClusters
}

/**
 * Sorts summaries by trendScore descending and returns top N.
 */
export function rankAndFilterSummaries(
    summaries: ClusterSummary[],
    config: SynthesizerConfig
): ClusterSummary[] {
    return [...summaries]
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, config.maxClustersToReturn)
}
