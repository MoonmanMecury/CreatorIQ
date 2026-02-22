/**
 * @file cpmEstimate.ts
 * CPM tier estimation utilities for the Monetization Scoring Engine.
 * All functions are pure and deterministic.
 */

import type { CpmTier } from './types';

// ---------------------------------------------------------------------------
// Signal word lists
// ---------------------------------------------------------------------------

const PREMIUM_SIGNALS = [
    'finance', 'financial', 'invest', 'investing', 'stock', 'stocks', 'crypto',
    'trading', 'insurance', 'legal', 'law', 'attorney', 'mortgage', 'loan',
    'retirement', 'wealth', 'fund', 'hedge', 'equity', 'forex',
];

const HIGH_SIGNALS = [
    'business', 'software', 'saas', 'b2b', 'enterprise', 'startup', 'marketing',
    'entrepreneur', 'revenue', 'coding', 'developer', 'ai', 'automation',
    'analytics', 'cloud', 'platform', 'tool', 'agency',
];

const MEDIUM_SIGNALS = [
    'education', 'course', 'career', 'health', 'fitness', 'supplement',
    'nutrition', 'diet', 'workout', 'skill', 'tutorial', 'learn',
    'certification', 'degree', 'exam', 'interview',
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Estimate the CPM tier for a niche based on audience value and keyword signals.
 *
 * Priority:
 * 1. PREMIUM — audienceValueScore ≥ 85 OR finance/insurance/legal keyword detected
 * 2. HIGH    — audienceValueScore ≥ 70 OR business/software/B2B keyword detected
 * 3. MEDIUM  — audienceValueScore ≥ 50 OR education/health/career keyword detected
 * 4. LOW     — everything else
 */
export function estimateCpmTier(keyword: string, audienceValueScore: number): CpmTier {
    const text = keyword.toLowerCase();
    const hasSignal = (signals: string[]) => signals.some((s) => text.includes(s));

    if (audienceValueScore >= 85 || hasSignal(PREMIUM_SIGNALS)) return 'PREMIUM';
    if (audienceValueScore >= 70 || hasSignal(HIGH_SIGNALS)) return 'HIGH';
    if (audienceValueScore >= 50 || hasSignal(MEDIUM_SIGNALS)) return 'MEDIUM';
    return 'LOW';
}

/**
 * Map a `CpmTier` to a numeric 0–100 score for composite calculation.
 *
 * - PREMIUM → 100
 * - HIGH    → 75
 * - MEDIUM  → 50
 * - LOW     → 25
 */
export function cpmTierToScore(tier: CpmTier): number {
    const map: Record<CpmTier, number> = {
        PREMIUM: 100,
        HIGH: 75,
        MEDIUM: 50,
        LOW: 25,
    };
    return map[tier];
}

/**
 * Human-readable CPM tier label with estimated RPM range.
 *
 * - PREMIUM → "Premium ($15–$50+ RPM)"
 * - HIGH    → "High ($8–$15 RPM)"
 * - MEDIUM  → "Medium ($3–$8 RPM)"
 * - LOW     → "Low ($1–$3 RPM)"
 */
export function cpmTierLabel(tier: CpmTier): string {
    const map: Record<CpmTier, string> = {
        PREMIUM: 'Premium ($15–$50+ RPM)',
        HIGH: 'High ($8–$15 RPM)',
        MEDIUM: 'Medium ($3–$8 RPM)',
        LOW: 'Low ($1–$3 RPM)',
    };
    return map[tier];
}
