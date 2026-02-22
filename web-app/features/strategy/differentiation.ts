/**
 * @file differentiation.ts
 * Differentiation Strategy Engine — identifies the most effective ways for a
 * new creator to stand out from existing content in this niche.
 */

import type { DifferentiationStrategy, StrategyInput } from './types';

/**
 * Generates 4–6 differentiation strategies sorted by priority ascending (1 = highest).
 *
 * @param input - The normalized strategy input.
 * @returns Sorted differentiation strategies (min 3, max 6).
 */
export function generateDifferentiationStrategies(
    input: StrategyInput
): DifferentiationStrategy[] {
    const strategies: DifferentiationStrategy[] = [];
    const kw = input.keyword;

    // --- "Beginner-First Positioning" ---
    if (input.smallCreatorAdvantage > 55) {
        strategies.push({
            strategy: 'Beginner-First Positioning',
            description: `Own the 'most approachable creator in ${kw}' position by assuming zero prior knowledge in all content. Every video should be completable by someone who discovered ${kw} yesterday.`,
            priority: input.smallCreatorAdvantage > 70 ? 1 : 2,
            effortLevel: 'LOW',
            timeToImpactWeeks: 8,
            whyItWorks: `Small creator advantage of ${input.smallCreatorAdvantage}/100 confirms that beginner audiences are underserved — established creators have moved upmarket, leaving a visible gap at the entry level.`,
        });
    }

    // --- "Speed-to-Publish Advantage" ---
    if (input.freshnessGap > 55) {
        strategies.push({
            strategy: 'Speed-to-Publish Advantage',
            description: `Be first to cover new developments in ${kw}. Publish reaction, update, or breakdown content within 24–48 hours of significant news breaking in the space.`,
            priority: input.freshnessGap > 75 ? 1 : 3,
            effortLevel: 'HIGH',
            timeToImpactWeeks: 4,
            whyItWorks: `Freshness gap of ${input.freshnessGap}/100 reveals that existing creators are slow to publish — the first mover on any significant ${kw} development will capture algorithm-boosted distribution.`,
        });
    }

    // --- "Depth & Authority Play" ---
    if (input.competitionScore < 55) {
        strategies.push({
            strategy: 'Depth & Authority Play',
            description: `Produce the most comprehensive ${kw} resources that exist. Become the go-to reference channel, not just another voice — every video should be the definitive treatment of its topic.`,
            priority: 2,
            effortLevel: 'HIGH',
            timeToImpactWeeks: 16,
            whyItWorks: `Competition score of ${input.competitionScore}/100 means the niche is not yet dominated by a definitive authority — there is a clear opening to own the 'best ${kw} resource' position.`,
        });
    }

    // --- "Underserved Sub-Niche Focus" ---
    if (input.risingKeywords.length > 3) {
        const subNiche = input.risingKeywords[0];
        strategies.push({
            strategy: 'Underserved Sub-Niche Focus',
            description: `Target the '${subNiche}' sub-niche specifically rather than the broad ${kw} topic. Less competition, faster ranking, and a highly engaged audience that feels seen by tailored content.`,
            priority: 2,
            effortLevel: 'MEDIUM',
            timeToImpactWeeks: 6,
            whyItWorks: `Rising keyword analysis identified '${subNiche}' as a high-growth subtopic with minimal dedicated coverage — entering here is significantly easier than competing on the main ${kw} keyword.`,
        });
    }

    // --- "Personal Story & Results-Driven" ---
    if (input.opportunityIndex > 55) {
        strategies.push({
            strategy: 'Personal Story & Results-Driven',
            description: `Document your own journey with ${kw} openly. Authenticity and documented personal proof consistently outperform polished, faceless informational content in this niche.`,
            priority: 3,
            effortLevel: 'MEDIUM',
            timeToImpactWeeks: 10,
            whyItWorks: `Opportunity index of ${input.opportunityIndex}/100 signals that audiences are actively looking for real-world ${kw} experiences — vlogs, experiments, and candid breakdowns will differentiate instantly.`,
        });
    }

    // --- "Short-Form First Strategy" ---
    if (input.freshnessGap > 45 && input.smallCreatorAdvantage > 45) {
        strategies.push({
            strategy: 'Short-Form First Strategy',
            description: `Build audience rapidly through ${kw} Shorts and Reels, then convert viewers to long-form content. Lower production cost means faster iteration and a tighter feedback loop.`,
            priority: 3,
            effortLevel: 'LOW',
            timeToImpactWeeks: 6,
            whyItWorks: `Combined freshness gap (${input.freshnessGap}) and small creator advantage (${input.smallCreatorAdvantage}) create ideal conditions for short-form growth — the format is underrepresented and the algorithm favours new voices.`,
        });
    }

    // Guarantee minimum 3 strategies
    if (strategies.length < 3) {
        strategies.push({
            strategy: 'Consistent Publishing Cadence',
            description: `Build algorithmic trust by publishing ${kw} content on a fixed weekly schedule. Consistency signals channel reliability to YouTube and builds audience habit.`,
            priority: 3,
            effortLevel: 'MEDIUM',
            timeToImpactWeeks: 12,
            whyItWorks: `In any niche, the channels that publish consistently outperform sporadic creators with better individual videos over a 6-month horizon.`,
        });
    }

    // Cap at 6, re-sort by priority
    return strategies
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 6);
}
