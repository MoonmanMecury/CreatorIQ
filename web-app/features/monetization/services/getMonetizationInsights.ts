/**
 * @file getMonetizationInsights.ts
 * Unified Monetization Service — orchestrates the heuristic analysis.
 */

import type {
    MonetizationInput,
    MonetizationInsights,
    MonetizationScoreBreakdown,
    InsightsResponse,
    OpportunityResult
} from '../types';

import { calculateAdDemandScore } from '../adDemand';
import { calculateAudienceValueScore } from '../audienceValue';
import { estimateCpmTier, cpmTierToScore } from '../cpmEstimate';
import { analyzeMarketMaturity, maturityToScore } from '../maturity';
import { detectRevenuePaths } from '../revenuePaths';
import { calculateMonetizationScore, revenuePathsToScore } from '../monetizationScore';
import {
    getMonetizationVerdict,
    getVerdictLabel,
    getVerdictDescription,
    generateTopOpportunities,
    generateRisks
} from '../validation';
import { enhanceWithLLM } from '../../conductor/conductorService';
import { buildMonetizationContext } from '../../conductor/contextBuilder';

/**
 * Computes full monetization insights from a normalized input object.
 */
export async function getMonetizationInsights(input: MonetizationInput): Promise<MonetizationInsights> {
    // 1. Ad Demand
    const adDemand = calculateAdDemandScore(input.keyword, input.demandScore);

    // 2. Audience Value
    const audienceValue = calculateAudienceValueScore(input.keyword);

    // 3. CPM Tier
    const cpmTier = estimateCpmTier(input.keyword, audienceValue);
    const cpmPotential = cpmTierToScore(cpmTier);

    // 4. Market Maturity
    const marketMaturity = analyzeMarketMaturity(
        input.competitionScore,
        input.saturationScore,
        input.opportunityIndex
    );
    const marketMaturityScore = maturityToScore(marketMaturity);

    // 5. Revenue Paths
    const revenuePaths = detectRevenuePaths(
        input.keyword,
        audienceValue,
        adDemand,
        input.competitionScore
    );

    // 6. Revenue Path Score
    const revenuePathScore = revenuePathsToScore(revenuePaths);

    // 7. Assemble Breakdown
    const breakdown: MonetizationScoreBreakdown = {
        adDemand,
        audienceValue,
        revenuePathScore,
        cpmPotential,
        marketMaturityScore
    };

    // 8. Final Composite Score
    const monetizationScore = calculateMonetizationScore(breakdown);

    // 9. Verdict
    const verdict = getMonetizationVerdict(monetizationScore);
    const verdictLabel = getVerdictLabel(verdict);
    const verdictDescription = getVerdictDescription(
        verdict,
        input.keyword,
        marketMaturity,
        revenuePaths[0]
    );

    // 10. Opportunities & Risks
    const topOpportunities = generateTopOpportunities(revenuePaths, breakdown, cpmTier);
    const risks = generateRisks(marketMaturity, input.competitionScore, input.saturationScore);

    const result: MonetizationInsights = {
        keyword: input.keyword,
        monetizationScore,
        verdict,
        verdictLabel,
        verdictDescription,
        cpmTier,
        marketMaturity,
        breakdown,
        revenuePaths,
        topOpportunities,
        risks,
        computedAt: new Date().toISOString()
    };

    // LLM Enhancement
    return enhanceWithLLM('monetization', result, buildMonetizationContext, {
        verdictDescription: 'verdictDescription',
        topOpportunitiesBullets: 'topOpportunities',
        riskBullets: 'risks'
    });
}

/**
 * Mapper utility to build MonetizationInput from Step 2 and Step 3 results.
 */
export function buildMonetizationInput(
    keyword: string,
    insightsData: InsightsResponse,
    opportunityData: OpportunityResult
): MonetizationInput {
    const densityMap: Record<string, number> = {
        'LOW': 20,
        'MEDIUM': 50,
        'HIGH': 80
    };
    const saturationScore = densityMap[insightsData.competition_density] || 50;

    return {
        keyword,
        demandScore: insightsData.niche_score || insightsData.score,
        competitionScore: densityMap[insightsData.competition_density] || 50,
        saturationScore,
        growthScore: insightsData.trend_velocity,
        opportunityIndex: opportunityData.opportunityIndex,
        avgEngagementRate: 0.035, // Default average engagement rate
        topChannelSubscribers: Math.max(...(opportunityData.breakoutVideos?.map(v => v.channelSubscribers) || [0]))
    };
}
