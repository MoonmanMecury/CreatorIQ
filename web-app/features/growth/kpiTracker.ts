/**
 * @file kpiTracker.ts
 * Defines measurable performance targets across different growth stages.
 */

import { GrowthInput, KpiTarget, SubscriberMilestone } from './types';

/**
 * Generates 8 KPI targets tailored to the niche and growth stage.
 */
export function generateKpiTargets(input: GrowthInput, milestones: SubscriberMilestone[]): KpiTarget[] {
    const kpis: KpiTarget[] = [
        // 1. Average Views (Launch)
        {
            metric: "Average Views Per Video",
            targetValue: Math.round(input.demandScore * 20),
            unit: "views",
            timeframeWeeks: milestones[0].estimatedWeeks,
            stage: "LAUNCH",
            status: "ON_TRACK",
            description: "Early benchmark to confirm algorithm is picking up content",
            improvementTip: "Improve thumbnail CTR — test 3 distinct thumbnail styles in your first 10 videos"
        },
        // 2. Click-Through Rate (Launch)
        {
            metric: "Click-Through Rate (CTR)",
            targetValue: 4.5,
            unit: "%",
            timeframeWeeks: 8,
            stage: "LAUNCH",
            status: "ON_TRACK",
            description: "CTR above 4% indicates thumbnails are compelling in this niche",
            improvementTip: "A/B test title formats — use the high-performing templates from your strategy"
        },
        // 3. Average View Duration (Launch)
        {
            metric: "Average View Duration",
            targetValue: 42,
            unit: "% of length",
            timeframeWeeks: 8,
            stage: "LAUNCH",
            status: "ON_TRACK",
            description: "40%+ average view duration signals strong content-audience fit",
            improvementTip: "Tighten intros — hook viewers in the first 30 seconds with a clear value promise"
        },
        // 4. Subscriber Conversion (Traction)
        {
            metric: "Subscriber Conversion Rate",
            targetValue: 3.2,
            unit: "% of viewers",
            timeframeWeeks: milestones[1].estimatedWeeks,
            stage: "TRACTION",
            status: "ON_TRACK",
            description: "3%+ conversion rate means content is resonating enough to build loyalty",
            improvementTip: "Add a specific subscribe CTA at the 60% mark of each video"
        },
        // 5. Engagement Rate (Traction)
        {
            metric: "Engagement Rate",
            targetValue: Math.round(input.opportunityIndex * 0.08 * 10) / 10,
            unit: "%",
            timeframeWeeks: milestones[1].estimatedWeeks,
            stage: "TRACTION",
            status: "ON_TRACK",
            description: "Engagement reflects audience investment — critical for algorithm ranking",
            improvementTip: "End every video with a direct question to the audience to prompt comments"
        },
        // 6. Weekly View Count (Momentum)
        {
            metric: "Weekly View Count",
            targetValue: milestones[2].weeklyViewsNeeded,
            unit: "views/week",
            timeframeWeeks: milestones[2].estimatedWeeks,
            stage: "MOMENTUM",
            status: "ON_TRACK",
            description: "Weekly view velocity determines algorithm momentum and growth rate",
            improvementTip: "Identify top 3 performing videos and create follow-up part 2 content"
        },
        // 7. Monthly Revenue (Momentum)
        {
            metric: "Monthly Revenue Estimate",
            targetValue: Math.round((input.monetizationScore / 100) * 500),
            unit: "USD/month",
            timeframeWeeks: milestones[2].estimatedWeeks,
            stage: "MOMENTUM",
            status: "ON_TRACK",
            description: "First meaningful revenue milestone — validates monetization pathway",
            improvementTip: "Activate affiliate links in top 10 videos first — lowest effort, fastest payoff"
        },
        // 8. Subscriber Growth Rate (Authority)
        {
            metric: "Subscribers Gained Weekly",
            targetValue: Math.round(milestones[3].target * 0.05),
            unit: "new subs/week",
            timeframeWeeks: milestones[3].estimatedWeeks,
            stage: "AUTHORITY",
            status: "ON_TRACK",
            description: "Sustained growth indicates channel has reached the compounding phase",
            improvementTip: "Collaborate with 2–3 similarly-sized channels in the niche for cross-promotion"
        }
    ];

    return kpis;
}
