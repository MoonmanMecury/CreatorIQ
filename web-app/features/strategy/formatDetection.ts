/**
 * @file formatDetection.ts
 * Winning Format Detector — scores all content formats against the niche's
 * specific signals to identify which types of videos will perform best.
 */

import type { ContentFormat, FormatScore, StrategyInput } from './types';

const FORMAT_LABELS: Record<ContentFormat, string> = {
    TUTORIAL: 'Tutorial',
    REVIEW: 'Review',
    LIST: 'List / Roundup',
    CASE_STUDY: 'Case Study',
    COMMENTARY: 'Commentary',
    SHORT_FORM: 'Short-Form',
    DOCUMENTARY: 'Documentary',
    COMPARISON: 'Comparison',
    INTERVIEW: 'Interview',
    CHALLENGE: 'Challenge',
};

function keywordContains(keyword: string, ...terms: string[]): boolean {
    const kw = keyword.toLowerCase();
    return terms.some((t) => kw.includes(t));
}

function hasNumberInTitles(titles: string[]): boolean {
    return titles.some((t) => /\d/.test(t));
}

/**
 * Scores all ContentFormat values and returns them sorted by successLikelihood
 * descending. Each score is capped at 100 and starts at a base of 40.
 *
 * @param input - The normalized strategy input.
 * @param breakoutTitles - Titles of breakout videos from Step 3.
 * @returns All formats sorted by score descending.
 */
export function detectWinningFormats(
    input: StrategyInput,
    breakoutTitles: string[]
): FormatScore[] {
    const results: FormatScore[] = [];
    const kw = input.keyword;

    // --- TUTORIAL ---
    {
        let score = 40;
        const reasons: string[] = [];
        if (keywordContains(kw, 'how to', 'learn', 'guide', 'beginner', 'start')) {
            score += 20;
            reasons.push('keyword signals strong how-to intent');
        }
        if (input.demandScore > 70) {
            score += 15;
            reasons.push('high demand score indicates an eager audience');
        }
        if (input.smallCreatorAdvantage > 50) {
            score += 10;
            reasons.push('small creators are gaining traction — educational angles work here');
        }
        results.push({
            format: 'TUTORIAL',
            label: FORMAT_LABELS.TUTORIAL,
            successLikelihood: Math.min(100, score),
            reasoning:
                reasons.length > 0
                    ? `Tutorial format scores high because ${reasons.join(', ')}.`
                    : 'Tutorial format offers a reliable baseline for educational niches.',
            exampleTitle: `How to Get Started with ${kw} (Complete Guide)`,
            isShortForm: false,
        });
    }

    // --- REVIEW ---
    {
        let score = 40;
        const reasons: string[] = [];
        if (keywordContains(kw, 'best', 'review', 'tool', 'software', 'product', 'vs')) {
            score += 25;
            reasons.push('keyword contains commercial/review intent signals');
        }
        if (input.monetizationScore > 70) {
            score += 15;
            reasons.push('high monetization score means strong product ecosystem to review');
        }
        results.push({
            format: 'REVIEW',
            label: FORMAT_LABELS.REVIEW,
            successLikelihood: Math.min(100, score),
            reasoning:
                reasons.length > 0
                    ? `Review format performs well here because ${reasons.join(', ')}.`
                    : 'Review content captures buyer-intent searches effectively.',
            exampleTitle: `Honest ${kw} Review — Worth It in 2025?`,
            isShortForm: false,
        });
    }

    // --- LIST ---
    {
        let score = 40 + 20; // +20 always
        const reasons: string[] = ['listicles universally improve CTR and watch time'];
        if (input.demandScore > 60) {
            score += 10;
            reasons.push('high demand means large audience for list content');
        }
        if (hasNumberInTitles(breakoutTitles)) {
            score += 10;
            reasons.push('numbered titles appear in breakout videos for this niche');
        }
        results.push({
            format: 'LIST',
            label: FORMAT_LABELS.LIST,
            successLikelihood: Math.min(100, score),
            reasoning: `List format is recommended because ${reasons.join(', ')}.`,
            exampleTitle: `10 ${kw} Tips That Actually Work`,
            isShortForm: false,
        });
    }

    // --- CASE_STUDY ---
    {
        let score = 40;
        const reasons: string[] = [];
        if (keywordContains(kw, 'business', 'income', 'results', 'success', 'make money')) {
            score += 25;
            reasons.push('keyword contains results/proof-based intent signals');
        }
        if (input.monetizationScore > 75) {
            score += 15;
            reasons.push('elite monetization score indicates audiences hungry for proof content');
        }
        results.push({
            format: 'CASE_STUDY',
            label: FORMAT_LABELS.CASE_STUDY,
            successLikelihood: Math.min(100, score),
            reasoning:
                reasons.length > 0
                    ? `Case study format is effective here because ${reasons.join(', ')}.`
                    : 'Case studies build trust and credibility in competitive niches.',
            exampleTitle: `How I Used ${kw} to Achieve Real Results (Case Study)`,
            isShortForm: false,
        });
    }

    // --- COMMENTARY ---
    {
        let score = 40;
        const reasons: string[] = [];
        if (input.growthScore > 70) {
            score += 20;
            reasons.push('fast-moving niche creates constant commentary opportunities');
        }
        if (input.freshnessGap > 60) {
            score += 10;
            reasons.push('content freshness gap means audiences want timely takes');
        }
        results.push({
            format: 'COMMENTARY',
            label: FORMAT_LABELS.COMMENTARY,
            successLikelihood: Math.min(100, score),
            reasoning:
                reasons.length > 0
                    ? `Commentary works here because ${reasons.join(', ')}.`
                    : 'Commentary format capitalises on audience desire for informed opinions.',
            exampleTitle: `The Truth About ${kw} Nobody Is Talking About`,
            isShortForm: false,
        });
    }

    // --- SHORT_FORM ---
    {
        let score = 40;
        const reasons: string[] = [];
        if (input.freshnessGap > 50) {
            score += 30;
            reasons.push('content freshness gap creates demand for quick, current takes');
        }
        if (input.smallCreatorAdvantage > 60) {
            score += 20;
            reasons.push('small creators are thriving — algorithm rewards Shorts in this space');
        }
        results.push({
            format: 'SHORT_FORM',
            label: FORMAT_LABELS.SHORT_FORM,
            successLikelihood: Math.min(100, score),
            reasoning:
                reasons.length > 0
                    ? `Short-form is a high-leverage format here because ${reasons.join(', ')}.`
                    : 'Short-form content builds rapid audience awareness with minimal production cost.',
            exampleTitle: `${kw} in 60 seconds`,
            isShortForm: true,
        });
    }

    // --- DOCUMENTARY ---
    {
        let score = 40;
        results.push({
            format: 'DOCUMENTARY',
            label: FORMAT_LABELS.DOCUMENTARY,
            successLikelihood: Math.min(100, score),
            reasoning:
                'Documentary-style deep dives work for premium niches where audiences value storytelling.',
            exampleTitle: `The Real Story Behind ${kw}`,
            isShortForm: false,
        });
    }

    // --- COMPARISON ---
    {
        let score = 40;
        const reasons: string[] = [];
        if (keywordContains(kw, 'vs', 'compare', 'best', 'alternative', 'difference')) {
            score += 25;
            reasons.push('keyword signals direct comparison or decision-making intent');
        }
        if (input.monetizationScore > 65) {
            score += 15;
            reasons.push('strong monetization potential means high buyer-intent audience');
        }
        results.push({
            format: 'COMPARISON',
            label: FORMAT_LABELS.COMPARISON,
            successLikelihood: Math.min(100, score),
            reasoning:
                reasons.length > 0
                    ? `Comparison format is valuable here because ${reasons.join(', ')}.`
                    : 'Comparison content captures late-funnel decision-making searches.',
            exampleTitle: `${kw}: Which Option Is Actually Best?`,
            isShortForm: false,
        });
    }

    // --- INTERVIEW ---
    {
        const score = 40;
        results.push({
            format: 'INTERVIEW',
            label: FORMAT_LABELS.INTERVIEW,
            successLikelihood: Math.min(100, score),
            reasoning:
                'Interview format adds credibility and authority by bringing in expert voices.',
            exampleTitle: `I Interviewed 5 ${kw} Experts — Here's What They Agree On`,
            isShortForm: false,
        });
    }

    // --- CHALLENGE ---
    {
        let score = 40;
        const reasons: string[] = [];
        if (keywordContains(kw, 'fitness', 'diet', 'productivity', 'habit', 'learn')) {
            score += 15;
            reasons.push('keyword is in a behaviour-change niche where challenges resonate');
        }
        if (input.smallCreatorAdvantage > 55) {
            score += 10;
            reasons.push('small creator advantage signals authentic, personal content performs well');
        }
        results.push({
            format: 'CHALLENGE',
            label: FORMAT_LABELS.CHALLENGE,
            successLikelihood: Math.min(100, score),
            reasoning:
                reasons.length > 0
                    ? `Challenge format works here because ${reasons.join(', ')}.`
                    : 'Challenge content creates strong emotional investment and curiosity gaps.',
            exampleTitle: `I Tried ${kw} for 30 Days — Here's What Happened`,
            isShortForm: false,
        });
    }

    // Sort by successLikelihood descending
    return results.sort((a, b) => b.successLikelihood - a.successLikelihood);
}
