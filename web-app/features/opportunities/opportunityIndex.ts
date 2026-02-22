import { GapSignals, RawVideoData, UnderservedKeyword } from "./types";

/**
 * Calculates the final weighted Opportunity Index.
 */
export function calculateOpportunityIndex(signals: GapSignals): number {
    const index = (
        (signals.underservedDemand * 0.35) +
        (signals.weakCompetition * 0.30) +
        (signals.smallCreatorAdvantage * 0.20) +
        (signals.freshnessGap * 0.15)
    );

    return Math.round(index * 10) / 10;
}

/**
 * Classifies the opportunity index into human-readable buckets.
 */
export function getOpportunityClassification(index: number): 'POOR' | 'FAIR' | 'STRONG' | 'PRIME ENTRY' {
    if (index <= 25) return 'POOR';
    if (index <= 50) return 'FAIR';
    if (index <= 75) return 'STRONG';
    return 'PRIME ENTRY';
}

/**
 * Generates human-readable insights about the competitive landscape.
 */
export function generateCompetitionInsights(signals: GapSignals, videos: RawVideoData[]): string[] {
    const insights: string[] = [];

    // Logic based on thresholds
    const uniqueChannels = new Set(videos.map(v => v.channelId)).size;
    if (uniqueChannels / videos.length > 0.8) {
        insights.push("No dominant creator — market is fragmented and open for new entries");
    } else if (uniqueChannels / videos.length < 0.3) {
        insights.push("High concentration — a few major channels command most of the attention");
    }

    const avgEngagement = videos.reduce((acc, v) => acc + (v.views > 0 ? (v.likes + v.comments) / v.views : 0), 0) / (videos.length || 1);
    if (avgEngagement < 0.02) {
        insights.push("Low engagement across top videos — existing audience is not deeply invested");
    }

    const smallCreators = videos.filter(v => v.channelSubscribers < 100000).length;
    if (smallCreators / (videos.length || 1) > 0.5) {
        insights.push("Top results are frequently held by channels under 100K subscribers");
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const oldVideos = videos.filter(v => new Date(v.publishDate) < sixMonthsAgo).length;
    if (oldVideos / (videos.length || 1) > 0.7) {
        insights.push("Most top-performing videos are over 6 months old, showing a stale supply");
    }

    return insights.slice(0, 4);
}

/**
 * Generates actionable entry insights.
 */
export function generateEntryInsights(signals: GapSignals, keywords: UnderservedKeyword[]): string[] {
    const insights: string[] = [];

    if (signals.freshnessGap > 70) {
        insights.push("Content freshness gap detected — early mover advantage available for timely uploads");
    }

    if (signals.smallCreatorAdvantage > 60) {
        insights.push("Niche rewards quality over audience size — small creators are already seeing viral reach");
    }

    const longTailCount = keywords.filter(k => k.isLongTail).length;
    if (longTailCount > 3) {
        insights.push("Low competition found in specific long-tail keyword variants");
    }

    if (signals.underservedDemand > 70) {
        insights.push("Consistent weekly uploads could establish authority quickly while demand outpaces supply");
    }

    return insights.slice(0, 4);
}
