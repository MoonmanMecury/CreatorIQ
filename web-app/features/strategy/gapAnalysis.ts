/**
 * @file gapAnalysis.ts
 * Content Gap Analyzer — identifies where the existing content landscape is
 * failing audiences, surfacing the highest-leverage entry points.
 */

import type { ContentGap, StrategyInput } from './types';

/**
 * Simple deterministic pseudo-random seeded from a string.
 * Used so subtopic opportunitySize values are stable per keyword run.
 */
function seededValue(seed: string, min: number, max: number): number {
    const hash = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return Math.floor((Math.sin(hash) + 1) / 2 * (max - min) + min);
}

/**
 * Analyzes the content landscape for a given niche and returns prioritized gaps.
 *
 * @param input - The normalized strategy input from Steps 2–5.
 * @returns 4–7 content gaps sorted by opportunitySize descending.
 */
export function analyzeContentGaps(input: StrategyInput): ContentGap[] {
    const gaps: ContentGap[] = [];

    // --- RECENCY gap ---
    if (input.freshnessGap > 60) {
        gaps.push({
            topic: `Recent developments in ${input.keyword}`,
            gapType: 'RECENCY',
            opportunitySize: input.freshnessGap,
            explanation:
                'Most top content is outdated — audience is hungry for current coverage',
            suggestedAngle:
                "News-style updates and recaps of what's changed in the last 90 days",
        });
    }

    // --- SUBTOPIC gaps (2–3 from rising keywords) ---
    const subtopicCount = Math.min(3, input.risingKeywords.length);
    for (let i = 0; i < subtopicCount; i++) {
        const kw = input.risingKeywords[i];
        const opportunitySize = seededValue(kw, 55, 90);
        gaps.push({
            topic: kw,
            gapType: 'SUBTOPIC',
            opportunitySize,
            explanation:
                'This subtopic is gaining search traction but has minimal dedicated content',
            suggestedAngle:
                'Dedicated deep-dive content targeting this specific angle',
        });
    }

    // --- DEPTH gap ---
    if (input.competitionScore < 50) {
        gaps.push({
            topic: `In-depth ${input.keyword} masterclass content`,
            gapType: 'DEPTH',
            opportunitySize: 100 - input.competitionScore,
            explanation:
                "Most existing content is surface-level — no one owns the 'definitive guide' position",
            suggestedAngle:
                'Long-form comprehensive guides that become the go-to resource',
        });
    }

    // --- AUDIENCE gap ---
    if (input.smallCreatorAdvantage > 60) {
        gaps.push({
            topic: `${input.keyword} for complete beginners`,
            gapType: 'AUDIENCE',
            opportunitySize: input.smallCreatorAdvantage,
            explanation:
                'Existing creators assume prior knowledge — beginner audience is underserved',
            suggestedAngle:
                'Zero-to-hero beginner series with no assumed knowledge',
        });
    }

    // --- FORMAT gap (always included) ---
    gaps.push({
        topic: `Short-form ${input.keyword} content`,
        gapType: 'FORMAT',
        opportunitySize: 65,
        explanation:
            'Long-form dominates — Shorts and quick-tip formats are underrepresented',
        suggestedAngle:
            '60-second actionable tips repurposed from long-form content',
    });

    // Sort by opportunitySize descending
    return gaps.sort((a, b) => b.opportunitySize - a.opportunitySize);
}
