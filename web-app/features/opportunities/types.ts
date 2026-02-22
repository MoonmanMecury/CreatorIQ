/**
 * Signals representing specific gaps in the market.
 */
export interface GapSignals {
    /** 0-100 score indicating how weak/fragmented the existing competition is. */
    weakCompetition: number;
    /** 0-100 score indicating how much search demand is currently unmet by supply. */
    underservedDemand: number;
    /** 0-100 score indicating if small creators are already succeeding in this niche. */
    smallCreatorAdvantage: number;
    /** 0-100 score indicating how stale the current content supply is. */
    freshnessGap: number;
}

/**
 * Represents a video that has significantly outperformed its channel's typical reach.
 */
export interface BreakoutVideo {
    videoId: string;
    title: string;
    channelName: string;
    channelSubscribers: number;
    views: number;
    likes: number;
    comments: number;
    /** ISO date string of when the video was published. */
    publishDate: string;
    /** Ratio of views to channel subscribers. > 1 means viral outperformance. */
    outperformanceRatio: number;
    thumbnailUrl: string;
    videoUrl: string;
}

/**
 * A keyword with high potential and low competition relative to its growth.
 */
export interface UnderservedKeyword {
    keyword: string;
    /** Percentage growth signal derived from trend data. */
    growthRate: number;
    competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    searchVolumeTrend: 'RISING' | 'STABLE' | 'DECLINING';
    /** True if the keyword consists of 3 or more words. */
    isLongTail: boolean;
    /** The parent keyword this keyword was derived from. */
    relatedTo: string;
}

/**
 * Final result of the Opportunity Analysis for a given keyword.
 */
export interface OpportunityResult {
    keyword: string;
    /** Overall opportunity score from 0-100. */
    opportunityIndex: number;
    classification: 'POOR' | 'FAIR' | 'STRONG' | 'PRIME ENTRY';
    signals: GapSignals;
    breakoutVideos: BreakoutVideo[];
    underservedKeywords: UnderservedKeyword[];
    /** Human-readable bullets describing the competitive landscape. */
    competitionInsights: string[];
    /** Human-readable bullets with actionable entry strategies. */
    entryInsights: string[];
    /** ISO timestamp of when this analysis was computed. */
    computedAt: string;
}

/**
 * Raw data structure for video metrics coming from the API or ingestion layer.
 */
export interface RawVideoData {
    videoId: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    publishDate: string;
    channelId: string;
    channelName: string;
    channelSubscribers: number;
    channelVideoCount: number;
    thumbnailUrl: string;
}
