/**
 * @file titlePatterns.ts
 * Title Pattern Extractor — surfaces proven YouTube title formulas
 * calibrated to the niche's specific signals.
 */

import type { TitleTemplate } from './types';

type PerformanceTier = 'HIGH' | 'MEDIUM' | 'LOW';

interface PatternDef {
    template: string;
    patternName: string;
    whyItWorks: string;
    /**
     * Evaluator that returns the tier based on the niche's demand score.
     * Return HIGH when the pattern is a natural fit for the current signals.
     */
    tierFn: (demandScore: number, keyword: string) => PerformanceTier;
}

const PATTERN_DEFS: PatternDef[] = [
    {
        template: 'How to {topic} (Step-by-Step Guide)',
        patternName: 'Instructional Guide',
        whyItWorks: 'Captures how-to search intent directly — the highest-volume query format on YouTube.',
        tierFn: (d) => (d > 65 ? 'HIGH' : d > 45 ? 'MEDIUM' : 'LOW'),
    },
    {
        template: 'Top 10 {topic} Tools in 2025',
        patternName: 'Ranked List',
        whyItWorks: 'Numbers in titles increase CTR by ~30% — ranked lists satisfy decision fatigue and drive strong clicks.',
        tierFn: (d) => (d > 55 ? 'HIGH' : 'MEDIUM'),
    },
    {
        template: '{topic} vs {topic}: Honest Comparison',
        patternName: 'Direct Comparison',
        whyItWorks: 'High purchase-intent searches — viewers in comparison mode are ready to decide and engage deeply.',
        tierFn: (_, kw) => {
            const lower = kw.toLowerCase();
            return lower.includes('vs') || lower.includes('best') || lower.includes('compare')
                ? 'HIGH'
                : 'MEDIUM';
        },
    },
    {
        template: "I Tried {topic} for 30 Days — Here's What Happened",
        patternName: 'Personal Challenge',
        whyItWorks: 'Story-driven format creates a powerful curiosity gap — viewers stay to see the result.',
        tierFn: (_, kw) => {
            const lower = kw.toLowerCase();
            return lower.includes('fitness') || lower.includes('habit') || lower.includes('productivity')
                ? 'HIGH'
                : 'MEDIUM';
        },
    },
    {
        template: "The Beginner's Complete Guide to {topic}",
        patternName: 'Beginner Authority',
        whyItWorks: 'Captures the largest search pool — beginners vastly outnumber advanced users in most niches.',
        tierFn: (d) => (d > 60 ? 'HIGH' : 'MEDIUM'),
    },
    {
        template: 'Why {topic} Is Changing Everything in 2025',
        patternName: 'Trend Commentary',
        whyItWorks: 'Taps into FOMO and trend curiosity — high shareability and strong algorithm performance.',
        tierFn: (_, kw) => {
            const lower = kw.toLowerCase();
            return lower.includes('ai') || lower.includes('crypto') || lower.includes('future')
                ? 'HIGH'
                : 'MEDIUM';
        },
    },
    {
        template: "{topic} Mistakes You're Probably Making",
        patternName: 'Problem/Warning',
        whyItWorks: "High emotional resonance — people are wired to avoid loss, making 'mistake' titles irresistible to click.",
        tierFn: (d) => (d > 50 ? 'HIGH' : 'MEDIUM'),
    },
    {
        template: "I Spent 100 Hours Learning {topic} — Here's What I Found",
        patternName: 'Research Authority',
        whyItWorks: "Positions the creator as invested and credible — audiences trust creators who've 'done the work'.",
        tierFn: (d) => (d > 70 ? 'HIGH' : d > 45 ? 'MEDIUM' : 'LOW'),
    },
];

const TIER_ORDER: Record<PerformanceTier, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

/**
 * Returns 6–8 title templates calibrated to the keyword and demand signal,
 * sorted HIGH → MEDIUM → LOW.
 *
 * @param keyword - The niche keyword.
 * @param breakoutTitles - Titles of breakout videos from Step 3 (unused in scoring but available for future heuristics).
 * @param demandScore - 0–100 demand score from Step 2.
 */
export function extractTitlePatterns(
    keyword: string,
    breakoutTitles: string[],
    demandScore: number
): TitleTemplate[] {
    void breakoutTitles; // Available for future breakout-pattern matching

    const templates: TitleTemplate[] = PATTERN_DEFS.map((def) => {
        const performanceTier = def.tierFn(demandScore, keyword);
        const exampleFilled = def.template
            .replace(/\{topic\}/g, keyword)
            .replace(/\{topic\}/g, keyword); // replaces both occurrences in comparison pattern

        return {
            template: def.template,
            patternName: def.patternName,
            performanceTier,
            exampleFilled,
            whyItWorks: def.whyItWorks,
        };
    });

    // Sort HIGH first, then MEDIUM, then LOW, preserving relative order within each tier
    return templates.sort(
        (a, b) => TIER_ORDER[a.performanceTier] - TIER_ORDER[b.performanceTier]
    );
}
