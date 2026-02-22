/**
 * @file competitionAlerts.ts
 * Generates dynamic warnings and opportunity alerts based on market signals.
 */

import { GrowthInput, GrowthAlert } from './types';

/**
 * Evaluates triggers and returns a list of actionable growth alerts.
 */
export function generateGrowthAlerts(input: GrowthInput): GrowthAlert[] {
    const alerts: GrowthAlert[] = [];

    // 1. High Competition Entry Alert
    if (input.competitionScore > 70) {
        alerts.push({
            id: "alert-comp-high",
            severity: "WARNING",
            title: "High Competition Detected",
            description: `The ${input.keyword} niche has strong existing competition. New entrants need a clear differentiation strategy to gain traction.`,
            recommendedAction: `Lead with "${input.differentiationStrategy}" positioning from your first video`,
            triggerSignal: "competitionScore",
            category: "COMPETITION"
        });
    }

    // 2. Freshness Window Alert
    if (input.freshnessGap > 65) {
        alerts.push({
            id: "alert-opp-fresh",
            severity: "INFO",
            title: "Content Freshness Window Open",
            description: "Most existing content is outdated. Publishing now gives you a first-mover advantage on fresh, current coverage.",
            recommendedAction: "Prioritize publishing your first 3 videos within the next 2 weeks to capture this gap",
            triggerSignal: "freshnessGap",
            category: "OPPORTUNITY"
        });
    }

    // 3. Market Saturation Risk
    if (input.saturationScore > 75) {
        alerts.push({
            id: "alert-comp-sat",
            severity: "WARNING",
            title: "Saturation Risk",
            description: "This niche is showing signs of content saturation. Generic content will struggle to rank or get suggested.",
            recommendedAction: "Focus exclusively on long-tail keyword variants and specific sub-niche angles",
            triggerSignal: "saturationScore",
            category: "COMPETITION"
        });
    }

    // 4. Monetization Timing Alert
    if (input.monetizationScore > 75 && input.marketMaturity === 'DEVELOPING') {
        alerts.push({
            id: "alert-mon-prime",
            severity: "INFO",
            title: "Prime Monetization Window",
            description: "High monetization potential in a developing market — brands are seeking creators before the space gets crowded.",
            recommendedAction: "Reach out to potential sponsors after your first 10 videos, even with a smaller audience",
            triggerSignal: "monetizationScore + marketMaturity",
            category: "MONETIZATION"
        });
    }

    // 5. Slow Growth Risk
    if (input.opportunityIndex < 45) {
        alerts.push({
            id: "alert-mom-slow",
            severity: "WARNING",
            title: "Below-Average Opportunity Score",
            description: "The opportunity index for this niche is below average. Growth may be slower than typical benchmarks.",
            recommendedAction: "Pivot focus to specific sub-niches from your rising keywords list to reduce competition surface",
            triggerSignal: "opportunityIndex",
            category: "MOMENTUM"
        });
    }

    // 6. Rising Keyword Alert
    if (input.risingKeywords.length > 0) {
        alerts.push({
            id: "alert-opp-rising",
            severity: "INFO",
            title: "Rising Keywords Detected",
            description: `"${input.risingKeywords.slice(0, 3).join(', ')}" are gaining search traction. Early content here ranks quickly.`,
            recommendedAction: "Add at least 2 of these rising keywords to your first month's video topics",
            triggerSignal: "risingKeywords",
            category: "OPPORTUNITY"
        });
    }

    // 7. Consistency Risk (Always Include)
    alerts.push({
        id: "alert-mom-cons",
        severity: "INFO",
        title: "Consistency Is Your Competitive Edge",
        description: `Average competitor upload frequency is ${input.avgCompetitorUploadFrequency.toFixed(1)} videos/week. Matching this is critical to signal algorithm reliability.`,
        recommendedAction: "Batch-produce your first 4 videos before publishing any to build a content buffer",
        triggerSignal: "avgCompetitorUploadFrequency",
        category: "MOMENTUM"
    });

    // Severity sorting: CRITICAL -> WARNING -> INFO
    const severityMap: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    return alerts.sort((a, b) => severityMap[a.severity] - severityMap[b.severity]);
}
