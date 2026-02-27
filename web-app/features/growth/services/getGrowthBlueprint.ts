/**
 * @file getGrowthBlueprint.ts
 * Unified service for generating the Creator Growth Blueprint (Step 7).
 */

import {
    GrowthInput,
    GrowthBlueprint,
} from '../types';

import { generateSubscriberMilestones } from '../subscriberPlanner';
import { generateCadencePhases, generateWeeklySchedule } from '../cadencePlanner';
import { generatePlatformRecommendations } from '../platformPlanner';
import { generateKpiTargets } from '../kpiTracker';
import { generateGrowthAlerts } from '../competitionAlerts';

// Upstream types
import { InsightsResponse, MonetizationInsights } from '@/features/monetization/types';
import { OpportunityResult } from '@/features/opportunities/types';
import { ContentStrategy } from '@/features/strategy/types';
import { enhanceWithLLM } from '../../conductor/conductorService';
import { buildGrowthContext } from '../../conductor/contextBuilder';

/**
 * Orchestrates the generation of a comprehensive growth blueprint.
 * 
 * @param input - Flattened growth input signals.
 * @returns Fully populated GrowthBlueprint.
 */
export async function getGrowthBlueprint(input: GrowthInput): Promise<GrowthBlueprint> {
    const milestones = generateSubscriberMilestones(input);
    const phases = generateCadencePhases(input);
    const schedule = generateWeeklySchedule(phases, input);
    const platforms = generatePlatformRecommendations(input);
    const kpis = generateKpiTargets(input, milestones);
    const alerts = generateGrowthAlerts(input);

    const projectedAuthorityWeeks = milestones[4]?.estimatedWeeks || 120;
    const totalWeeklyHoursAtLaunch = phases[0]?.weeklyHoursEstimate || 10;
    const totalWeeklyHoursAtScale = phases[3]?.weeklyHoursEstimate || 20;

    // Executive summary generation
    const topPlatform = platforms[1]?.label || "TikTok";
    const executiveSummary = `Scaling in the ${input.keyword} niche requires a journey of approximately ${projectedAuthorityWeeks} weeks to reach authority status. By following an ${input.postingCadence.toLowerCase()} posting plan focused on ${input.topFormats[0]} content, you can break through existing competition via your "${input.differentiationStrategy}" positioning. We recommend early expansion to ${topPlatform} to leverage content repurposing for rapid discovery.`;

    const result: GrowthBlueprint = {
        keyword: input.keyword,
        executiveSummary,
        currentStage: 'LAUNCH',
        projectedAuthorityWeeks,
        subscriberMilestones: milestones,
        cadencePhases: phases,
        first12WeeksSchedule: schedule,
        platformRecommendations: platforms,
        kpiTargets: kpis,
        alerts,
        totalWeeklyHoursAtLaunch,
        totalWeeklyHoursAtScale,
        computedAt: new Date().toISOString()
    };

    // LLM Enhancement
    return enhanceWithLLM('growth', result, buildGrowthContext, {
        executiveSummary: 'executiveSummary',
        phaseDescriptions: 'cadencePhases'
    });
}

/**
 * Maps multiple upstream data layers into the GrowthInput contract.
 */
export function buildGrowthInput(
    keyword: string,
    insightsData: InsightsResponse,
    opportunityData: OpportunityResult,
    monetizationData: MonetizationInsights,
    strategyData: ContentStrategy
): GrowthInput {
    const demand = insightsData.niche_score || 50;
    const growth = insightsData.trend_velocity || 50;

    const compDensityStr = (insightsData.competition_density || "Medium").toLowerCase();
    let competition = 50;
    if (compDensityStr.includes('very high')) competition = 90;
    else if (compDensityStr.includes('high')) competition = 75;
    else if (compDensityStr.includes('medium')) competition = 50;
    else if (compDensityStr.includes('low')) competition = 25;

    return {
        keyword,
        opportunityIndex: opportunityData.opportunityIndex,
        demandScore: demand,
        growthScore: growth,
        competitionScore: competition,
        saturationScore: 100 - (opportunityData.signals?.freshnessGap || 50),
        monetizationScore: monetizationData.monetizationScore,
        marketMaturity: monetizationData.marketMaturity,
        topRevenuePaths: monetizationData.revenuePaths.map(p => p.type),
        postingCadence: strategyData.postingPlan.cadence,
        longFormPerWeek: strategyData.postingPlan.longFormPerWeek,
        shortFormPerWeek: strategyData.postingPlan.shortFormPerWeek,
        topPillars: strategyData.pillars.map(p => p.name),
        topFormats: strategyData.topFormats.map(f => f.label),
        differentiationStrategy: strategyData.differentiationStrategies[0]?.strategy || "Quality Focus",
        avgCompetitorUploadFrequency: 1.5, // Default heuristic
        freshnessGap: opportunityData.signals?.freshnessGap || 50,
        smallCreatorAdvantage: opportunityData.signals?.smallCreatorAdvantage || 50,
        risingKeywords: opportunityData.underservedKeywords.map(k => k.keyword)
    };
}
