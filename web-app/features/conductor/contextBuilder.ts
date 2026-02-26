import { AttackEngineResult } from '../creators/opportunity/types'
import { ContentStrategy } from '../strategy/types'
import { MonetizationInsights } from '../monetization/types'
import { SynthesisResult } from '../trends/synthesizer/types'
import { GrowthBlueprint } from '../growth/types'

export function buildAttackEngineContext(result: AttackEngineResult): Record<string, unknown> {
  return {
    channelName: result.channelName,
    uploadTrend: result.momentumData.uploadCadenceTrend,
    viewTrend: result.momentumData.viewVelocityTrend,
    topCreatorTopics: result.creatorTopics.slice(0, 5).map(t => ({
      topic: t.topic,
      videoCount: t.videoCount,
      isCooling: t.isCooling,
      daysSinceLastCovered: t.recencyScore
    })),
    topAttackOpportunities: result.attackOpportunities.slice(0, 5).map(o => ({
      topic: o.topic,
      opportunityScore: o.opportunityScore,
      urgency: o.urgency,
      searchGrowthRate: o.searchGrowthRate,
      newsMomentum: o.newsMomentum,
      creatorAbsenceDays: o.creatorAbsenceDays,
      topNewsHeadline: o.topNewsHeadline,
      topRisingQuery: o.topRisingQuery
    })),
    totalHotIgnored: result.totalHotIgnoredTopics
  }
}

export function buildStrategyContext(result: ContentStrategy): Record<string, unknown> {
  return {
    keyword: result.keyword,
    topFormats: result.topFormats.slice(0, 3).map(f => f.label),
    topPillars: result.pillars.slice(0, 3).map(p => p.name),
    topGaps: result.contentGaps.slice(0, 3).map(g => g.topic),
    postingCadence: result.postingPlan.cadence,
    topDifferentiation: result.differentiationStrategies[0]?.strategy,
    videoIdeasCount: result.videoIdeas.length
  }
}

export function buildMonetizationContext(result: MonetizationInsights): Record<string, unknown> {
  return {
    keyword: result.keyword,
    monetizationScore: result.monetizationScore,
    verdict: result.verdict,
    cpmTier: result.cpmTier,
    marketMaturity: result.marketMaturity,
    topRevenuePaths: result.revenuePaths.slice(0, 3).map(p => ({
      type: p.type,
      confidence: p.confidenceScore
    })),
    adDemand: result.breakdown.adDemand,
    audienceValue: result.breakdown.audienceValue
  }
}

export function buildSynthesizerContext(result: SynthesisResult): Record<string, unknown> {
  return {
    topClusters: result.topClusters.slice(0, 5).map(c => ({
      clusterId: c.clusterId,
      topic: c.topic,
      category: c.category,
      trendScore: c.trendScore,
      momentum: c.momentum,
      firstSeenHoursAgo: c.firstSeenHoursAgo,
      velocityScore: c.velocityScore,
      topNewsTitle: c.topItems.find(i => i.source === 'NEWS')?.title
    }))
  }
}

export function buildGrowthContext(result: GrowthBlueprint): Record<string, unknown> {
  return {
    keyword: result.keyword,
    projectedAuthorityWeeks: result.projectedAuthorityWeeks,
    currentStage: result.currentStage,
    topMilestone: result.subscriberMilestones[0],
    phase1Focus: result.cadencePhases[0]?.focus,
    phase2Focus: result.cadencePhases[1]?.focus,
    phase3Focus: result.cadencePhases[2]?.focus,
    topPlatform: result.platformRecommendations[1]?.label,
    topAlert: result.alerts[0]?.title,
    weeklyHoursAtLaunch: result.totalWeeklyHoursAtLaunch
  }
}
