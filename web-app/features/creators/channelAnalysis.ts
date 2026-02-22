/**
 * @file channelAnalysis.ts
 * Pure analysis functions for the Creator & Channel Intelligence Dashboard.
 * No API calls — all functions are deterministic given the same inputs.
 */

import type {
    ChannelProfile,
    VideoPerformance,
    ChannelBenchmark,
    ContentStrategyInsight,
} from './creator-types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Clamp `value` to [0, 100]. */
function clamp100(value: number): number {
    return Math.max(0, Math.min(100, value));
}

/** Linear normalisation: map `value` from [min, max] → [0, 100]. */
function linearNorm(value: number, min: number, max: number): number {
    if (max <= min) return 0;
    return clamp100(((value - min) / (max - min)) * 100);
}

/** Return the median of a numeric array. */
function median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

/** Return the value at a given percentile (0–100) in an array. */
function percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

// ---------------------------------------------------------------------------
// Public functions
// ---------------------------------------------------------------------------

/**
 * Calculate a composite channel health score from 0–100.
 *
 * Weights:
 * - Engagement rate       (30%)  0% = 0, 5%+ = 100
 * - Upload consistency    (25%)  0/week = 0, 3+/week = 100
 * - View/subscriber ratio (25%)  0 = 0, 1.0+ = 100
 * - Outperformer ratio    (20%)  0% = 0, 40%+ = 100
 */
export function calculateChannelHealthScore(
    channel: ChannelProfile,
    videos: VideoPerformance[]
): number {
    // 30% — engagement rate (0–5% normalised)
    const engagementScore = linearNorm(channel.averageEngagementRate, 0, 0.05);

    // 25% — upload frequency (0–3 videos/week normalised)
    const uploadScore = linearNorm(channel.uploadFrequencyPerWeek, 0, 3);

    // 25% — views-per-subscriber ratio (0–1.0 normalised)
    const viewSubRatio =
        channel.subscriberCount > 0
            ? channel.averageViewsPerVideo / channel.subscriberCount
            : 0;
    const viewSubScore = linearNorm(viewSubRatio, 0, 1.0);

    // 20% — outperformer / viral ratio (0–40% normalised)
    const outperformerCount = videos.filter(
        (v) => v.performanceTier === 'OUTPERFORMER' || v.performanceTier === 'VIRAL'
    ).length;
    const outperformerRatio = videos.length > 0 ? outperformerCount / videos.length : 0;
    const outperformerScore = linearNorm(outperformerRatio, 0, 0.4);

    const composite =
        engagementScore * 0.3 +
        uploadScore * 0.25 +
        viewSubScore * 0.25 +
        outperformerScore * 0.2;

    return Math.round(clamp100(composite) * 10) / 10;
}

/**
 * Classify a single video's performance tier relative to channel averages.
 *
 * - VIRAL         : views / channelSubscribers > 3
 * - OUTPERFORMER  : views > channelAvgViews * 1.5
 * - UNDERPERFORMER: views < channelAvgViews * 0.5
 * - AVERAGE       : everything else
 */
export function classifyVideoPerformance(
    video: { views: number; likes: number; comments: number },
    channelAvgViews: number,
    channelSubscribers: number
): 'UNDERPERFORMER' | 'AVERAGE' | 'OUTPERFORMER' | 'VIRAL' {
    const viewsPerSub = channelSubscribers > 0 ? video.views / channelSubscribers : 0;

    if (viewsPerSub > 3) return 'VIRAL';
    if (video.views > channelAvgViews * 1.5) return 'OUTPERFORMER';
    if (video.views < channelAvgViews * 0.5) return 'UNDERPERFORMER';
    return 'AVERAGE';
}

/**
 * Determine the growth trajectory of a channel based on view trends.
 *
 * Splits videos into two chronological halves and compares average views.
 *
 * - ACCELERATING : second half avg > first half avg × 1.3
 * - GROWING      : second half avg > first half avg × 1.05
 * - DECLINING    : second half avg < first half avg × 0.7
 * - STAGNANT     : everything else (or < 4 videos)
 */
export function determineGrowthTrajectory(
    videos: VideoPerformance[]
): 'DECLINING' | 'STAGNANT' | 'GROWING' | 'ACCELERATING' {
    if (videos.length < 4) return 'STAGNANT';

    const sorted = [...videos].sort(
        (a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
    );

    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);

    const avgViews = (arr: VideoPerformance[]) =>
        arr.reduce((sum, v) => sum + v.views, 0) / arr.length;

    const firstAvg = avgViews(firstHalf);
    const secondAvg = avgViews(secondHalf);

    if (firstAvg === 0) return 'STAGNANT';

    if (secondAvg > firstAvg * 1.3) return 'ACCELERATING';
    if (secondAvg > firstAvg * 1.05) return 'GROWING';
    if (secondAvg < firstAvg * 0.7) return 'DECLINING';
    return 'STAGNANT';
}

/**
 * Determine the channel's competitive standing within its niche.
 *
 * Compares the channel's subscriber count against the benchmark distribution:
 *
 * - DOMINANT   : top 10% by subscribers
 * - ESTABLISHED: above median
 * - NEWCOMER   : bottom 25%
 * - CHALLENGER : everything else
 *
 * Returns 'NEWCOMER' when no benchmarks are provided.
 */
export function determineNichePosition(
    channel: ChannelProfile,
    benchmarks: ChannelBenchmark[]
): 'NEWCOMER' | 'CHALLENGER' | 'ESTABLISHED' | 'DOMINANT' {
    if (benchmarks.length === 0) return 'NEWCOMER';

    const subCounts = benchmarks.map((b) => b.subscriberCount);
    const top10pct = percentile(subCounts, 90);
    const med = median(subCounts);
    const bottom25pct = percentile(subCounts, 25);

    if (channel.subscriberCount >= top10pct) return 'DOMINANT';
    if (channel.subscriberCount >= med) return 'ESTABLISHED';
    if (channel.subscriberCount <= bottom25pct) return 'NEWCOMER';
    return 'CHALLENGER';
}

/**
 * Assess how much of a threat a competitor channel poses to the target.
 *
 * - HIGH  : competitor has > 2× target's subscribers AND topicOverlap > 70
 * - MEDIUM: competitor has > target's subscribers OR topicOverlap > 50
 * - LOW   : everything else
 */
export function calculateThreatLevel(
    competitor: ChannelBenchmark,
    target: ChannelProfile
): 'LOW' | 'MEDIUM' | 'HIGH' {
    const sizeRatio =
        target.subscriberCount > 0
            ? competitor.subscriberCount / target.subscriberCount
            : 0;

    if (sizeRatio > 2 && competitor.topicOverlap > 70) return 'HIGH';
    if (sizeRatio > 1 || competitor.topicOverlap > 50) return 'MEDIUM';
    return 'LOW';
}

// ---------------------------------------------------------------------------
// Strategy Insights
// ---------------------------------------------------------------------------

/** Format a decimal engagement rate as a percentage string, e.g. "3.4%" */
function fmtPct(rate: number): string {
    return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Generate 4–6 content strategy insights based on channel data.
 *
 * Insights are derived dynamically from the data — not hardcoded sentences.
 */
export function generateStrategyInsights(
    channel: ChannelProfile,
    videos: VideoPerformance[],
    trajectory: string
): ContentStrategyInsight[] {
    const insights: ContentStrategyInsight[] = [];

    // ── POSTING_FREQUENCY ─────────────────────────────────────────────────────
    if (channel.uploadFrequencyPerWeek < 1) {
        insights.push({
            category: 'POSTING_FREQUENCY',
            insight: `Uploading only ${channel.uploadFrequencyPerWeek.toFixed(1)} videos per week is below the threshold for consistent algorithm reach.`,
            recommendation:
                'Increase to at least 2 uploads per week to build momentum with the recommendation algorithm.',
            priority: 'HIGH',
        });
    } else if (channel.uploadFrequencyPerWeek >= 4) {
        insights.push({
            category: 'POSTING_FREQUENCY',
            insight: `Publishing ${channel.uploadFrequencyPerWeek.toFixed(1)} videos per week is aggressive — quality per video may be suffering.`,
            recommendation:
                'Consider consolidating to 2–3 high-quality uploads per week to improve per-video engagement.',
            priority: 'MEDIUM',
        });
    } else {
        insights.push({
            category: 'POSTING_FREQUENCY',
            insight: `Upload cadence of ${channel.uploadFrequencyPerWeek.toFixed(1)} videos/week is healthy for sustained discoverability.`,
            recommendation: 'Maintain this schedule and batch-produce content to avoid gaps.',
            priority: 'LOW',
        });
    }

    // ── ENGAGEMENT_TREND ──────────────────────────────────────────────────────
    const sortedByDate = [...videos].sort(
        (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
    const recentSlice = sortedByDate.slice(0, Math.max(1, Math.floor(videos.length / 2)));
    const olderSlice = sortedByDate.slice(Math.floor(videos.length / 2));

    if (recentSlice.length > 0 && olderSlice.length > 0) {
        const recentEngAvg =
            recentSlice.reduce((s, v) => s + v.engagementRate, 0) / recentSlice.length;
        const olderEngAvg =
            olderSlice.reduce((s, v) => s + v.engagementRate, 0) / olderSlice.length;

        if (recentEngAvg < olderEngAvg * 0.85) {
            insights.push({
                category: 'ENGAGEMENT_TREND',
                insight: `Engagement rate has fallen from ${fmtPct(olderEngAvg)} to ${fmtPct(recentEngAvg)} in recent videos.`,
                recommendation:
                    'Experiment with stronger CTAs ("Comment below if…") and more interactive content formats like polls or pinned questions.',
                priority: 'HIGH',
            });
        } else if (recentEngAvg >= olderEngAvg * 1.1) {
            insights.push({
                category: 'ENGAGEMENT_TREND',
                insight: `Engagement rate is trending upward (${fmtPct(olderEngAvg)} → ${fmtPct(recentEngAvg)}).`,
                recommendation: 'Double down on the formats driving this uplift — analyse your top recent videos for patterns.',
                priority: 'LOW',
            });
        } else {
            insights.push({
                category: 'ENGAGEMENT_TREND',
                insight: `Engagement rate is stable at approximately ${fmtPct(channel.averageEngagementRate)}.`,
                recommendation:
                    'Introduce community posts and Shorts to supplement long-form engagement.',
                priority: 'MEDIUM',
            });
        }
    }

    // ── CONTENT_GAP ───────────────────────────────────────────────────────────
    const underperformerCount = videos.filter(
        (v) => v.performanceTier === 'UNDERPERFORMER'
    ).length;
    const underperformerRatio = videos.length > 0 ? underperformerCount / videos.length : 0;

    if (underperformerRatio > 0.4) {
        insights.push({
            category: 'CONTENT_GAP',
            insight: `${Math.round(underperformerRatio * 100)}% of recent videos are underperforming relative to channel averages.`,
            recommendation:
                'Audit titles and thumbnails across underperformers — A/B test formats on the next 5 uploads before committing to a new content direction.',
            priority: 'HIGH',
        });
    } else if (underperformerRatio > 0.2) {
        insights.push({
            category: 'CONTENT_GAP',
            insight: `${Math.round(underperformerRatio * 100)}% of videos underperform — a minor but notable trend.`,
            recommendation:
                'Review the lowest performers for patterns in topic, format, or thumbnail style to eliminate weak content types.',
            priority: 'MEDIUM',
        });
    }

    // ── GROWTH_PATTERN ────────────────────────────────────────────────────────
    const growthInsightMap: Record<
        string,
        { insight: string; recommendation: string; priority: ContentStrategyInsight['priority'] }
    > = {
        ACCELERATING: {
            insight: 'View counts are accelerating rapidly — something is resonating with the algorithm.',
            recommendation:
                'Identify the specific content type(s) fueling this momentum and double production on them immediately.',
            priority: 'LOW',
        },
        GROWING: {
            insight: 'Channel views are on an upward trend — consistent growth is underway.',
            recommendation:
                'Extend growth by optimising metadata and end screens to retain viewers across sessions.',
            priority: 'LOW',
        },
        STAGNANT: {
            insight: 'View counts have remained flat across recent uploads — growth has plateaued.',
            recommendation:
                'Introduce a new recurring series or experiment with a trending topic outside your usual niche to reactivate the algorithm.',
            priority: 'MEDIUM',
        },
        DECLINING: {
            insight: 'View counts are declining across recent videos — the channel is losing momentum.',
            recommendation:
                'Conduct a content audit: survey your audience, analyse top-performing competitors, and pivot at least 30% of upcoming content toward under-served adjacent topics.',
            priority: 'HIGH',
        },
    };

    const growthEntry = growthInsightMap[trajectory] ?? growthInsightMap['STAGNANT'];
    insights.push({ category: 'GROWTH_PATTERN', ...growthEntry });

    // ── TITLE_PATTERN ─────────────────────────────────────────────────────────
    const topByViews = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);
    const avgTitleLen =
        topByViews.length > 0
            ? topByViews.reduce((s, v) => s + v.title.length, 0) / topByViews.length
            : 50;

    if (avgTitleLen < 40) {
        insights.push({
            category: 'TITLE_PATTERN',
            insight: `Top-performing videos have short titles (avg ${Math.round(avgTitleLen)} chars) — punchy and direct.`,
            recommendation:
                'Continue using concise titles under 60 characters — they tend to perform better in mobile search results.',
            priority: 'LOW',
        });
    } else if (avgTitleLen > 70) {
        insights.push({
            category: 'TITLE_PATTERN',
            insight: `Top video titles average ${Math.round(avgTitleLen)} characters — potentially getting truncated in search results.`,
            recommendation:
                'Front-load the most important keyword in the first 50 characters of every title.',
            priority: 'MEDIUM',
        });
    } else {
        insights.push({
            category: 'TITLE_PATTERN',
            insight: `Top video titles are a moderate length (avg ${Math.round(avgTitleLen)} chars) — a balanced approach.`,
            recommendation:
                'Test a handful of highly emotional or curiosity-gap titles (e.g. "I was wrong about…") to compare click-through rates.',
            priority: 'LOW',
        });
    }

    // Return between 4 and 6 insights, sorted HIGH → LOW priority
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return insights
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        .slice(0, 6);
}
