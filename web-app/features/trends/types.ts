export interface TrendDataPoint {
    date: string;
    value: number;
}

export interface KeywordCluster {
    keyword: string;
    volume: string;
    growth: number;
}

export interface OpportunityInsights {
    underserved_angles: string[];
    emerging_keywords: string[];
    recommended_format: string;
}

export interface TrendDiscoveryData {
    score: number;
    trend_velocity: number;
    competition_density: string;
    revenue_potential: number;
    top_regions: string[];
    trend_data: TrendDataPoint[];
    keyword_clusters: KeywordCluster[];
    opportunity_insights: OpportunityInsights;
}
