import { ScoreHistory, SaveNichePayload, ScoreChange, FeedEvent, FeedEventType } from './types';

/**
 * Compares previous score snapshot against current scores.
 */
export function detectScoreChanges(previous: ScoreHistory, current: SaveNichePayload): ScoreChange[] {
    const metrics = [
        { key: 'opportunityScore', label: 'Opportunity Score' },
        { key: 'growthScore', label: 'Growth Score' },
        { key: 'monetizationScore', label: 'Monetization Score' },
        { key: 'competitionScore', label: 'Competition Score' },
        { key: 'demandScore', label: 'Demand Score' }
    ];

    const changes: ScoreChange[] = [];

    metrics.forEach(m => {
        const prevValue = (previous as any)[m.key] || 0;
        const currValue = (current as any)[m.key] || 0;
        const delta = currValue - prevValue;

        if (Math.abs(delta) > 0.5) {
            changes.push({
                metric: m.label,
                previousValue: prevValue,
                currentValue: currValue,
                delta,
                direction: delta > 0 ? 'UP' : 'DOWN',
                isSignificant: Math.abs(delta) > 5
            });
        }
    });

    return changes;
}

/**
 * Converts score changes into feed events.
 */
export function generateChangeEvents(
    nicheId: string,
    userId: string,
    keyword: string,
    changes: ScoreChange[]
): Omit<FeedEvent, 'id' | 'createdAt'>[] {
    return changes.map(change => {
        let eventType: FeedEventType = 'SCORE_CHANGE';
        let severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO';
        let title = `${keyword} — ${change.metric} ${change.direction === 'UP' ? 'improved' : 'declined'} by ${Math.abs(change.delta).toFixed(1)} points`;
        let description = '';

        if (change.metric === 'Opportunity Score') {
            if (change.direction === 'UP') {
                if (change.currentValue > 75) {
                    eventType = 'BREAKOUT';
                    description = `High-potential breakout detected for ${keyword}! The opportunity score is now ${change.currentValue}.`;
                } else {
                    description = `Search interest and opportunity signals are improving for ${keyword}.`;
                }
            } else if (change.isSignificant) {
                severity = 'WARNING';
                description = `Significant decline in opportunity score for ${keyword}. Competition may be increasing or demand stalling.`;
            }
        } else if (change.metric === 'Competition Score' && change.direction === 'UP' && change.isSignificant) {
            eventType = 'COMPETITION_ALERT';
            severity = 'WARNING';
            description = `Competition is heating up for ${keyword}. More creators are entering this space.`;
        } else if (change.metric === 'Monetization Score') {
            description = `Commercial intent and revenue potential for ${keyword} have ${change.direction === 'UP' ? 'increased' : 'decreased'}.`;
        } else {
            description = `The ${change.metric.toLowerCase()} for ${keyword} has shifted from ${change.previousValue} to ${change.currentValue}.`;
        }

        return {
            savedNicheId: nicheId,
            userId,
            eventType,
            eventTitle: title,
            eventDescription: description,
            severity,
            scoreDelta: change.delta,
            metadata: {
                metric: change.metric,
                previousValue: change.previousValue,
                currentValue: change.currentValue
            }
        };
    });
}

/**
 * Pure helper for breakout logic.
 */
export function isBreakout(opportunityScore: number, verdict: string): boolean {
    return opportunityScore >= 76 && verdict === 'GOLDMINE';
}
