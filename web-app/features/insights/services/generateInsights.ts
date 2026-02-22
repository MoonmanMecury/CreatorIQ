/**
 * generateInsights.ts — Aggregation service that fetches raw signals,
 * maps them into typed shape objects, runs scoring, and returns a full InsightsResponse.
 *
 * NOTE: This implementation uses SIMULATED data with deterministic variance seeded
 * from the keyword string. Replace the `buildTrendSignal` and `buildCreatorSignal`
 * functions with real API calls once `/api/trends` and `/api/youtube` are ready.
 */

import type { TrendSignal, CreatorSignal, InsightsResponse } from '../types';
import {
    calculateDemandScore,
    calculateCompetitionScore,
    calculateSaturationScore,
    calculateOpportunityScore,
    getVerdict,
    generateInsights as computeInsights,
} from '../scoring';

// ---------------------------------------------------------------------------
// Keyword hash — tiny deterministic seed so every keyword always returns the
// same values between calls, but different keywords return different values.
// ---------------------------------------------------------------------------

function hashKeyword(keyword: string): number {
    let hash = 0;
    for (let i = 0; i < keyword.length; i++) {
        hash = (hash * 31 + keyword.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
}

/** Return a pseudo-random float in [min, max] seeded by the keyword hash and an index. */
function seededFloat(seed: number, index: number, min: number, max: number): number {
    // Combine seed and index using a simple linear congruential mix
    const mixed = ((seed * 1664525 + (index * 22695477)) & 0x7fffffff) / 0x7fffffff;
    return min + mixed * (max - min);
}

// ---------------------------------------------------------------------------
// Simulated data builders
// ---------------------------------------------------------------------------

/**
 * SIMULATED — Replace with real call to the backend `/api/trends` endpoint.
 * Maps the raw Pytrends response into a TrendSignal.
 */
function buildTrendSignal(keyword: string): TrendSignal {
    const seed = hashKeyword(keyword);

    return {
        keyword,
        velocity: Math.round(seededFloat(seed, 0, 5, 95)),
        growthRate: Math.round(seededFloat(seed, 1, 0, 120)),
        regionalStrength: Math.round(seededFloat(seed, 2, 10, 90)),
        risingQueriesCount: Math.round(seededFloat(seed, 3, 0, 15)),
    };
}

/**
 * SIMULATED — Replace with real call to the backend `/api/youtube` endpoint.
 * Maps the raw YouTube Data API v3 response into a CreatorSignal.
 */
function buildCreatorSignal(keyword: string): CreatorSignal {
    const seed = hashKeyword(keyword);

    return {
        keyword,
        videoCount: Math.round(seededFloat(seed, 4, 500, 8_000_000)),
        avgViews: Math.round(seededFloat(seed, 5, 1_000, 5_000_000)),
        avgEngagement: Math.round(seededFloat(seed, 6, 5, 90)),
        topChannelSubs: Math.round(seededFloat(seed, 7, 5_000, 9_000_000)),
        uploadFrequency: parseFloat(seededFloat(seed, 8, 0.5, 18).toFixed(1)),
        smallCreatorRatio: parseFloat(seededFloat(seed, 9, 0.05, 0.95).toFixed(2)),
    };
}

// ---------------------------------------------------------------------------
// Main aggregation service
// ---------------------------------------------------------------------------

/**
 * Generate a full InsightsResponse for a given keyword.
 *
 * Flow:
 * 1. Build TrendSignal (simulated — swap for real API call)
 * 2. Build CreatorSignal (simulated — swap for real API call)
 * 3. Run all scoring functions from scoring.ts
 * 4. Produce human-readable insights
 * 5. Assemble and return InsightsResponse
 */
export async function generateInsights(keyword: string): Promise<InsightsResponse> {
    const normalised = keyword.trim().toLowerCase();

    // Step 1 & 2: Acquire signals
    // TODO: Replace these with real API calls when backend endpoints are live:
    //   const trendRaw = await apiClient.get(`/trends?topic=${encodeURIComponent(normalised)}`);
    //   const youtubeRaw = await apiClient.get(`/youtube?keyword=${encodeURIComponent(normalised)}`);
    const trend: TrendSignal = buildTrendSignal(normalised);
    const creator: CreatorSignal = buildCreatorSignal(normalised);

    // Step 3: Score each dimension
    const demandScore = calculateDemandScore(trend);
    const competitionScore = calculateCompetitionScore(creator);
    const saturationScore = calculateSaturationScore(trend, creator);
    const opportunityScore = calculateOpportunityScore(demandScore, competitionScore, saturationScore);

    // Step 4: Produce insight bullets
    const insights = computeInsights(trend, creator, {
        demand: demandScore,
        competition: competitionScore,
        saturation: saturationScore,
        opportunity: opportunityScore,
    });

    // Step 5: Assemble response
    const response: InsightsResponse = {
        keyword: normalised,
        opportunityScore,
        verdict: getVerdict(opportunityScore),
        demandScore,
        competitionScore,
        saturationScore,
        signals: { trend, creator },
        insights,
        computedAt: new Date().toISOString(),
    };

    return response;
}
