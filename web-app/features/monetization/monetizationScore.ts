/**
 * @file monetizationScore.ts
 * Composite monetization score calculation utilities.
 * All functions are pure and deterministic.
 */

import type { MonetizationScoreBreakdown, RevenuePath } from './types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculate the final monetization composite score (0–100).
 *
 * Weights:
 * - Ad Demand          30%
 * - Audience Value     25%
 * - Revenue Path Score 20%
 * - CPM Potential      15%
 * - Market Maturity    10%
 *
 * @returns Value rounded to 1 decimal place, clamped to 0–100.
 */
export function calculateMonetizationScore(breakdown: MonetizationScoreBreakdown): number {
    const raw =
        breakdown.adDemand * 0.3 +
        breakdown.audienceValue * 0.25 +
        breakdown.revenuePathScore * 0.2 +
        breakdown.cpmPotential * 0.15 +
        breakdown.marketMaturityScore * 0.1;

    return Math.round(Math.max(0, Math.min(100, raw)) * 10) / 10;
}

/**
 * Convert a list of viable revenue paths into a 0–100 diversity/richness score.
 *
 * Encourages having multiple paths without over-rewarding quantity past 5.
 *
 * | # of paths | Score |
 * |---|---|
 * | 0 | 0 |
 * | 1 | 30 |
 * | 2 | 50 |
 * | 3 | 65 |
 * | 4 | 80 |
 * | 5+ | 95 |
 */
export function revenuePathsToScore(paths: RevenuePath[]): number {
    const steps = [0, 30, 50, 65, 80, 95];
    const idx = Math.min(paths.length, steps.length - 1);
    return steps[idx];
}
