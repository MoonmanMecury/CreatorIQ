/**
 * @file maturity.ts
 * Market maturity analysis utilities for the Monetization Scoring Engine.
 * All functions are pure and deterministic.
 */

import type { MarketMaturity } from './types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Determine the lifecycle stage of a market based on competition and opportunity signals.
 *
 * Rules (evaluated in priority order):
 * 1. OVERSATURATED — saturationScore > 80 AND competitionScore > 75
 * 2. MATURE        — saturationScore > 60 OR competitionScore > 65
 * 3. EARLY         — opportunityIndex > 60 AND competitionScore < 50
 * 4. DEVELOPING    — everything else
 */
export function analyzeMarketMaturity(
    competitionScore: number,
    saturationScore: number,
    opportunityIndex: number
): MarketMaturity {
    if (saturationScore > 80 && competitionScore > 75) return 'OVERSATURATED';
    if (saturationScore > 60 || competitionScore > 65) return 'MATURE';
    if (opportunityIndex > 60 && competitionScore < 50) return 'EARLY';
    return 'DEVELOPING';
}

/**
 * Convert a `MarketMaturity` stage to a monetization-friendliness score (0–100).
 *
 * - EARLY        → 65  (high upside, but market is unproven)
 * - DEVELOPING   → 90  (optimal entry point — demand exists, competition is manageable)
 * - MATURE       → 60  (established market but increasingly crowded)
 * - OVERSATURATED → 25 (very difficult to break in profitably)
 */
export function maturityToScore(maturity: MarketMaturity): number {
    const map: Record<MarketMaturity, number> = {
        EARLY: 65,
        DEVELOPING: 90,
        MATURE: 60,
        OVERSATURATED: 25,
    };
    return map[maturity];
}

/**
 * Human-readable label for a `MarketMaturity` stage.
 */
export function maturityLabel(maturity: MarketMaturity): string {
    const map: Record<MarketMaturity, string> = {
        EARLY: 'Early-Stage Market',
        DEVELOPING: 'Developing Market',
        MATURE: 'Mature Market',
        OVERSATURATED: 'Oversaturated Market',
    };
    return map[maturity];
}

/**
 * One-sentence description explaining what the maturity stage means for a new creator entering now.
 */
export function maturityDescription(maturity: MarketMaturity): string {
    const map: Record<MarketMaturity, string> = {
        EARLY:
            'This market is in its early stages — demand is emerging but the playbook is still being written, meaning high upside for those who move quickly.',
        DEVELOPING:
            'The market is actively growing with clear demand and manageable competition — the ideal window to establish a strong presence.',
        MATURE:
            'This is an established market with proven monetization, but differentiation is essential to carve out a profitable position against entrenched creators.',
        OVERSATURATED:
            'The market is highly crowded and increasingly difficult to penetrate — without a highly differentiated angle, growth will be an uphill battle.',
    };
    return map[maturity];
}
