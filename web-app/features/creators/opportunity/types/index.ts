export type OpportunityClassification =
    | 'COVERED_HOT'
    | 'COVERED_COOLING'
    | 'HOT_IGNORED'       // the attack zone
    | 'IRRELEVANT'

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMEDIATE'

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'

export interface CreatorTopicCluster {
    topic: string
    keywords: string[]
    videoCount: number                // how many of creator's videos cover this
    lastCoveredAt: string             // ISO date of most recent video on topic
    avgViewsOnTopic: number
    recencyScore: number              // 0-1, higher = covered more recently
    coverageScore: number             // 0-1, depth of coverage
    isCooling: boolean                // true if last video on topic > 60 days ago
}

export interface GlobalOpportunityTopic {
    topic: string
    keywords: string[]
    searchDemandScore: number         // 0-100, from Pytrends
    searchGrowthRate: number          // % change in search interest
    newsMentionCount: number          // total news articles on topic
    newsVelocityScore: number         // 0-1, how fast news coverage is growing
    risingQueriesCount: number        // number of related rising queries
    crossSourceScore: number          // 0-1, agreement between Pytrends + News
    firstDetectedAt: string           // ISO timestamp
    category: string                  // inferred e.g. "AI", "Finance", "Health"
}

export interface TopicOverlapResult {
    topic: string
    keywords: string[]
    classification: OpportunityClassification
    globalTopic: GlobalOpportunityTopic
    creatorCoverage: CreatorTopicCluster | null  // null if HOT_IGNORED
    demandStrength: number            // 0-100
    creatorAbsenceScore: number       // 0-100, higher = more absent from this topic
}

export interface AttackOpportunity {
    id: string
    topic: string
    keywords: string[]
    opportunityScore: number          // 0-100
    classification: 'HOT_IGNORED'
    urgency: UrgencyLevel
    difficulty: DifficultyLevel

    // Why it's hot
    demandStrength: number
    searchGrowthRate: number
    newsMomentum: number
    risingQueriesCount: number

    // Why creator is vulnerable
    creatorAbsenceDays: number        // days since creator touched this topic (999 if never)
    creatorUploadSlowing: boolean     // upload cadence declining
    competitorCoverageLevel: 'NONE' | 'SPARSE' | 'MODERATE'

    // Tactical
    suggestedAngle: string
    whyItsHot: string                 // data-backed 1 sentence
    whyCreatorIsVulnerable: string    // 1 sentence
    sampleVideoTitle: string          // ready-to-use title idea
    urgencyReason: string             // why act now specifically

    // Supporting data
    topNewsHeadline: string
    topNewsUrl: string
    topRisingQuery: string
    estimatedSearchVolumeTrend: 'RISING' | 'ACCELERATING' | 'PEAK'
}

export interface MomentumData {
    uploadsLast30Days: number
    uploadsLast90Days: number
    avgViewsLast30Days: number
    avgViewsLast90Days: number
    uploadCadenceTrend: 'ACCELERATING' | 'STABLE' | 'SLOWING' | 'STALLED'
    viewVelocityTrend: 'GROWING' | 'STABLE' | 'DECLINING'
    engagementTrend: 'IMPROVING' | 'STABLE' | 'DECLINING'
    topPerformingTopicLast30Days: string
    slowestTopicLast30Days: string
}

export interface AttackEngineResult {
    channelId: string
    channelName: string
    analyzedAt: string
    attackOpportunities: AttackOpportunity[]   // sorted by opportunityScore desc
    creatorTopics: CreatorTopicCluster[]
    globalOpportunities: GlobalOpportunityTopic[]
    overlapResults: TopicOverlapResult[]
    momentumData: MomentumData
    strategicSummary: string                   // 3-4 sentence plain English conclusion
    totalHotIgnoredTopics: number
    topUrgentOpportunity: AttackOpportunity | null
    dataFreshness: {
        youtubeDataAge: number                   // minutes since YouTube fetch
        pytrendsDataAge: number
        newsDataAge: number
    }
}
