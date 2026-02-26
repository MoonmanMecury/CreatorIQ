/**
 * @file types.ts
 * Type definitions for the Creator Growth Blueprint (Step 7).
 */

import type { ContentStrategy } from '@/features/strategy/types';
import type { InsightsResponse } from '@/features/monetization/types'; // Note: InsightsResponse is aliased in monetization types
import type { OpportunityResult } from '@/features/opportunities/types';
import type { MonetizationInsights } from '@/features/monetization/types';

/** Stages of creator growth from beginner to established voice. */
export type GrowthStage = 'LAUNCH' | 'TRACTION' | 'MOMENTUM' | 'AUTHORITY';

/** Social platforms for content distribution. */
export type PlatformType =
    | 'YOUTUBE'
    | 'TIKTOK'
    | 'INSTAGRAM'
    | 'LINKEDIN'
    | 'TWITTER'
    | 'NEWSLETTER'
    | 'PODCAST'
    | 'REDDIT';

/** Severity levels for growth alerts. */
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

/** Status of a KPI target relative to expected performance. */
export type KpiStatus = 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'AHEAD';

/** Represents a subscriber goal and the roadmap to achieve it. */
export interface SubscriberMilestone {
    /** Subscriber count target (e.g., 1000). */
    target: number;
    /** Human-readable label (e.g., "First 1K"). */
    label: string;
    /** Estimated weeks from channel launch to hit this. */
    estimatedWeeks: number;
    /** Range of time expected (e.g., "8–12 weeks"). */
    estimatedWeeksRange: string;
    /** Growth stage this milestone belongs to. */
    stage: GrowthStage;
    /** Features that become available at this subscriber count. */
    unlockedFeatures: string[];
    /** Revenue streams that become viable at this milestone. */
    monetizationUnlocked: string[];
    /** 3-4 specific actions required to reach this milestone. */
    keyActions: string[];
    /** Approximate views/week needed to hit target on time. */
    weeklyViewsNeeded: number;
}

/** Defines a consistent content production level for a specific time period. */
export interface CadencePhase {
    /** Phase number (1, 2, 3, 4). */
    phase: number;
    /** Label (e.g., "Weeks 1–8: Foundation"). */
    label: string;
    /** Starting week. */
    startWeek: number;
    /** Ending week (-1 means ongoing). */
    endWeek: number;
    /** Number of long-form videos per week. */
    longFormPerWeek: number;
    /** Number of short-form videos per week. */
    shortFormPerWeek: number;
    /** Total videos per week. */
    totalVideosPerWeek: number;
    /** Estimated total hours per week. */
    weeklyHoursEstimate: number;
    /** Strategic focus for this period. */
    focus: string;
    /** Content formats to prioritize. */
    formatMix: string[];
    /** Strategic reason for changing cadence at this phase. */
    rationaleForChange: string;
}

/** Recommendations for expanding content to other platforms. */
export interface PlatformRecommendation {
    /** The platform being recommended. */
    platform: PlatformType;
    /** Human-readable name. */
    label: string;
    /** 0-100 score of how well this niche fits the platform. */
    relevanceScore: number;
    /** Priority order for expansion (1 = start first). */
    priority: number;
    /** When the expansion should happen. */
    whenToStart: string;
    /** How to adapt core content for this platform. */
    contentAdaptation: string;
    /** Strategic benefit of this platform. */
    expectedBenefit: string;
    /** Additional hours per week required. */
    weeklyTimeCommitment: number;
    /** Format of content on this platform. */
    primaryContentFormat: string;
}

/** Target metric to track growth progress. */
export interface KpiTarget {
    /** Metric name (e.g., "Average Views Per Video"). */
    metric: string;
    /** The number to aim for. */
    targetValue: number;
    /** Unit (e.g., "views", "%"). */
    unit: string;
    /** When to expect to hit this target (weeks from launch). */
    timeframeWeeks: number;
    /** Growth stage this KPI target applies to. */
    stage: GrowthStage;
    /** Current status (defaults to ON_TRACK). */
    status: KpiStatus;
    /** Why this KPI matters at this stage. */
    description: string;
    /** Plan of action if performance is lacking. */
    improvementTip: string;
}

/** Risk or opportunity notification for the creator. */
export interface GrowthAlert {
    /** Unique ID. */
    id: string;
    /** Severity of the alert. */
    severity: AlertSeverity;
    /** Bold title. */
    title: string;
    /** 1-2 sentence explanation. */
    description: string;
    /** Precise action to take. */
    recommendedAction: string;
    /** Data signal that triggered this alert. */
    triggerSignal: string;
    /** Category of alert. */
    category: 'COMPETITION' | 'OPPORTUNITY' | 'MOMENTUM' | 'MONETIZATION';
}

/** Week-by-week execution plan. */
export interface WeeklySchedule {
    /** 1-indexed week number. */
    week: number;
    /** Phase number. */
    phase: number;
    /** Long-form video count. */
    longFormCount: number;
    /** Short-form video count. */
    shortFormCount: number;
    /** Primary content format for the week. */
    primaryFormat: string;
    /** Specific topic angle. */
    focusTopic: string;
    /** Target milestone for the week. */
    milestone: string | null;
}

/** Consolidated growth roadmap. */
export interface GrowthBlueprint {
    /** Seed keyword. */
    keyword: string;
    /** Executive summary (3-4 sentences). */
    executiveSummary: string;
    /** Current growth stage (starts at LAUNCH). */
    currentStage: GrowthStage;
    /** Estimated weeks to reach AUTHORITY stage. */
    projectedAuthorityWeeks: number;
    /** Key subscriber milestones. */
    subscriberMilestones: SubscriberMilestone[];
    /** Evolution of content cadence. */
    cadencePhases: CadencePhase[];
    /** Precise first 12 weeks plan. */
    first12WeeksSchedule: WeeklySchedule[];
    /** Priority platform expansion plan. */
    platformRecommendations: PlatformRecommendation[];
    /** Target metrics for each stage. */
    kpiTargets: KpiTarget[];
    /** Dynamic risk/opportunity alerts. */
    alerts: GrowthAlert[];
    /** Required hours at start. */
    totalWeeklyHoursAtLaunch: number;
    /** Required hours at full scale. */
    totalWeeklyHoursAtScale: number;
    /** ISO timestamp. */
    computedAt: string;
    isEnhanced?: boolean;
    llmProvider?: string;
    llmModel?: string;
}

/** Combined input for growth blueprint calculation. */
export interface GrowthInput {
    keyword: string;
    opportunityIndex: number;
    demandScore: number;
    growthScore: number;
    competitionScore: number;
    saturationScore: number;
    monetizationScore: number;
    marketMaturity: string;
    topRevenuePaths: string[];
    postingCadence: string; // LIGHT | MODERATE | AGGRESSIVE
    longFormPerWeek: number;
    shortFormPerWeek: number;
    topPillars: string[];
    topFormats: string[];
    differentiationStrategy: string;
    avgCompetitorUploadFrequency: number;
    freshnessGap: number;
    smallCreatorAdvantage: number;
    risingKeywords: string[];
}
