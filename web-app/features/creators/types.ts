export interface CreatorProfile {
    name: string;
    followers: string;
    engagement_rate: string;
    growth_rate: string;
}

export interface EngagementPost {
    id: string;
    type: string;
    engagement: number;
}

export interface EngagementTrend {
    date: string;
    rate: number;
}

export interface AudienceRegion {
    name: string;
    value: number;
}

export interface AgeSegment {
    segment: string;
    percentage: number;
}

export interface CompetitionDensity {
    saturation_score: number;
    status: string;
    color: string;
}

export interface CreatorAnalysisData {
    profile: CreatorProfile;
    engagement_breakdown: {
        posts: EngagementPost[];
        trend: EngagementTrend[];
    };
    audience_overview: {
        regions: AudienceRegion[];
        age_segments: AgeSegment[];
    };
    competition_density: CompetitionDensity;
}
