/**
 * scoring.ts — Pure scoring functions for the Data Fusion & Opportunity Scoring Layer.
 *
 * All functions are pure: no side effects, no API calls, fully deterministic.
 * Each scoring function returns a clamped 0–100 value unless otherwise noted.
 */

import type { TrendSignal, CreatorSignal } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp a number between min and max (inclusive). */
function clamp(value: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Log-normalise a value to a 0–100 scale.
 * @param value   - The raw value
 * @param maxVal  - The value at which the output saturates at 100
 */
function logNormalise(value: number, maxVal: number): number {
    if (value <= 0) return 0;
    return clamp((Math.log10(value + 1) / Math.log10(maxVal + 1)) * 100);
}

// ---------------------------------------------------------------------------
// Demand Score
// ---------------------------------------------------------------------------

/**
 * Calculate the audience demand score for a keyword.
 *
 * Weights:
 * - Velocity                40 %
 * - Growth rate (0–100)     30 %
 * - Regional strength       20 %
 * - Rising queries (0→10+)  10 %
 *
 * @returns Clamped 0–100 demand score.
 */
export function calculateDemandScore(trend: TrendSignal): number {
    const velocityScore = clamp(trend.velocity);           // already 0–100
    const growthScore = clamp(trend.growthRate);           // already 0–100
    const regionalScore = clamp(trend.regionalStrength);   // already 0–100

    // Normalise rising-queries count: 0 → 0, 10+ → 100
    const risingScore = clamp((trend.risingQueriesCount / 10) * 100);

    const weighted =
        velocityScore * 0.4 +
        growthScore * 0.3 +
        regionalScore * 0.2 +
        risingScore * 0.1;

    return clamp(Math.round(weighted));
}

// ---------------------------------------------------------------------------
// Competition Score
// ---------------------------------------------------------------------------

/**
 * Calculate the competition score for a niche.
 *
 * Weights:
 * - Video count (log-normalised, 10 M = 100)           35 %
 * - Top channel subs (log-normalised, 10 M = 100)      30 %
 * - Upload frequency (0 → 0, 20+/week → 100)           20 %
 * - Small creator ratio inverted (high ratio → low comp) 15 %
 *
 * @returns Clamped 0–100 competition score (higher = more competition).
 */
export function calculateCompetitionScore(creator: CreatorSignal): number {
    const videoCountScore = logNormalise(creator.videoCount, 10_000_000);
    const topChannelSubScore = logNormalise(creator.topChannelSubs, 10_000_000);

    // Upload frequency: 20+ uploads/week = fully saturated pace
    const uploadFreqScore = clamp((creator.uploadFrequency / 20) * 100);

    // Small creator ratio inverted: many small creators = LOW competition from big players
    const smallCreatorCompScore = clamp((1 - creator.smallCreatorRatio) * 100);

    const weighted =
        videoCountScore * 0.35 +
        topChannelSubScore * 0.30 +
        uploadFreqScore * 0.20 +
        smallCreatorCompScore * 0.15;

    return clamp(Math.round(weighted));
}

// ---------------------------------------------------------------------------
// Saturation Score
// ---------------------------------------------------------------------------

/**
 * Calculate how saturated / crowded a niche is.
 *
 * Weights:
 * - Avg views per video (log-normalised, 10 M = 100)   30 %
 * - Video count score                                   25 %
 * - Top channel subs score                              25 %
 * - Small creator ratio inverted                        20 %
 *
 * @returns Clamped 0–100 saturation score (higher = more saturated).
 */
export function calculateSaturationScore(
    trend: TrendSignal,
    creator: CreatorSignal,
): number {
    // Suppress intentional unused-parameter lint for trend — reserved for future signals
    void trend;

    const avgViewsScore = logNormalise(creator.avgViews, 10_000_000);
    const videoCountScore = logNormalise(creator.videoCount, 10_000_000);
    const topChannelSubScore = logNormalise(creator.topChannelSubs, 10_000_000);
    const smallCreatorSatScore = clamp((1 - creator.smallCreatorRatio) * 100);

    const weighted =
        avgViewsScore * 0.30 +
        videoCountScore * 0.25 +
        topChannelSubScore * 0.25 +
        smallCreatorSatScore * 0.20;

    return clamp(Math.round(weighted));
}

// ---------------------------------------------------------------------------
// Opportunity Score
// ---------------------------------------------------------------------------

/**
 * Calculate the final composite opportunity score.
 *
 * Formula: opportunity = demand × (1 − competition/100) × (1 − saturation/100)
 * The raw result ranges from 0–100 at maximum demand with zero competition/saturation.
 *
 * @returns Opportunity score rounded to 1 decimal place, clamped 0–100.
 */
export function calculateOpportunityScore(
    demand: number,
    competition: number,
    saturation: number,
): number {
    const raw = demand * (1 - competition / 100) * (1 - saturation / 100);
    return clamp(Math.round(raw * 10) / 10);
}

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

/**
 * Map an opportunity score to a human-readable verdict tier.
 *
 * - 0–25  → 'LOW'
 * - 26–50 → 'MEDIUM'
 * - 51–75 → 'HIGH'
 * - 76–100 → 'GOLDMINE'
 */
export function getVerdict(
    opportunityScore: number,
): 'LOW' | 'MEDIUM' | 'HIGH' | 'GOLDMINE' {
    if (opportunityScore <= 25) return 'LOW';
    if (opportunityScore <= 50) return 'MEDIUM';
    if (opportunityScore <= 75) return 'HIGH';
    return 'GOLDMINE';
}

// ---------------------------------------------------------------------------
// Generate Insights
// ---------------------------------------------------------------------------

interface ScoreBundle {
    demand: number;
    competition: number;
    saturation: number;
    opportunity: number;
}

/**
 * Generate 3–6 human-readable insight strings based on computed scores and signals.
 * All strings are dynamically generated from score thresholds — no hardcoded copies.
 */
export function generateInsights(
    trend: TrendSignal,
    creator: CreatorSignal,
    scores: ScoreBundle,
): string[] {
    const insights: string[] = [];

    // ---- Demand insights ----
    if (scores.demand >= 75 && scores.competition < 40) {
        insights.push('High demand with low competition — strong entry window');
    } else if (scores.demand >= 75) {
        insights.push('High demand detected — validate differentiation angle before entering');
    } else if (scores.demand < 30) {
        insights.push('Low demand signals — consider targeting adjacent keywords');
    }

    // ---- Competition / creator landscape ----
    if (creator.smallCreatorRatio >= 0.6) {
        insights.push('Dominated by small creators — barrier to entry is low');
    } else if (creator.smallCreatorRatio < 0.2) {
        insights.push('Niche controlled by large established channels — difficult to break in');
    }

    // ---- Trend velocity / growth ----
    if (trend.velocity >= 60) {
        insights.push('Fast-rising keyword cluster detected — capitalize before market matures');
    } else if (trend.growthRate >= 50) {
        insights.push(`Consistent growth trend of ${Math.round(trend.growthRate)}% — stable long-term audience`);
    } else if (trend.velocity < 10 && trend.growthRate < 10) {
        insights.push('Trend is flattening — saturation window may be approaching');
    }

    // ---- Regional insights ----
    if (trend.regionalStrength >= 70) {
        insights.push('Strong regional demand concentration — geo-targeted content could dominate');
    } else if (trend.regionalStrength < 30) {
        insights.push('Broad global interest — language-specific content may unlock untapped segments');
    }

    // ---- Rising queries ----
    if (trend.risingQueriesCount >= 7) {
        insights.push(`${trend.risingQueriesCount} rising related queries signal an expanding content universe`);
    }

    // ---- Upload frequency ----
    if (creator.uploadFrequency < 3) {
        insights.push('Upload frequency is low — consistent posting schedule could dominate this niche');
    }

    // ---- Saturation ----
    if (scores.saturation >= 70) {
        insights.push('Niche is oversaturated — strong differentiation or sub-niche targeting required');
    }

    // ---- Engagement ----
    if (creator.avgEngagement >= 65) {
        insights.push('Audience engagement is unusually high — loyal community ready to grow');
    }

    // Always return between 3 and 6 insights
    return insights.slice(0, 6).length >= 3
        ? insights.slice(0, 6)
        : [...insights, 'Emerging niche with developing data signals — monitor closely'].slice(0, 6);
}
