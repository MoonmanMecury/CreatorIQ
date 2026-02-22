/**
 * @file subscriberPlanner.ts
 * Estimates subscriber milestones and timelines based on market opportunity.
 */

import { GrowthInput, SubscriberMilestone, GrowthStage } from './types';

/**
 * Calculates timeframes for reaching subscriber milestones.
 *
 * @param input - Market and strategy signals.
 * @returns Array of 5 subscriber milestones.
 */
export function generateSubscriberMilestones(input: GrowthInput): SubscriberMilestone[] {
    const milestonesList: { target: number; label: string; baseWeeks: number }[] = [
        { target: 1000, label: 'First 1K', baseWeeks: 12 },
        { target: 5000, label: '5K Reach', baseWeeks: 16 }, // Incremental base weeks (28 total)
        { target: 10000, label: '10K Milestone', baseWeeks: 16 }, // Incremental base weeks (44 total)
        { target: 50000, label: '50K Impact', baseWeeks: 36 }, // Incremental (80 total)
        { target: 100000, label: '100K Authority', baseWeeks: 40 }, // Incremental (120 total)
    ];

    // Multipliers for speed (smaller = faster)
    let speedMultiplier = 1.0;

    if (input.opportunityIndex > 70) speedMultiplier *= 0.75;
    if (input.opportunityIndex < 40) speedMultiplier *= 1.4;

    if (input.postingCadence === 'AGGRESSIVE') speedMultiplier *= 0.7;
    if (input.postingCadence === 'LIGHT') speedMultiplier *= 1.3;

    if (input.smallCreatorAdvantage > 65) speedMultiplier *= 0.85;
    if (input.competitionScore > 75) speedMultiplier *= 1.25;
    if (input.growthScore > 70) speedMultiplier *= 0.85;

    let cumulativeWeeks = 0;

    return milestonesList.map((m, idx) => {
        const adjustedIncrementalWeeks = Math.round(m.baseWeeks * speedMultiplier);
        cumulativeWeeks += adjustedIncrementalWeeks;

        // Stage mapping
        let stage: GrowthStage = 'LAUNCH';
        if (m.target >= 5000) stage = 'TRACTION';
        if (m.target >= 10000) stage = 'MOMENTUM';
        if (m.target >= 50000) stage = 'AUTHORITY';

        // Unlocked features (heuristic)
        const featuresMap: Record<number, string[]> = {
            1000: ["YouTube Community Tab", "Custom channel URL", "Live streaming"],
            5000: ["Increased algorithm trust", "Merchandise shelf eligibility"],
            10000: ["YouTube Partner Program (AdSense)", "Sponsorship inquiries"],
            50000: ["Silver Play Button eligibility", "Brand deal negotiation leverage"],
            100000: ["Silver Play Button", "Major industry partnerships", "Speaking opportunities"],
        };

        // Monetization (Step 5 paths)
        const monUnlocked: string[] = [];
        if (m.target >= 1000) monUnlocked.push(input.topRevenuePaths[0] || 'Affiliate Marketing');
        if (m.target >= 10000) monUnlocked.push(input.topRevenuePaths[1] || 'Sponsorships');
        if (m.target >= 50000) monUnlocked.push(...input.topRevenuePaths.slice(0, 4));

        // Key actions
        const actions: string[] = [
            `Maintain a consistency of ${input.longFormPerWeek} long-form videos/week`,
            `Target "${input.risingKeywords[idx % input.risingKeywords.length]}" topics`,
            `Optimize for "${input.topFormats[0]}" format success`,
            `Engage with community to build retention`
        ];

        // Weekly views needed (heuristic: target * 0.15 / weeks to hire * 7)
        const weeklyViewsNeeded = Math.round((m.target * 0.15) / adjustedIncrementalWeeks * 7);

        return {
            target: m.target,
            label: m.label,
            estimatedWeeks: cumulativeWeeks,
            estimatedWeeksRange: `${Math.round(cumulativeWeeks * 0.8)}–${Math.round(cumulativeWeeks * 1.2)} weeks`,
            stage,
            unlockedFeatures: featuresMap[m.target] || [],
            monetizationUnlocked: Array.from(new Set(monUnlocked)),
            keyActions: actions,
            weeklyViewsNeeded: Math.max(100, weeklyViewsNeeded),
        };
    });
}
