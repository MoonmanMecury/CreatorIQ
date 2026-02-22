export interface SavedNiche {
    id: string
    userId: string
    keyword: string
    opportunityScore: number | null
    growthScore: number | null
    monetizationScore: number | null
    competitionScore: number | null
    demandScore: number | null
    saturationScore: number | null
    opportunityIndex: number | null
    verdict: string | null               // GOLDMINE | HIGH | MEDIUM | LOW
    monetizationVerdict: string | null   // ELITE | STRONG | VIABLE | WEAK | POOR
    market_maturity: string | null       // Keep snake_case for consistency with storageService if needed, but the prompt says marketMaturity in the interface
    marketMaturity: string | null
    top_revenue_paths: string[]
    topRevenuePaths: string[]
    notes: string | null
    tags: string[]
    createdAt: string
    lastAnalyzedAt: string
}

export type FeedEventType =
    | 'SAVED'
    | 'SCORE_CHANGE'
    | 'BREAKOUT'
    | 'COMPETITION_ALERT'
    | 'REANALYZED'
    | 'NOTE_ADDED'

export interface FeedEvent {
    id: string
    savedNicheId: string
    userId: string
    eventType: FeedEventType
    eventTitle: string
    eventDescription: string | null
    severity: 'INFO' | 'WARNING' | 'CRITICAL'
    scoreDelta: number | null            // positive = improved, negative = declined
    metadata: Record<string, unknown> | null
    createdAt: string
    // joined field for display
    keyword?: string
}

export interface ScoreHistory {
    id: string
    savedNicheId: string
    opportunityScore: number | null
    growthScore: number | null
    monetizationScore: number | null
    competitionScore: number | null
    demandScore: number | null
    recordedAt: string
}

export interface ScoreChange {
    metric: string
    previousValue: number
    currentValue: number
    delta: number
    direction: 'UP' | 'DOWN' | 'STABLE'
    isSignificant: boolean               // true if delta > 5 points
}

export interface SaveNichePayload {
    keyword: string
    opportunityScore?: number
    growthScore?: number
    monetizationScore?: number
    competitionScore?: number
    demandScore?: number
    saturationScore?: number
    opportunityIndex?: number
    verdict?: string
    monetizationVerdict?: string
    marketMaturity?: string
    topRevenuePaths?: string[]
    notes?: string
    tags?: string[]
}

export interface OpportunityFeedItem {
    id: string
    keyword: string
    savedNicheId: string
    eventType: FeedEventType
    title: string
    description: string
    severity: 'INFO' | 'WARNING' | 'CRITICAL'
    scoreDelta: number | null
    createdAt: string
    currentScores: {
        opportunity: number | null
        monetization: number | null
        verdict: string | null
    }
}

export interface SavedNichesOverview {
    savedNiches: SavedNiche[]
    feedItems: OpportunityFeedItem[]
    topOpportunities: SavedNiche[]       // top 3 by opportunityScore
    recentlyChanged: SavedNiche[]        // niches with score changes in last 7 days
    totalSaved: number
    goldmineCount: number
    averageOpportunityScore: number
}
