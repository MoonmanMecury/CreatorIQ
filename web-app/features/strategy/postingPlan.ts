/**
 * @file postingPlan.ts
 * Posting Strategy Recommender — determines the optimal publishing schedule
 * and multi-phase growth plan based on market signals.
 */

import type { PostingPlan, PostingCadence, GrowthPhase, StrategyInput } from './types';

/**
 * Selects the posting cadence based on market conditions.
 */
function selectCadence(input: StrategyInput): PostingCadence {
    if (input.freshnessGap > 65 && input.competitionScore < 50) {
        return 'AGGRESSIVE'; // Strike while the freshness gap exists
    }
    if (input.competitionScore > 70) {
        return 'AGGRESSIVE'; // Need volume to overcome heavy competition
    }
    if (input.growthScore > 60) {
        return 'MODERATE'; // Growing market rewards consistent presence
    }
    return 'LIGHT';
}

type CadenceParams = {
    longFormPerWeek: number;
    shortFormPerWeek: number;
    weeklyCommitmentHours: number;
};

const CADENCE_PARAMS: Record<PostingCadence, CadenceParams> = {
    LIGHT: { longFormPerWeek: 1, shortFormPerWeek: 1, weeklyCommitmentHours: 7 },
    MODERATE: {
        longFormPerWeek: 2,
        shortFormPerWeek: 3,
        weeklyCommitmentHours: 14,
    },
    AGGRESSIVE: {
        longFormPerWeek: 3,
        shortFormPerWeek: 5,
        weeklyCommitmentHours: 22,
    },
};

/**
 * Generates the 3-phase growth roadmap tailored to the keyword and revenue paths.
 */
function buildGrowthPhases(input: StrategyInput): GrowthPhase[] {
    const kw = input.keyword;
    const topRevenue = input.topRevenuePaths[0] ?? 'AD_REVENUE';
    const topRevenue2 = input.topRevenuePaths[1] ?? topRevenue;

    const revenueActionMap: Record<string, string> = {
        AD_REVENUE: `Join YouTube Partner Program and optimize for ad-friendly ${kw} content`,
        AFFILIATE_MARKETING: `Apply for ${kw} affiliate programs and add links to your top 5 videos`,
        SPONSORSHIPS: `Build a media kit and start pitching ${kw}-adjacent brands`,
        COURSES: `Launch a beta version of your ${kw} course with early-bird pricing`,
        DIGITAL_PRODUCTS: `Release your first ${kw} digital product or template`,
        COACHING: `Open a limited number of 1:1 ${kw} coaching spots`,
        SAAS_TOOLS: `Build a waitlist for your ${kw} SaaS tool`,
        PHYSICAL_PRODUCTS: `Source and launch your first ${kw} physical product`,
    };

    const phase1: GrowthPhase = {
        phase: 1,
        label: 'Foundation Phase',
        durationWeeks: 8,
        goal: 'Establish presence and test content formats',
        keyActions: [
            `Publish your first 10 ${kw} videos covering the fundamentals pillar`,
            `Optimize all video titles and descriptions for ${kw} search terms`,
            'Test 2–3 different thumbnail styles and track which drives the highest CTR',
            'Identify your top 3 performing videos by watch time and double down on those formats',
        ],
    };

    const phase2: GrowthPhase = {
        phase: 2,
        label: 'Growth Phase',
        durationWeeks: 12,
        goal: 'Build audience momentum and double down on winning formats',
        keyActions: [
            `Expand to your second content pillar and begin ${kw} case study content`,
            'Collaborate with 2–3 creators in adjacent niches to cross-pollinate audiences',
            'Add a consistent Short-form publishing cadence alongside long-form uploads',
            'Build an email list or community starting with your most engaged viewers',
        ],
    };

    const phase3: GrowthPhase = {
        phase: 3,
        label: 'Authority Phase',
        durationWeeks: 16,
        goal: 'Dominate the niche and activate monetization pathways',
        keyActions: [
            `Publish the definitive "${kw} masterclass" to cement your authority position`,
            revenueActionMap[topRevenue] ??
            `Activate your primary ${kw} revenue stream`,
            revenueActionMap[topRevenue2] ??
            `Layer in your secondary ${kw} revenue stream`,
            `Pitch the top 5 ${kw}-related brands with your audience data and engagement metrics`,
        ],
    };

    return [phase1, phase2, phase3];
}

/**
 * Generates the full recommended posting plan from niche signals.
 *
 * @param input - The normalized strategy input.
 * @returns A complete posting plan with cadence, weekly targets, and 3 growth phases.
 */
export function generatePostingPlan(input: StrategyInput): PostingPlan {
    const cadence = selectCadence(input);
    const params = CADENCE_PARAMS[cadence];
    const growthPhases = buildGrowthPhases(input);

    const topGap = input.risingKeywords[0] ?? input.keyword;

    const firstMonthFocus = `In month one, focus exclusively on your ${input.keyword} fundamentals pillar — publish ${params.longFormPerWeek === 1 ? 'at least one long-form video' : `${params.longFormPerWeek} long-form videos`} per week covering the most searched beginner questions. Simultaneously, target the "${topGap}" content gap with at least one short-form video to test how quickly the algorithm picks up fresh ${input.keyword} content.`;

    return {
        cadence,
        ...params,
        firstMonthFocus,
        growthPhases,
    };
}
