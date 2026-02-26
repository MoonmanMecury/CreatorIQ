/**
 * @file getContentStrategy.ts
 * Unified Content Strategy Service — orchestrates all strategy modules into
 * a single, coherent ContentStrategy object.
 *
 * This is a synchronous pure function — no API calls, no side effects.
 */

import type {
    ContentStrategy,
    StrategyInput,
} from '../types';

import type { InsightsResponse } from '@/features/monetization/types';
import type { OpportunityResult } from '@/features/opportunities/types';
import type { MonetizationInsights } from '@/features/monetization/types';

import { analyzeContentGaps } from '../gapAnalysis';
import { detectWinningFormats } from '../formatDetection';
import { extractTitlePatterns } from '../titlePatterns';
import { generateContentPillars } from '../pillars';
import { generateVideoIdeas } from '../videoIdeas';
import { generatePostingPlan } from '../postingPlan';
import { generateDifferentiationStrategies } from '../differentiation';
import { generateQuickWins } from '../quickWins';
import { enhanceWithLLM } from '@/features/conductor/conductorService';
import { buildStrategyContext } from '@/features/conductor/contextBuilder';

// ---------------------------------------------------------------------------
// Core service
// ---------------------------------------------------------------------------

/**
 * Generates a complete, data-grounded content strategy for a keyword.
 * Executes all sub-modules in order and assembles the final result.
 *
 * @param input - Normalized input from Steps 2, 3, and 5.
 * @returns A fully populated ContentStrategy.
 */
export async function getContentStrategy(input: StrategyInput): Promise<ContentStrategy> {
    // 1. Content gap analysis
    const contentGaps = analyzeContentGaps(input);

    // 2. Winning format detection
    const topFormats = detectWinningFormats(input, input.breakoutVideoTitles);

    // 3. Title pattern extraction
    const titleTemplates = extractTitlePatterns(
        input.keyword,
        input.breakoutVideoTitles,
        input.demandScore
    );

    // 4. Content pillar generation
    const pillars = generateContentPillars(input);

    // 5. Video idea generation (depends on pillars, formats, gaps)
    const videoIdeas = generateVideoIdeas(input, pillars, topFormats, contentGaps);

    // 6. Posting plan
    const postingPlan = generatePostingPlan(input);

    // 7. Differentiation strategies
    const differentiationStrategies = generateDifferentiationStrategies(input);

    // 8. Quick wins (depends on ideas and gaps)
    const quickWins = generateQuickWins(input, videoIdeas, contentGaps);

    // 9. Executive summary — constructed dynamically from actual signals
    const topFormat = topFormats[0];
    const topDiff = differentiationStrategies[0];
    const topGap = contentGaps[0];

    const maturityLabel: Record<string, string> = {
        EARLY: 'early-stage',
        DEVELOPING: 'fast-developing',
        MATURE: 'mature',
        OVERSATURATED: 'saturated',
    };
    const maturityDescription = maturityLabel[input.marketMaturity] ?? input.marketMaturity.toLowerCase();

    const strategySummary = [
        `The ${input.keyword} niche is a ${maturityDescription} market with a demand score of ${input.demandScore}/100 and an opportunity index of ${input.opportunityIndex}/100 — ${input.opportunityIndex > 60 ? 'indicating strong entry conditions for new creators' : 'suggesting a focused, differentiated approach will be needed to break through'}.`,
        topGap
            ? `The most significant content gap is "${topGap.topic}" (opportunity score: ${topGap.opportunitySize}/100), which represents the fastest path to early traction.`
            : `Content gaps exist across multiple format and depth dimensions, giving a new creator multiple credible entry points.`,
        topFormat
            ? `${topFormat.label} content ranks as the highest-probability format for this niche (${topFormat.successLikelihood}/100), ${topFormat.reasoning.toLowerCase()}`
            : `Multiple content formats show strong performance potential for this keyword.`,
        topDiff
            ? `The recommended differentiation strategy is "${topDiff.strategy}" — ${topDiff.description.split('.')[0]}.`
            : `A consistent, beginner-focused publishing strategy is recommended to establish initial authority.`,
    ].join(' ');

    const result: ContentStrategy = {
        keyword: input.keyword,
        strategySummary,
        contentGaps,
        topFormats,
        titleTemplates,
        pillars,
        videoIdeas,
        postingPlan,
        differentiationStrategies,
        quickWins,
        computedAt: new Date().toISOString(),
    };

    return enhanceWithLLM('strategy', result, buildStrategyContext, {
        strategySummaryNarrative: 'strategySummary',
        quickWins: 'quickWins'
    });
}

// ---------------------------------------------------------------------------
// Input mapper
// ---------------------------------------------------------------------------

/**
 * Maps upstream Step 2, 3, and 5 response types into the StrategyInput contract.
 *
 * @param keyword - The keyword being analyzed.
 * @param insightsData - Step 2 TrendDiscoveryData response.
 * @param opportunityData - Step 3 OpportunityResult response.
 * @param monetizationData - Step 5 MonetizationInsights response.
 * @returns A fully populated StrategyInput ready for getContentStrategy.
 */
export function buildStrategyInput(
    keyword: string,
    insightsData: InsightsResponse,
    opportunityData: OpportunityResult,
    monetizationData: MonetizationInsights
): StrategyInput {
    const densityMap: Record<string, number> = {
        LOW: 20,
        MEDIUM: 50,
        HIGH: 80,
    };
    const competitionScore = densityMap[insightsData.competition_density] ?? 50;

    return {
        keyword,
        demandScore: insightsData.niche_score ?? insightsData.score ?? 50,
        growthScore: insightsData.trend_velocity ?? 50,
        competitionScore,
        saturationScore: competitionScore, // Derived from competition density
        opportunityIndex: opportunityData.opportunityIndex ?? 50,
        marketMaturity: monetizationData.marketMaturity ?? 'DEVELOPING',
        monetizationScore: monetizationData.monetizationScore ?? 50,
        topRevenuePaths: monetizationData.revenuePaths
            .slice(0, 3)
            .map((rp) => rp.type),
        risingKeywords: opportunityData.underservedKeywords.map((uk) => uk.keyword),
        breakoutVideoTitles: opportunityData.breakoutVideos.map((bv) => bv.title),
        avgCompetitorUploadFrequency: 2, // Default — would come from real data
        smallCreatorAdvantage: opportunityData.signals.smallCreatorAdvantage ?? 50,
        freshnessGap: opportunityData.signals.freshnessGap ?? 50,
    };
}
