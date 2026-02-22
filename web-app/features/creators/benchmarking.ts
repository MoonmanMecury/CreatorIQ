/**
 * @file benchmarking.ts
 * Competitor benchmarking utilities for the Creator & Channel Intelligence Dashboard.
 * All functions are pure and deterministic.
 */

import type { ChannelProfile, ChannelBenchmark } from './creator-types';
import { calculateThreatLevel } from './channelAnalysis';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Clamp a value to [0, 100]. */
function clamp(value: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, value));
}

/** Format a large number with K / M suffixes. */
function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

/** Compute the median of a numeric array. */
function median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

// ---------------------------------------------------------------------------
// Public functions
// ---------------------------------------------------------------------------

/**
 * Rank competitor channels by composite threat score (descending).
 *
 * Composite threat score formula:
 *   threatScore = (topicOverlap × 0.5)
 *               + (subscriberProximity × 0.3)
 *               + (engagementScore × 0.2)
 *
 * Where:
 *   subscriberProximity = 100 − clamp(|competitor.subs − target.subs| / target.subs × 100, 0, 100)
 *   engagementScore     = clamp(competitor.avgEngagement / 0.05 × 100, 0, 100)
 *
 * Also updates the `threatLevel` property on each benchmark using
 * `calculateThreatLevel` from channelAnalysis.
 */
export function rankBenchmarks(
    target: ChannelProfile,
    competitors: ChannelBenchmark[]
): ChannelBenchmark[] {
    const scored = competitors.map((comp) => {
        const subscriberProximity =
            target.subscriberCount > 0
                ? 100 -
                clamp(
                    (Math.abs(comp.subscriberCount - target.subscriberCount) /
                        target.subscriberCount) *
                    100
                )
                : 0;

        // Normalise engagement: treat 5% (0.05) as the 100-point ceiling
        const engagementScore = clamp((comp.avgEngagement / 0.05) * 100);

        const threatScore =
            comp.topicOverlap * 0.5 +
            subscriberProximity * 0.3 +
            engagementScore * 0.2;

        const threatLevel = calculateThreatLevel(comp, target);

        return { ...comp, threatScore, threatLevel };
    });

    // Sort descending by threat score, strip the intermediate field
    return scored
        .sort((a, b) => b.threatScore - a.threatScore)
        .map(({ threatScore: _ts, ...rest }) => rest as ChannelBenchmark);
}

/**
 * Produce 2–4 human-readable benchmark comparison strings.
 *
 * Each string gives the user a quick, interpretable comparison against the
 * niche median or individual competitors.
 */
export function generateBenchmarkSummary(
    target: ChannelProfile,
    benchmarks: ChannelBenchmark[]
): string[] {
    if (benchmarks.length === 0) {
        return ['No competitor data available for this niche.'];
    }

    const summary: string[] = [];

    // 1. Subscriber comparison
    const medianSubs = median(benchmarks.map((b) => b.subscriberCount));
    if (medianSubs > 0) {
        const ratio = target.subscriberCount / medianSubs;
        if (ratio < 0.5) {
            const factor = Math.round(1 / ratio);
            summary.push(
                `You have ~${factor}× fewer subscribers than the niche average (${fmt(medianSubs)} median).`
            );
        } else if (ratio > 2) {
            const factor = Math.round(ratio);
            summary.push(
                `Your subscriber count is ~${factor}× the niche average (${fmt(medianSubs)} median) — a strong position.`
            );
        } else {
            summary.push(
                `Your subscriber count is close to the niche median of ${fmt(medianSubs)}.`
            );
        }
    }

    // 2. Engagement rate comparison
    const targetEng = target.averageEngagementRate;
    const competitorEngRates = benchmarks.map((b) => b.avgEngagement);
    const beatenCount = competitorEngRates.filter((r) => targetEng > r).length;
    const beatPct = Math.round((beatenCount / benchmarks.length) * 100);
    summary.push(
        `Your engagement rate outperforms ${beatPct}% of competitors in this niche.`
    );

    // 3. Upload frequency comparison
    const medianUpload = median(benchmarks.map((b) => b.uploadFrequency));
    if (target.uploadFrequencyPerWeek < medianUpload * 0.8) {
        summary.push(
            `Upload frequency (${target.uploadFrequencyPerWeek.toFixed(1)}/week) is below the niche median of ${medianUpload.toFixed(1)} videos/week.`
        );
    } else if (target.uploadFrequencyPerWeek >= medianUpload) {
        summary.push(
            `Upload frequency (${target.uploadFrequencyPerWeek.toFixed(1)}/week) meets or exceeds the niche median of ${medianUpload.toFixed(1)} videos/week.`
        );
    }

    // 4. Dominant channel concentration
    const highThreatCount = benchmarks.filter((b) => b.threatLevel === 'HIGH').length;
    if (highThreatCount >= 2) {
        summary.push(
            `${highThreatCount} dominant channels with high topic overlap pose a direct competitive threat.`
        );
    } else if (highThreatCount === 1) {
        const dominant = benchmarks.find((b) => b.threatLevel === 'HIGH');
        if (dominant) {
            summary.push(
                `"${dominant.channelName}" is the primary competitive threat — ${fmt(dominant.subscriberCount)} subscribers and high topic overlap.`
            );
        }
    }

    return summary.slice(0, 4);
}
