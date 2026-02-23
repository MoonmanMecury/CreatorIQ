import { InsightsResponse, TrendSignal, CreatorSignal } from '../types';
import {
    calculateDemandScore,
    calculateCompetitionScore,
    calculateSaturationScore,
    calculateOpportunityScore,
    getVerdict,
    generateInsights as generateInsightBullets
} from '../scoring';

/**
 * Orchestrates the generation of a full InsightsResponse for a given keyword.
 */
export async function generateInsights(keyword: string): Promise<InsightsResponse> {
    const baseUrl = process.env.PYTRENDS_BASE_URL || 'http://localhost:5087';

    try {
        // 1. Fetch real trend discovery data from backend
        const res = await fetch(`${baseUrl}/api/trends?topic=${encodeURIComponent(keyword)}`);
        if (!res.ok) throw new Error(`Failed to fetch trends: ${res.statusText}`);
        const data = await res.json();

        // 2. Map to Trend Signals
        const trend: TrendSignal = {
            keyword,
            velocity: data.trend_velocity,
            growthRate: data.niche_score,
            regionalStrength: (data.top_regions?.length || 0) * 20 || 50,
            risingQueriesCount: data.keyword_clusters?.length || 0,
        };

        // 3. Map to Creator Signals
        const creator: CreatorSignal = {
            keyword,
            videoCount: data.youtube_metrics?.supply_count || 0,
            avgViews: (data.youtube_metrics?.total_views || 0) / (data.youtube_metrics?.supply_count || 1),
            avgEngagement: data.youtube_metrics?.average_engagement || 0,
            topChannelSubs: 1000000,
            uploadFrequency: 5,
            smallCreatorRatio: 0.4,
        };

        // 4. Compute Scores (using existing scoring logic)
        const demandScore = calculateDemandScore(trend);
        const competitionScore = calculateCompetitionScore(creator);
        const saturationScore = calculateSaturationScore(trend, creator);
        const opportunityScore = calculateOpportunityScore(demandScore, competitionScore, saturationScore);
        const verdict = getVerdict(opportunityScore);

        // 5. Generate Insight Bullets
        const insights = generateInsightBullets(trend, creator, {
            demand: demandScore,
            competition: competitionScore,
            saturation: saturationScore,
            opportunity: opportunityScore
        });

        return {
            keyword,
            opportunityScore,
            verdict,
            demandScore,
            competitionScore,
            saturationScore,
            signals: {
                trend,
                creator,
            },
            insights,
            computedAt: new Date().toISOString(),
        };
    } catch (err) {
        console.error('[GenerateInsights] Error:', err);
        throw err;
    }
}
