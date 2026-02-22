/**
 * @file types.ts
 * Type definitions for the News + YouTube Trend Synthesizer pipeline.
 */

export type DataSource = 'NEWS' | 'YOUTUBE'

export type TrendCategory =
    | 'TECHNOLOGY'
    | 'BUSINESS'
    | 'POLITICS'
    | 'HEALTH'
    | 'SCIENCE'
    | 'ENTERTAINMENT'
    | 'SPORTS'
    | 'GENERAL'

export type TrendMomentum = 'EMERGING' | 'RISING' | 'PEAK' | 'DECLINING'

export interface NormalizedItem {
    id: string                      // hash of url for dedup
    source: DataSource
    title: string
    summary: string                 // first 200 chars of description or snippet
    url: string
    publishedAt: string             // ISO timestamp
    popularity: number              // 0-1 normalized score
    topic: string                   // extracted topic label
    category: TrendCategory
    keywords: string[]              // extracted keywords from title + summary
    duplicateCount: number          // how many times this story was found across feeds
}

export interface NewsItem extends NormalizedItem {
    source: 'NEWS'
    publisherName: string
    feedCategory: string            // which RSS feed this came from
    duplicateCount: number          // how many publishers covered same story
}

export interface YouTubeItem extends NormalizedItem {
    source: 'YOUTUBE'
    channelName: string
    viewCount: number
    likeCount: number
    commentCount: number
    viewsPerHour: number            // velocity signal
    likeVelocity: number            // likes per hour since publish
    commentVelocity: number         // comments per hour since publish
    tags: string[]
}

export interface TrendCluster {
    clusterId: string               // uuid
    topic: string                   // human-readable cluster label
    category: TrendCategory
    clusterScore: number            // 0-1 composite importance score
    momentum: TrendMomentum
    items: NormalizedItem[]
    newsItems: NewsItem[]
    youtubeItems: YouTubeItem[]
    totalItems: number
    firstSeenAt: string             // ISO timestamp of earliest item
    firstSeenHoursAgo: number
    lastSeenAt: string
    publisherCount: number          // unique publishers covering this
    velocityScore: number           // 0-1, how fast this is growing
    sourcesMix: {
        newsCount: number
        youtubeCount: number
        newsRatio: number             // 0-1
    }
    keywords: string[]              // merged keywords across all items
    trendingProbability: number     // 0-1, likelihood to explode in 24-48hrs
}

export interface ClusterSummary {
    clusterId: string
    topic: string
    category: TrendCategory
    trendScore: number              // 0-100
    momentum: TrendMomentum
    summary: string                 // 2-3 sentence plain English synthesis
    whyItMatters: string            // 1 sentence creator relevance note
    growthSignals: string[]         // 2-4 specific signal observations
    trendingIn24h: boolean          // flagged as likely to explode
    topItems: {
        source: DataSource
        title: string
        url: string
        publishedAt: string
        popularity: number
    }[]
    contentOpportunity: string      // specific content angle for creators
    firstSeenHoursAgo: number
    velocityScore: number
}

export interface SynthesisResult {
    generatedAt: string
    totalClustersFound: number
    topClusters: ClusterSummary[]   // top 10 by trendScore
    byCategory: Record<TrendCategory, ClusterSummary[]>
    breakingNow: ClusterSummary[]   // firstSeenHoursAgo < 6 AND trendScore > 70
    emergingOpportunities: ClusterSummary[]  // trendingIn24h = true
    pipelineStats: {
        newsItemsFetched: number
        youtubeItemsFetched: number
        clustersFormed: number
        duplicatesSuppressed: number
        processingTimeMs: number
    }
}

export interface RssFeedConfig {
    url: string
    category: TrendCategory
    label: string
    isKeywordFeed: boolean
}

export interface SynthesizerConfig {
    maxClustersToReturn: number     // default 10
    minItemsPerCluster: number      // default 2
    clusteringWindowHours: number   // how far back to look, default 48
    breakingNewsWindowHours: number // default 6
    youtubeResultsPerTopic: number  // default 5
    velocityWindowHours: number     // for calculating velocity, default 24
}
