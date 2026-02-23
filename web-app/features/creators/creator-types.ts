/**
 * @file creator-types.ts
 * Full type definitions for the Creator & Channel Intelligence Dashboard.
 */

/** Full profile metadata for a YouTube channel. */
export interface ChannelProfile {
    /** Unique YouTube channel ID (e.g. "UCxxxxxx") */
    channelId: string;
    /** Display name of the channel */
    channelName: string;
    /** YouTube handle prefixed with @, e.g. "@mkbhd" */
    handle: string;
    /** Total number of channel subscribers */
    subscriberCount: number;
    /** Total published video count */
    totalVideoCount: number;
    /** Cumulative view count across all videos */
    totalViews: number;
    /** Mean view count per published video */
    averageViewsPerVideo: number;
    /** Mean engagement rate as a decimal — (likes + comments) / views */
    averageEngagementRate: number;
    /** Average number of videos uploaded per week */
    uploadFrequencyPerWeek: number;
    /** Inferred content topic tags (e.g. ["Tech", "Gadgets", "Reviews"]) */
    topicTags: string[];
    /** URL to the channel's thumbnail / avatar image */
    thumbnailUrl: string;
    /** Full URL to the channel on YouTube */
    channelUrl: string;
    /** ISO 8601 date string for when the channel was created */
    joinedDate: string;
    /** ISO 3166-1 alpha-2 country code of the channel owner */
    country: string;
}

/** Performance data for a single video. */
export interface VideoPerformance {
    /** Unique YouTube video ID */
    videoId: string;
    /** Video title as shown on YouTube */
    title: string;
    /** Total view count */
    views: number;
    /** Total like count */
    likes: number;
    /** Total comment count */
    comments: number;
    /** ISO 8601 publish date string */
    publishDate: string;
    /** Video length in seconds */
    durationSeconds: number;
    /** Engagement rate as a decimal — (likes + comments) / views */
    engagementRate: number;
    /** Ratio of views to channel subscriber count at publish time */
    viewsPerSubscriber: number;
    /** Categorical performance classification relative to channel averages */
    performanceTier: 'UNDERPERFORMER' | 'AVERAGE' | 'OUTPERFORMER' | 'VIRAL';
    /** URL to the video thumbnail image */
    thumbnailUrl: string;
    /** Full URL to the video on YouTube */
    videoUrl: string;
}

/** Aggregated stats for a competitor or benchmark channel. */
export interface ChannelBenchmark {
    /** Unique YouTube channel ID of the competitor */
    channelId: string;
    /** Display name of the competitor channel */
    channelName: string;
    /** Competitor's subscriber count */
    subscriberCount: number;
    /** Competitor's average views per video */
    avgViews: number;
    /** Competitor's average engagement rate as a decimal */
    avgEngagement: number;
    /** Competitor's average videos uploaded per week */
    uploadFrequency: number;
    /** 0–100 score indicating topic overlap with the target channel */
    topicOverlap: number;
    /** Assessed threat level of this competitor to the target channel */
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

/** A single actionable content strategy insight. */
export interface ContentStrategyInsight {
    /** The strategic area this insight relates to */
    category:
    | 'POSTING_FREQUENCY'
    | 'TITLE_PATTERN'
    | 'ENGAGEMENT_TREND'
    | 'GROWTH_PATTERN'
    | 'CONTENT_GAP';
    /** Human-readable description of the observed pattern */
    insight: string;
    /** Specific, actionable recommendation to improve performance */
    recommendation: string;
    /** Importance level of this insight — HIGH items shown first */
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

/** Full analysis result for a YouTube channel. */
export interface CreatorAnalysis {
    /** Core channel profile data */
    channel: ChannelProfile;
    /** Last 20 published videos ordered by publish date descending */
    recentVideos: VideoPerformance[];
    /** Top 10 all-time videos ordered by view count descending */
    topVideos: VideoPerformance[];
    /** Competitor/benchmark channels ranked by threat level */
    benchmarks: ChannelBenchmark[];
    /** Generated content strategy insights sorted HIGH priority first */
    strategyInsights: ContentStrategyInsight[];
    /** Composite channel health score from 0 (poor) to 100 (excellent) */
    channelHealthScore: number;
    /** Directional trend of channel view counts over recent videos */
    growthTrajectory: 'DECLINING' | 'STAGNANT' | 'GROWING' | 'ACCELERATING';
    /** Channel's competitive standing relative to niche benchmark channels */
    nichePosition: 'NEWCOMER' | 'CHALLENGER' | 'ESTABLISHED' | 'DOMINANT';
    /** Demographic data estimation */
    audience_overview: {
        regions: { name: string; value: number }[];
        age_segments: { segment: string; percentage: number }[];
    };
    /** ISO 8601 timestamp of when this analysis was computed */
    computedAt: string;
}

/** Lightweight search result row for a channel discovery search. */
export interface ChannelSearchResult {
    /** Unique YouTube channel ID */
    channelId: string;
    /** Display name of the channel */
    channelName: string;
    /** YouTube handle prefixed with @, e.g. "@linus" */
    handle: string;
    /** Subscriber count */
    subscriberCount: number;
    /** URL to the channel avatar / thumbnail */
    thumbnailUrl: string;
    /** Short topic hint shown in search results, e.g. "Tech & Gadgets" */
    topicHint: string;
}
