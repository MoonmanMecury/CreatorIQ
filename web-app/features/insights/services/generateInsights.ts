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
 * Currently uses deterministic simulation based on the keyword string.
 */
export async function generateInsights(keyword: string): Promise<InsightsResponse> {
    // 1. Generate deterministic seed from keyword
    const seed = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const getVal = (min: number, max: number, offset = 0) => {
        const val = ((seed + offset) % (max - min + 1)) + min;
        return val;
    };

    // 2. Simulate Trend Signals
    const trend: TrendSignal = {
        keyword,
        velocity: getVal(10, 95, 100),
        growthRate: getVal(-10, 150, 200),
        regionalStrength: getVal(20, 90, 300),
        risingQueriesCount: getVal(0, 12, 400),
    };

    // 3. Simulate Creator Signals
    const creator: CreatorSignal = {
        keyword,
        videoCount: getVal(500, 5000000, 500),
        avgViews: getVal(1000, 2000000, 600),
        avgEngagement: getVal(5, 85, 700),
        topChannelSubs: getVal(10000, 15000000, 800),
        uploadFrequency: getVal(1, 40, 900),
        smallCreatorRatio: getVal(10, 90, 1000) / 100,
    };

    // 4. Compute Scores
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
}
