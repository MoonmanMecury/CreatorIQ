import { CreatorTopicCluster, GlobalOpportunityTopic, TopicOverlapResult, OpportunityClassification } from '../types';
import { computeKeywordOverlap } from '../utils/keywordUtils';

/**
 * Compares creator topics vs global opportunity topics to identify gaps.
 */
export function analyzeOverlap(creatorTopics: CreatorTopicCluster[], globalTopics: GlobalOpportunityTopic[]): TopicOverlapResult[] {
    const results: TopicOverlapResult[] = [];

    globalTopics.forEach(global => {
        let bestMatch: CreatorTopicCluster | null = null;
        let maxOverlap = 0;

        creatorTopics.forEach(creator => {
            const overlap = computeKeywordOverlap([global.topic, ...global.keywords], [creator.topic, ...creator.keywords]);
            if (overlap > maxOverlap) {
                maxOverlap = overlap;
                bestMatch = creator;
            }
        });

        let classification: OpportunityClassification = 'IRRELEVANT';

        if (maxOverlap >= 0.3) {
            if (global.searchDemandScore > 60 && bestMatch && !bestMatch.isCooling) {
                classification = 'COVERED_HOT';
            } else {
                classification = 'COVERED_COOLING';
            }
        } else if (global.searchDemandScore > 55) {
            classification = 'HOT_IGNORED';
        }

        results.push({
            topic: global.topic,
            keywords: global.keywords,
            classification,
            globalTopic: global,
            creatorCoverage: maxOverlap >= 0.3 ? bestMatch : null,
            demandStrength: global.searchDemandScore,
            creatorAbsenceScore: classification === 'HOT_IGNORED' ? 100 : (classification === 'COVERED_COOLING' ? 60 : 0)
        });
    });

    // Sort: HOT_IGNORED (attack zone) first
    return results.sort((a, b) => {
        const order: Record<OpportunityClassification, number> = {
            'HOT_IGNORED': 0,
            'COVERED_COOLING': 1,
            'COVERED_HOT': 2,
            'IRRELEVANT': 3
        };
        return order[a.classification] - order[b.classification];
    });
}
