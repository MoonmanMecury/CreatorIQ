import { TopicOverlapResult, MomentumData, AttackOpportunity, UrgencyLevel, DifficultyLevel } from '../types';
import { daysSince } from '../utils/velocityUtils';
import { computeKeywordOverlap } from '../utils/keywordUtils';

/**
 * Converts HOT_IGNORED results into scored AttackOpportunity objects.
 */
export function scoreAttackOpportunities(
    overlapResults: TopicOverlapResult[],
    momentumData: MomentumData,
    newsItems: { title: string, link: string, publishedAt: string }[]
): AttackOpportunity[] {
    const hotIgnored = overlapResults.filter(r => r.classification === 'HOT_IGNORED');

    return hotIgnored.map(result => {
        const { globalTopic, creatorCoverage } = result;

        const demandStrength = result.demandStrength;
        const searchGrowthRate_normalized = Math.min(100, Math.max(0, globalTopic.searchGrowthRate));
        const newsMomentum = globalTopic.newsVelocityScore * 100;
        const creatorAbsenceScore = result.creatorAbsenceScore;
        const uploadSlowingBonus = (momentumData.uploadCadenceTrend === 'SLOWING' || momentumData.uploadCadenceTrend === 'STALLED') ? 100 : 0;

        // Score formula
        const opportunityScore = Math.round(
            (demandStrength * 0.30) +
            (searchGrowthRate_normalized * 0.25) +
            (newsMomentum * 0.20) +
            (creatorAbsenceScore * 0.15) +
            (uploadSlowingBonus * 0.10)
        );

        // Urgency
        let urgency: UrgencyLevel = 'LOW';
        if (opportunityScore > 80 && globalTopic.newsVelocityScore > 0.7) {
            urgency = 'IMMEDIATE';
        } else if (opportunityScore > 65) {
            urgency = 'HIGH';
        } else if (opportunityScore > 45) {
            urgency = 'MEDIUM';
        }

        // Difficulty
        let difficulty: DifficultyLevel = 'MEDIUM';
        if (globalTopic.searchDemandScore > 80 && globalTopic.newsMentionCount > 20) {
            difficulty = 'HARD';
        } else if (globalTopic.searchDemandScore < 60) {
            difficulty = 'EASY';
        }

        const creatorAbsenceDays = creatorCoverage ? daysSince(creatorCoverage.lastCoveredAt) : 999;

        const competitorCoverageLevel = globalTopic.newsMentionCount > 20 ? 'MODERATE' : (globalTopic.newsMentionCount > 5 ? 'SPARSE' : 'NONE');

        // Find matching news item
        const matchingNews = newsItems
            .map(item => ({ item, overlap: computeKeywordOverlap([result.topic], extractWordsFromTitle(item.title)) }))
            .sort((a, b) => b.overlap - a.overlap)[0];

        const estimatedSearchVolumeTrend = globalTopic.searchGrowthRate > 50 ? 'ACCELERATING' : (globalTopic.searchGrowthRate > 20 ? 'RISING' : 'PEAK');

        return {
            id: `opp_${globalTopic.topic.toLowerCase().replace(/\s+/g, '_')}`,
            topic: result.topic,
            keywords: result.keywords,
            opportunityScore,
            classification: 'HOT_IGNORED' as const,
            urgency,
            difficulty,
            demandStrength,
            searchGrowthRate: globalTopic.searchGrowthRate,
            newsMomentum,
            risingQueriesCount: globalTopic.risingQueriesCount,
            creatorAbsenceDays,
            creatorUploadSlowing: uploadSlowingBonus > 0,
            competitorCoverageLevel,
            suggestedAngle: '', // Filled in next service
            whyItsHot: '',
            whyCreatorIsVulnerable: '',
            sampleVideoTitle: '',
            urgencyReason: '',
            topNewsHeadline: matchingNews?.item.title || 'Relevant industry shift detected',
            topNewsUrl: matchingNews?.item.link || '#',
            topRisingQuery: result.keywords[0] || result.topic,
            estimatedSearchVolumeTrend: estimatedSearchVolumeTrend as any
        } as AttackOpportunity;
    }).sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 10);
}

function extractWordsFromTitle(title: string): string[] {
    return title.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length >= 4);
}
