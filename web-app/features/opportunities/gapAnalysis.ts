import { RawVideoData } from "./types";

/**
 * Clamps a number between 0 and 100.
 */
const clamp = (val: number) => Math.min(Math.max(val, 0), 100);

/**
 * High score means competition is weak and fragmented.
 * Weighted composite:
 * - 40% View-to-subscriber ratio weakness
 * - 30% Channel concentration
 * - 30% Engagement weakness
 */
export function calculateWeakCompetitionSignal(videos: RawVideoData[]): number {
    if (!videos.length) return 0;

    // 1. View-to-subscriber ratio weakness (40%)
    // ratio = views / channelSubscribers. ratio 0 = 100 score, ratio 2.0+ = 0 score.
    const ratios = videos
        .map(v => (v.channelSubscribers > 0 ? v.views / v.channelSubscribers : 0))
        .sort((a, b) => a - b);

    const medianRatio = ratios.length % 2 === 0
        ? (ratios[ratios.length / 2 - 1] + ratios[ratios.length / 2]) / 2
        : ratios[Math.floor(ratios.length / 2)];

    const ratioScore = clamp((1 - medianRatio / 2.0) * 100);

    // 2. Channel concentration (30%)
    // 100% unique = 100 score, 10% unique = 0 score.
    const uniqueChannels = new Set(videos.map(v => v.channelId)).size;
    const uniqueRatio = uniqueChannels / videos.length;
    const concentrationScore = clamp(((uniqueRatio - 0.1) / 0.9) * 100);

    // 3. Engagement weakness (30%)
    // 0% engagement = 100 score, 10%+ engagement = 0 score.
    const avgEngagement = videos.reduce((acc, v) => acc + (v.views > 0 ? (v.likes + v.comments) / v.views : 0), 0) / videos.length;
    const engagementScore = clamp((1 - avgEngagement / 0.1) * 100);

    return clamp(
        ratioScore * 0.40 +
        concentrationScore * 0.30 +
        engagementScore * 0.30
    );
}

/**
 * High score means demand exists but supply hasn't caught up.
 * Weighted composite:
 * - 35% Demand vs supply gap
 * - 35% Recency of uploads
 * - 30% Growth momentum
 */
export function calculateUnderservedDemandSignal(
    videos: RawVideoData[],
    demandScore: number,
    growthScore: number
): number {
    // 1. Demand vs supply gap (35%)
    const videoCount = videos.length;
    // supplyProxy = log-normalized video count (assuming max 10M videos ceiling like in backend)
    const supplyProxy = Math.min(100, (Math.log10(videoCount + 1) / 7.0) * 100);
    const gapScore = clamp(demandScore - supplyProxy + 50); // Offset to center at 50

    // 2. Recency of uploads (35%)
    // 0% recent = 100 score, 80%+ recent = 0.
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentCount = videos.filter(v => new Date(v.publishDate) > sixMonthsAgo).length;
    const recentRatio = recentCount / videos.length;
    const recencyScore = clamp((1 - recentRatio / 0.8) * 100);

    // 3. Growth momentum (30%)
    const growthSignal = clamp(growthScore);

    return clamp(
        gapScore * 0.35 +
        recencyScore * 0.35 +
        growthSignal * 0.30
    );
}

/**
 * High score means small creators are already outperforming.
 * Weighted composite:
 * - 50% Small creator top performance
 * - 50% Viral outlier presence
 */
export function calculateSmallCreatorAdvantageSignal(videos: RawVideoData[]): number {
    if (!videos.length) return 0;

    // 1. Small creator top performance (50%)
    // < 100k subs = small. 100% small = 100 score, 0% = 0.
    const smallCreators = videos.filter(v => v.channelSubscribers < 100000).length;
    const smallRatioScore = (smallCreators / videos.length) * 100;

    // 2. Viral outlier presence (50%)
    // views / channelSubscribers > 5. 0 outliers = 0 score, 5+ outliers = 100.
    const outliers = videos.filter(v => v.channelSubscribers > 0 && v.views / v.channelSubscribers > 5).length;
    const outlierScore = clamp((outliers / 5) * 100);

    return clamp(
        smallRatioScore * 0.50 +
        outlierScore * 0.50
    );
}

/**
 * High score means the topic is growing but content is stale.
 * Weighted composite:
 * - 50% Content age
 * - 50% Growth vs freshness mismatch
 */
export function calculateFreshnessGapSignal(videos: RawVideoData[], growthScore: number): number {
    if (!videos.length) return 0;

    // 1. Content age (50%)
    // 0 days = 0 score, 730+ days (2 yrs) = 100.
    const now = new Date();
    const ages = videos.map(v => (now.getTime() - new Date(v.publishDate).getTime()) / (1000 * 60 * 60 * 24));
    const medianAge = ages.sort((a, b) => a - b)[Math.floor(ages.length / 2)];
    const ageScore = clamp((medianAge / 730) * 100);

    // 2. Growth vs freshness mismatch (50%)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentCount = videos.filter(v => new Date(v.publishDate) > sixMonthsAgo).length;
    const recentRatio = recentCount / videos.length;
    const mismatchScore = clamp(growthScore * (1 - recentRatio));

    return clamp(
        ageScore * 0.50 +
        mismatchScore * 0.50
    );
}
