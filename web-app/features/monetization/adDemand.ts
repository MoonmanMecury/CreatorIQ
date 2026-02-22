/**
 * @file adDemand.ts
 * Estimates commercial advertiser interest for a keyword/niche.
 * Pure deterministic function — no API calls.
 */

// ---------------------------------------------------------------------------
// Commercial intent signal table
// ---------------------------------------------------------------------------

/** Each entry: [signal phrase, points awarded per match] */
const INTENT_SIGNALS: [string, number][] = [
    ['best', 15],
    ['top', 15],
    ['review', 15],
    ['reviews', 15],
    ['vs', 12],
    ['versus', 12],
    ['compare', 12],
    ['comparison', 12],
    ['buy', 18],
    ['price', 18],
    ['cost', 18],
    ['cheap', 18],
    ['deal', 18],
    ['software', 14],
    ['tool', 14],
    ['app', 14],
    ['platform', 14],
    ['course', 10],
    ['tutorial', 10],
    ['learn', 10],
    ['training', 10],
    ['how to start', 12],
    ['how to make money', 12],
    ['for beginners', 12],
    ['business', 16],
    ['income', 16],
    ['profit', 16],
    ['revenue', 16],
];

/**
 * Score a list of text strings for commercial keyword intent.
 * Each matching signal word/phrase contributes its point value.
 * The total is capped at 100.
 */
function scoreKeywordIntent(texts: string[]): number {
    const combined = texts.join(' ').toLowerCase();
    let rawScore = 0;

    for (const [phrase, points] of INTENT_SIGNALS) {
        if (combined.includes(phrase)) {
            rawScore += points;
        }
    }

    return Math.min(100, rawScore);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Estimate advertiser demand for a niche using keyword intent signals.
 *
 * Step 1 — keyword intent scoring:
 *   Scan `keyword` + `relatedKeywords` for high-commercial-intent phrases.
 *   Raw score is capped at 100.
 *
 * Step 2 — blend with demand signal:
 *   adDemandScore = (keywordIntentScore × 0.6) + (demandScore × 0.4)
 *
 * @returns Clamped 0–100, rounded to 1 decimal place.
 */
export function calculateAdDemandScore(
    keyword: string,
    demandScore: number,
    relatedKeywords: string[] = []
): number {
    const allTexts = [keyword, ...relatedKeywords];
    const intentScore = scoreKeywordIntent(allTexts);

    const blended = intentScore * 0.6 + demandScore * 0.4;

    return Math.round(Math.max(0, Math.min(100, blended)) * 10) / 10;
}
