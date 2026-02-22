export interface TrendDataPoint {
    date: string;
    value: number;
}

export interface KeywordCluster {
    keyword: string;
    volume: string;
    growth: number;
}

export interface Subtopic {
    keyword: string;
    growth_rate: number;
    competition_score: number;
    recommendation: string;
}

export interface YouTubeTrendMetrics {
    total_views: number;
    average_engagement: number;
    supply_count: number;
}

export interface OpportunityInsights {
    underserved_angles: string[];
    emerging_keywords: string[];
    recommended_format: string;
}

export interface TrendDiscoveryData {
    main_topic: string;
    niche_score: number;
    score: number; // For compatibility
    trend_velocity: number;
    competition_density: string;
    revenue_potential: number;
    top_regions: string[];
    trend_data: TrendDataPoint[];
    keyword_clusters: KeywordCluster[];
    subtopics: Subtopic[];
    opportunity_insights: OpportunityInsights;
    youtube_metrics?: YouTubeTrendMetrics;
    is_mock: boolean;
}
