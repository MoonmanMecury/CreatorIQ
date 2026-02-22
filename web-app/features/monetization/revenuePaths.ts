/**
 * @file revenuePaths.ts
 * Evaluates each of the 8 revenue path types for a given keyword/niche.
 * Pure deterministic function — no API calls.
 */

import type { RevenuePath, RevenuePathType } from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, v));
}

/** Check if `text` contains any of the provided `signals`. */
function hasSignal(text: string, signals: string[]): boolean {
    return signals.some((s) => text.includes(s));
}

/** Count how many of the provided `signals` appear in `text`. */
function countSignals(text: string, signals: string[]): number {
    return signals.filter((s) => text.includes(s)).length;
}

// ---------------------------------------------------------------------------
// Per-path evaluators
// ---------------------------------------------------------------------------

type PathEvaluator = (
    combined: string,
    audienceValueScore: number,
    adDemandScore: number,
    competitionScore: number
) => Omit<RevenuePath, 'type'> | null;

const EVALUATORS: Record<RevenuePathType, PathEvaluator> = {

    AD_REVENUE: (_, _av, adDemandScore) => ({
        label: 'YouTube Ad Revenue',
        confidenceScore: Math.round(clamp(adDemandScore * 0.8)),
        reasoning: adDemandScore >= 70
            ? 'High advertiser demand in this niche supports strong CPM rates.'
            : adDemandScore >= 45
                ? 'Moderate advertiser interest provides a baseline ad income opportunity.'
                : 'Low commercial intent limits ad revenue potential in this niche.',
        estimatedTimeToRevenue: 'MONTHS',
    }),

    AFFILIATE_MARKETING: (combined, audienceValueScore) => {
        const productSignals = ['review', 'best', 'top', 'tool', 'software', 'buy', 'recommend', 'gear', 'product'];
        const isProductRelevant = hasSignal(combined, productSignals);
        const confidence = clamp(
            isProductRelevant ? audienceValueScore * 0.9 : audienceValueScore * 0.5
        );
        return {
            label: 'Affiliate Marketing',
            confidenceScore: Math.round(confidence),
            reasoning: isProductRelevant
                ? 'Strong product ecosystem in this niche provides high-converting affiliate opportunities.'
                : 'Audience purchasing power supports affiliate income, though direct product fit is moderate.',
            estimatedTimeToRevenue: 'MONTHS',
        };
    },

    SPONSORSHIPS: (_, audienceValueScore, adDemandScore) => {
        const confidence = audienceValueScore >= 60
            ? clamp(audienceValueScore * 0.6 + adDemandScore * 0.4)
            : clamp(audienceValueScore * 0.3);
        return {
            label: 'Brand Sponsorships',
            confidenceScore: Math.round(confidence),
            reasoning: audienceValueScore >= 60
                ? 'Brands actively pay to reach this valuable, high-intent audience.'
                : 'Audience value is modest — sponsorships are possible but rates will be lower.',
            estimatedTimeToRevenue: 'MONTHS',
        };
    },

    COURSES: (combined, audienceValueScore) => {
        const eduSignals = ['learn', 'how to', 'tutorial', 'skill', 'career', 'business', 'marketing', 'code', 'design', 'course', 'training'];
        const matchCount = countSignals(combined, eduSignals);
        const confidence = matchCount >= 2 ? 85 : matchCount === 1 ? 60 : 25;
        void audienceValueScore; // not used directly but part of signature
        return {
            label: 'Online Courses & Workshops',
            confidenceScore: Math.round(clamp(confidence)),
            reasoning: matchCount >= 2
                ? 'Strong educational intent — audience is actively seeking skills to develop and pay to learn.'
                : matchCount === 1
                    ? 'Some educational relevance — a focused course product may find a willing audience.'
                    : 'Low learning intent in this niche limits course product viability.',
            estimatedTimeToRevenue: 'MONTHS',
        };
    },

    DIGITAL_PRODUCTS: (combined, audienceValueScore) => {
        const digitalSignals = ['template', 'design', 'productivity', 'notion', 'excel', 'writing', 'planner', 'spreadsheet', 'ebook'];
        const isRelevant = hasSignal(combined, digitalSignals);
        const confidence = clamp(isRelevant ? audienceValueScore * 0.7 : audienceValueScore * 0.35);
        return {
            label: 'Digital Products & Downloads',
            confidenceScore: Math.round(confidence),
            reasoning: isRelevant
                ? 'Strong demand for downloadable tools, templates, or resources in this niche.'
                : 'Digital product potential exists but keyword does not strongly suggest a template-driven niche.',
            estimatedTimeToRevenue: 'MONTHS',
        };
    },

    SAAS_TOOLS: (combined) => {
        const techSignals = ['software', 'tool', 'app', 'platform', 'ai', 'automation', 'saas', 'productivity', 'dashboard', 'api', 'developer', 'coding', 'workflow'];
        const matchCount = countSignals(combined, techSignals);
        const confidence = matchCount >= 2 ? 80 : 20;
        return {
            label: 'SaaS or Tool Products',
            confidenceScore: Math.round(clamp(confidence)),
            reasoning: matchCount >= 2
                ? 'High tech-affinity niche is well-suited to a SaaS or software tool business model.'
                : 'Low technology signal — building a software tool around this niche is a long shot.',
            estimatedTimeToRevenue: 'LONG_TERM',
        };
    },

    COACHING: (combined, audienceValueScore) => {
        const coachSignals = ['business', 'fitness', 'career', 'life', 'mindset', 'coach', 'growth', 'leadership', 'entrepreneur', 'health', 'productivity'];
        const isRelevant = hasSignal(combined, coachSignals);
        const confidence = clamp(isRelevant ? audienceValueScore * 0.75 : audienceValueScore * 0.3);
        return {
            label: 'Coaching & Consulting',
            confidenceScore: Math.round(confidence),
            reasoning: isRelevant
                ? 'Audience actively seeks transformation — premium coaching or consulting is a natural fit.'
                : 'Coaching potential is limited unless content pivots toward outcome-driven personal transformation.',
            estimatedTimeToRevenue: 'MONTHS',
        };
    },

    PHYSICAL_PRODUCTS: (combined) => {
        const physicalSignals = ['gear', 'equipment', 'tools', 'apparel', 'supplement', 'recipe', 'food', 'merch', 'hardware', 'outdoor', 'sport', 'accessories'];
        const isRelevant = hasSignal(combined, physicalSignals);
        return {
            label: 'Physical Products / Merch',
            confidenceScore: isRelevant ? 70 : 25,
            reasoning: isRelevant
                ? 'Strong physical product affinity — niche lends itself to branded goods, equipment, or supplements.'
                : 'Physical product opportunity is limited without stronger product-centric keyword signals.',
            estimatedTimeToRevenue: 'LONG_TERM',
        };
    },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Evaluate all 8 revenue path types for the given keyword and scores.
 *
 * Returns only paths with `confidenceScore > 30`, sorted by confidence descending.
 * Maximum 5 paths are returned.
 */
export function detectRevenuePaths(
    keyword: string,
    audienceValueScore: number,
    adDemandScore: number,
    competitionScore: number
): RevenuePath[] {
    const combined = keyword.toLowerCase();

    const paths: RevenuePath[] = [];

    for (const [type, evaluator] of Object.entries(EVALUATORS) as [RevenuePathType, PathEvaluator][]) {
        const result = evaluator(combined, audienceValueScore, adDemandScore, competitionScore);
        if (result && result.confidenceScore > 30) {
            paths.push({ type, ...result });
        }
    }

    return paths
        .sort((a, b) => b.confidenceScore - a.confidenceScore)
        .slice(0, 5);
}
