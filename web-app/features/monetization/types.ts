/**
 * @file types.ts
 * Type definitions for the Niche Validation & Monetization Scoring Engine (Step 5).
 */

import type { TrendDiscoveryData } from '@/features/trends/types';
import type { OpportunityResult } from '@/features/opportunities/types';

// Re-export for convenience when consumers only import from this module
export type { TrendDiscoveryData, OpportunityResult };

// ---------------------------------------------------------------------------
// Primitive enums / union types
// ---------------------------------------------------------------------------

/** Advertiser CPM tier for this niche. */
export type CpmTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'PREMIUM';

/** Lifecycle stage of the market / niche. */
export type MarketMaturity = 'EARLY' | 'DEVELOPING' | 'MATURE' | 'OVERSATURATED';

/** Overall monetization verdict based on composite score. */
export type MonetizationVerdict = 'POOR' | 'WEAK' | 'VIABLE' | 'STRONG' | 'ELITE';

/** All supported revenue stream types. */
export type RevenuePathType =
    | 'AD_REVENUE'
    | 'AFFILIATE_MARKETING'
    | 'SPONSORSHIPS'
    | 'COURSES'
    | 'DIGITAL_PRODUCTS'
    | 'SAAS_TOOLS'
    | 'COACHING'
    | 'PHYSICAL_PRODUCTS';

// ---------------------------------------------------------------------------
// Revenue path
// ---------------------------------------------------------------------------

/** A single viable monetization pathway for this niche. */
export interface RevenuePath {
    /** Identifies which revenue model this represents. */
    type: RevenuePathType;
    /** Human-readable name shown in the UI, e.g. "Affiliate Marketing". */
    label: string;
    /** 0–100 score indicating how viable this path is for the keyword/niche. */
    confidenceScore: number;
    /** One-sentence explanation of why this path scores the way it does. */
    reasoning: string;
    /** Approximate time horizon before meaningful revenue can be generated. */
    estimatedTimeToRevenue: 'WEEKS' | 'MONTHS' | 'LONG_TERM';
}

// ---------------------------------------------------------------------------
// Score breakdown
// ---------------------------------------------------------------------------

/** Granular component scores that feed into the final `monetizationScore`. */
export interface MonetizationScoreBreakdown {
    /** 0–100 estimate of advertiser demand / keyword commercial intent. */
    adDemand: number;
    /** 0–100 estimate of how valuable the target audience is to advertisers. */
    audienceValue: number;
    /** 0–100 score derived from the number and quality of viable revenue paths. */
    revenuePathScore: number;
    /** 0–100 numeric representation of the `CpmTier`. */
    cpmPotential: number;
    /** 0–100 monetization-friendliness score mapped from `MarketMaturity`. */
    marketMaturityScore: number;
}

// ---------------------------------------------------------------------------
// Top-level result
// ---------------------------------------------------------------------------

/** Full monetization analysis result returned by `getMonetizationInsights`. */
export interface MonetizationInsights {
    /** The keyword this analysis was computed for. */
    keyword: string;
    /** Final composite monetization score, 0–100. */
    monetizationScore: number;
    /** Categorical verdict bucket. */
    verdict: MonetizationVerdict;
    /** Human-readable verdict label, e.g. "Strong Monetization Opportunity". */
    verdictLabel: string;
    /** 2–3 sentence plain-language explanation of the monetization outlook. */
    verdictDescription: string;
    /** Estimated CPM tier for YouTube ad revenue in this niche. */
    cpmTier: CpmTier;
    /** Inferred lifecycle stage of the market. */
    marketMaturity: MarketMaturity;
    /** Granular score breakdown across all five dimensions. */
    breakdown: MonetizationScoreBreakdown;
    /** Viable revenue paths sorted by confidence descending. */
    revenuePaths: RevenuePath[];
    /** 3–5 actionable opportunity bullets. */
    topOpportunities: string[];
    /** 2–3 risk or caveat bullets. */
    risks: string[];
    /** ISO 8601 timestamp of when this was computed. */
    computedAt: string;
}

// ---------------------------------------------------------------------------
// Input contract
// ---------------------------------------------------------------------------

/**
 * Normalised input shape expected by `getMonetizationInsights`.
 * All fields are mapped from Step 2 (insights) and Step 3 (opportunities) data.
 */
export interface MonetizationInput {
    /** The keyword being evaluated. */
    keyword: string;
    /** Demand score from the Step 2 insights layer (0–100). */
    demandScore: number;
    /** Competition score from the Step 2 insights layer (0–100). */
    competitionScore: number;
    /** Saturation score from the Step 2 insights layer (0–100). */
    saturationScore: number;
    /** Growth / velocity score from the Step 2 insights layer (0–100). */
    growthScore: number;
    /** Opportunity index from the Step 3 gap analysis (0–100). */
    opportunityIndex: number;
    /** Average engagement rate across the top videos in this niche (as a decimal). */
    avgEngagementRate: number;
    /** Subscriber count of the largest channel found in Step 3 video data. */
    topChannelSubscribers: number;
}

// ---------------------------------------------------------------------------
// Upstream types alias (for the mapper function signature)
// ---------------------------------------------------------------------------

/** Alias for the Step 2 response shape used in `buildMonetizationInput`. */
export type InsightsResponse = TrendDiscoveryData;
