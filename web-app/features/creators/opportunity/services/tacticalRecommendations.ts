import { AttackOpportunity } from '../types';

/**
 * Fills in narrative fields for scored opportunities.
 */
export function generateTacticalRecommendations(opportunities: AttackOpportunity[], channelName: string): AttackOpportunity[] {
    return opportunities.map(opp => {
        // whyItsHot
        let whyItsHot = `${opp.topic} is gaining traction with ${opp.risingQueriesCount} rising search queries.`;
        if (opp.searchGrowthRate > 50) {
            whyItsHot = `Search interest is growing ${Math.round(opp.searchGrowthRate)}% — demand is accelerating.`;
        } else if (opp.newsMomentum > 70) {
            whyItsHot = `News momentum is critical — this topic is dominating the current cycle.`;
        }

        // whyCreatorIsVulnerable
        let whyCreatorIsVulnerable = `${channelName} has never published content on ${opp.topic}.`;
        if (opp.creatorAbsenceDays !== 999) {
            whyCreatorIsVulnerable = `${channelName} hasn't covered ${opp.topic} in ${opp.creatorAbsenceDays} days — audience is unserved.`;
        }
        if (opp.creatorUploadSlowing) {
            whyCreatorIsVulnerable += ` Additionally, their upload cadence is slowing while this topic peaks.`;
        }

        // suggestedAngle
        let suggestedAngle = `"Long-form analysis positioning you as the authority on ${opp.topic}`;
        if (opp.urgency === 'IMMEDIATE') {
            suggestedAngle = `Breaking news reaction — cover the latest "${opp.topNewsHeadline}" angle today`;
        } else if (opp.urgency === 'HIGH') {
            suggestedAngle = `Explainer or breakdown of ${opp.topic} for your existing audience`;
        } else if (opp.urgency === 'MEDIUM') {
            suggestedAngle = `Deep-dive guide on ${opp.topic} targeting beginner search intent`;
        }

        // sampleVideoTitle
        let sampleVideoTitle = `The Complete ${opp.topic} Guide for ${new Date().getFullYear()}`;
        if (opp.urgency === 'IMMEDIATE') {
            sampleVideoTitle = `${opp.topic}: What You Need to Know RIGHT NOW`;
        } else if (opp.opportunityScore > 90) {
            sampleVideoTitle = `I Analyzed ${opp.topic} So You Don't Have To`;
        }

        // urgencyReason
        let urgencyReason = `Steady opportunity — no immediate urgency but worth adding to your queue.`;
        if (opp.urgency === 'IMMEDIATE') {
            urgencyReason = `News cycle is active — delay means missing the peak traffic window.`;
        } else if (opp.urgency === 'HIGH') {
            urgencyReason = `Search interest is rising now — first movers will dominate rankings.`;
        } else if (opp.urgency === 'MEDIUM') {
            urgencyReason = `Growing opportunity with a 2-4 week window before saturation.`;
        }

        return {
            ...opp,
            whyItsHot,
            whyCreatorIsVulnerable,
            suggestedAngle,
            sampleVideoTitle,
            urgencyReason
        };
    });
}
