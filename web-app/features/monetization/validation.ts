/**
 * @file validation.ts
 * Engine for determining monetization verdicts, descriptions, top opportunities, and risks.
 * Pure deterministic functions.
 */

import type { MarketMaturity, MonetizationVerdict, RevenuePath, MonetizationScoreBreakdown, CpmTier } from './types';
import { cpmTierLabel } from './cpmEstimate';
import { maturityLabel } from './maturity';

/**
 * Determine the categorical monetization verdict based on the final score.
 */
export function getMonetizationVerdict(score: number): MonetizationVerdict {
    if (score <= 20) return 'POOR';
    if (score <= 40) return 'WEAK';
    if (score <= 60) return 'VIABLE';
    if (score <= 80) return 'STRONG';
    return 'ELITE';
}

/**
 * Get the display label for a monetization verdict.
 */
export function getVerdictLabel(verdict: MonetizationVerdict): string {
    const labels: Record<MonetizationVerdict, string> = {
        POOR: "Poor Monetization Potential",
        WEAK: "Weak Monetization Potential",
        VIABLE: "Viable Monetization Opportunity",
        STRONG: "Strong Monetization Opportunity",
        ELITE: "Elite Monetization Opportunity"
    };
    return labels[verdict];
}

/**
 * Generate a 2-3 sentence plain-language paragraph explaining the monetization outlook.
 */
export function getVerdictDescription(
    verdict: MonetizationVerdict,
    keyword: string,
    maturity: MarketMaturity,
    topPath: RevenuePath | undefined
): string {
    const maturityText = maturityLabel(maturity).toLowerCase();
    const nicheName = keyword.charAt(0).toUpperCase() + keyword.slice(1);

    let baseText = "";
    switch (verdict) {
        case 'ELITE':
            baseText = `${nicheName} represents a goldmine for creators. The ${maturityText} allows for significant scale with high-margin revenue streams.`;
            break;
        case 'STRONG':
            baseText = `${nicheName} shows significant commercial interest and is currently in a ${maturityText}. There is a clear path to sustainable income.`;
            break;
        case 'VIABLE':
            baseText = `The monetization potential for ${keyword} is solid, particularly as part of a ${maturityText}. You'll need to focus on specific high-converting segments.`;
            break;
        case 'WEAK':
            baseText = `While ${keyword} has some demand, the path to revenue is challenging in this ${maturityText}. You'll likely need very high volume to make it work.`;
            break;
        case 'POOR':
            baseText = `${nicheName} currently lacks strong commercial signals. In this ${maturityText}, building a significant business will be difficult without a major pivot.`;
            break;
    }

    const pathText = topPath
        ? ` Your most promising leverage point is ${topPath.label}, which aligns perfectly with audience intent here.`
        : " You'll need to experiment with multiple revenue models to find what resonates best.";

    return `${baseText}${pathText}`;
}

/**
 * Return 3-5 actionable bullet point strings based on the analysis data.
 */
export function generateTopOpportunities(
    paths: RevenuePath[],
    breakdown: MonetizationScoreBreakdown,
    cpmTier: CpmTier
): string[] {
    const opportunities: string[] = [];

    // Add logic for specific paths
    const hasAffiliate = paths.some(p => p.type === 'AFFILIATE_MARKETING' && p.confidenceScore > 70);
    if (hasAffiliate) {
        opportunities.push("Affiliate marketing is your fastest path to revenue — strong product ecosystem in this niche");
    }

    const hasCourses = paths.some(p => p.type === 'COURSES' && p.confidenceScore > 70);
    if (hasCourses) {
        opportunities.push("Course potential is strong — audience is actively seeking to learn skills");
    }

    const hasSponsorships = paths.some(p => p.type === 'SPONSORSHIPS' && p.confidenceScore > 70);
    if (hasSponsorships) {
        opportunities.push("Sponsorship demand is high — brands actively pay for access to this audience");
    }

    // Add logic for CPM
    if (cpmTier === 'PREMIUM' || cpmTier === 'HIGH') {
        opportunities.push(`${cpmTier === 'PREMIUM' ? 'Premium' : 'High'} CPM tier means ad revenue pays well at even modest view counts`);
    }

    // Add logic for audience value
    if (breakdown.audienceValue > 75) {
        opportunities.push("High audience value makes this an ideal niche for premium services or coaching");
    }

    // Fallback if too few
    if (opportunities.length < 3) {
        opportunities.push("Multi-channel revenue strategy can help stabilize monthly income");
    }

    return opportunities.slice(0, 5);
}

/**
 * Return 2-3 risk/caveat strings.
 */
export function generateRisks(
    maturity: MarketMaturity,
    competitionScore: number,
    saturationScore: number
): string[] {
    const risks: string[] = [];

    if (maturity === 'OVERSATURATED' || (maturity === 'MATURE' && saturationScore > 70)) {
        risks.push("Market is maturing rapidly — first-mover advantage is shrinking");
    }

    if (competitionScore > 70) {
        risks.push("High competition means differentiation is essential to capture ad revenue");
    }

    if (saturationScore > 60) {
        risks.push("Sponsorship rates may decline as more creators enter the space");
    }

    if (maturity === 'EARLY') {
        risks.push("Niche is still early; commercial infrastructure (like affiliate programs) may be underdeveloped");
    }

    // Ensure we have at least 2
    if (risks.length < 2) {
        risks.push("Algorithm shifts can impact discovery and subsequent ad revenue stability");
    }

    return risks.slice(0, 3);
}
