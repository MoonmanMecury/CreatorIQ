/**
 * @file analyzeCreator.ts
 * Creator Analysis Service — orchestrates the full channel intelligence pipeline.
 *
 * All data blocks marked "// SIMULATED" should be replaced with live
 * YouTube Data API v3 calls when moving to production (see migration notes at
 * the bottom of this file).
 *
 * All simulated data is seeded deterministically from `channelId` or `query`
 * so that the same input always produces the same output.
 */

import type {
    ChannelProfile,
    VideoPerformance,
    ChannelBenchmark,
    CreatorAnalysis,
    ChannelSearchResult,
} from '../creator-types';

import {
    classifyVideoPerformance,
    calculateChannelHealthScore,
    determineGrowthTrajectory,
    determineNichePosition,
    generateStrategyInsights,
} from '../channelAnalysis';

import { rankBenchmarks } from '../benchmarking';

// ---------------------------------------------------------------------------
// Seeded pseudo-random number generator (deterministic)
// ---------------------------------------------------------------------------

/**
 * Returns a closure that generates pseudo-random numbers in [0, 1) seeded from
 * a string. Uses a simple multiplicative hash so the same seed always produces
 * the same sequence.
 */
function makePrng(seed: string): (offset: number) => number {
    const base = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return (offset: number) => {
        const x = Math.sin(base + offset) * 10_000;
        return x - Math.floor(x);
    };
}

// ---------------------------------------------------------------------------
// Internal simulation helpers
// ---------------------------------------------------------------------------

const TOPIC_POOLS = [
    ['Tech', 'Gadgets', 'Reviews', 'Consumer Electronics'],
    ['Gaming', 'Let\'s Play', 'Esports', 'Game Reviews'],
    ['Finance', 'Investing', 'Personal Finance', 'Crypto'],
    ['Fitness', 'Health', 'Nutrition', 'Workout Routines'],
    ['Travel', 'Vlogs', 'Adventure', 'Budget Travel'],
    ['Cooking', 'Recipes', 'Food Reviews', 'Baking'],
    ['Education', 'Science', 'Explainers', 'History'],
    ['Beauty', 'Makeup', 'Skincare', 'Fashion'],
];

const COUNTRIES = ['US', 'GB', 'CA', 'AU', 'IN', 'DE', 'FR', 'BR'];

const COMPETITOR_NAMES = [
    'TechReviewPro',
    'GadgetGuru',
    'DigitalEdge',
    'TheCuriousMind',
    'NicheMaster',
    'ContentAlpha',
    'ViewBooster',
    'CreatorElite',
    'ChannelClimb',
    'NicheNinja',
];

const TOPIC_HINTS = [
    'Tech & Gadgets',
    'Gaming & Esports',
    'Finance & Investing',
    'Health & Fitness',
    'Travel & Adventure',
    'Food & Cooking',
    'Science & Education',
    'Beauty & Lifestyle',
];

const VIDEO_TITLE_TEMPLATES = [
    (kw: string, i: number) => `${kw} Ultimate Guide ${2025 + (i % 2)}`,
    (_: string, i: number) => `I Tested ${i + 3} Products So You Don\'t Have To`,
    (kw: string) => `The Truth About ${kw} (Nobody Talks About This)`,
    (kw: string, i: number) => `${kw} vs ${kw} Pro — Which One Wins? (#${i + 1})`,
    (kw: string) => `How I Mastered ${kw} in 30 Days`,
    (_: string, i: number) => `Behind the Scenes: Video ${i + 1}`,
    (kw: string) => `${kw} Myths BUSTED`,
    (kw: string, i: number) => `Top ${i + 5} ${kw} Tips for Beginners`,
    (kw: string) => `Is ${kw} Still Worth It in 2025?`,
    (kw: string) => `I Spent $1,000 on ${kw} — Here's What Happened`,
];

/** Derive a stable topic-tag pool index from a channelId. */
function topicIndex(rng: (o: number) => number): number {
    return Math.floor(rng(1) * TOPIC_POOLS.length);
}

// ---------------------------------------------------------------------------
// Simulated data constructors
// ---------------------------------------------------------------------------

/**
 * Simulate a ChannelProfile for the given channelId.
 *
 * // SIMULATED — replace with:
 *   GET https://www.googleapis.com/youtube/v3/channels
 *     ?part=snippet,statistics,brandingSettings
 *     &id={channelId}
 *   Map: snippet.title → channelName, snippet.customUrl → handle,
 *        statistics.subscriberCount → subscriberCount,
 *        statistics.videoCount → totalVideoCount,
 *        statistics.viewCount → totalViews,
 *        snippet.country → country,
 *        snippet.publishedAt → joinedDate,
 *        snippet.thumbnails.high.url → thumbnailUrl
 */
function simulateChannelProfile(channelId: string, rng: (o: number) => number): ChannelProfile {
    const tidx = topicIndex(rng);
    const topics = TOPIC_POOLS[tidx];
    const subscriberCount = Math.floor(rng(2) * 9_900_000) + 1_000; // 1K – 10M
    const totalVideoCount = Math.floor(rng(3) * 990) + 10;            // 10 – 1000
    const totalViews = subscriberCount * (Math.floor(rng(4) * 50) + 10); // realistic ratio
    const avgViews = Math.floor(totalViews / totalVideoCount);

    return {
        channelId,
        channelName: `Channel_${channelId.slice(-6)}`,
        handle: `@channel_${channelId.slice(-4).toLowerCase()}`,
        subscriberCount,
        totalVideoCount,
        totalViews,
        averageViewsPerVideo: avgViews,
        averageEngagementRate: parseFloat((rng(5) * 0.075 + 0.005).toFixed(4)), // 0.5% – 8%
        uploadFrequencyPerWeek: parseFloat((rng(6) * 4.5 + 0.5).toFixed(2)),    // 0.5 – 5/week
        topicTags: topics.slice(0, Math.floor(rng(7) * 3) + 2),
        thumbnailUrl: `https://picsum.photos/seed/${channelId}/160/160`,
        channelUrl: `https://youtube.com/channel/${channelId}`,
        joinedDate: new Date(
            Date.now() - Math.floor(rng(8) * 10 * 365.25 * 24 * 3600 * 1000)
        ).toISOString(),
        country: COUNTRIES[Math.floor(rng(9) * COUNTRIES.length)],
    };
}

/**
 * Simulate a list of VideoPerformance records.
 *
 * // SIMULATED — replace with:
 *   GET https://www.googleapis.com/youtube/v3/search
 *     ?part=snippet
 *     &channelId={channelId}
 *     &order=date          ← for recentVideos
 *     &order=viewCount     ← for topVideos
 *     &maxResults=20 (or 10)
 *     &type=video
 *   Then call videos.list?part=statistics,contentDetails&id={comma-separated ids}
 *   to get views, likes, comments, duration.
 *   Map: snippet.title → title, snippet.thumbnails.medium.url → thumbnailUrl,
 *        snippet.publishedAt → publishDate,
 *        statistics.viewCount → views, statistics.likeCount → likes,
 *        statistics.commentCount → comments,
 *        contentDetails.duration (ISO 8601) → durationSeconds
 */
function simulateVideoList(
    channelId: string,
    channel: ChannelProfile,
    count: number,
    rng: (o: number) => number,
    seed: number
): VideoPerformance[] {
    const topicTag = channel.topicTags[0] ?? 'Content';

    return Array.from({ length: count }, (_, i) => {
        const offset = seed + i * 10;
        const views = Math.floor(
            rng(offset) * channel.averageViewsPerVideo * 3 + channel.averageViewsPerVideo * 0.1
        );
        const likes = Math.floor(views * (rng(offset + 1) * 0.06 + 0.01));
        const comments = Math.floor(views * (rng(offset + 2) * 0.01 + 0.001));
        const durationSeconds = Math.floor(rng(offset + 3) * 1800) + 120; // 2–32 min
        const engagementRate = views > 0 ? (likes + comments) / views : 0;
        const viewsPerSubscriber =
            channel.subscriberCount > 0 ? views / channel.subscriberCount : 0;
        const publishDate = new Date(
            Date.now() - Math.floor(rng(offset + 4) * 365 * 24 * 3600 * 1000)
        ).toISOString();

        const titleFn = VIDEO_TITLE_TEMPLATES[i % VIDEO_TITLE_TEMPLATES.length];
        const videoId = `vid_${channelId.slice(-4)}_${i}`;

        return {
            videoId,
            title: titleFn(topicTag, i),
            views,
            likes,
            comments,
            publishDate,
            durationSeconds,
            engagementRate: parseFloat(engagementRate.toFixed(4)),
            viewsPerSubscriber: parseFloat(viewsPerSubscriber.toFixed(4)),
            // performanceTier is set after avgViews is known — placeholder here
            performanceTier: 'AVERAGE' as const,
            thumbnailUrl: `https://picsum.photos/seed/${videoId}/320/180`,
            videoUrl: `https://youtube.com/watch?v=${videoId}`,
        };
    });
}

/**
 * Simulate a list of ChannelBenchmark competitors.
 *
 * // SIMULATED — replace with:
 *   GET https://www.googleapis.com/youtube/v3/search
 *     ?part=snippet
 *     &q={channel.topicTags.join(' ')}
 *     &type=channel
 *     &maxResults=10
 *   Then channels.list?part=statistics&id={comma-separated channel ids}
 *   Map: statistics.subscriberCount → subscriberCount,
 *        statistics.viewCount / statistics.videoCount → avgViews,
 *   Derive topicOverlap from keyword cosine similarity between channel
 *   topics and competitor snippet tags.
 */
function simulateCompetitors(
    channel: ChannelProfile,
    count: number,
    rng: (o: number) => number
): ChannelBenchmark[] {
    return Array.from({ length: count }, (_, i) => {
        const offset = 1000 + i * 20;
        // Spread subs around target's subscriber count (±2 orders of magnitude)
        const subMultiplier = rng(offset) * 10 - 1; // -1 to 9× relative
        const subscriberCount = Math.max(
            1_000,
            Math.floor(channel.subscriberCount * (0.1 + rng(offset + 1) * 9))
        );
        const avgViews = Math.floor(
            subscriberCount * (rng(offset + 2) * 0.5 + 0.05)
        );
        return {
            channelId: `comp_${i}_${channel.channelId.slice(-4)}`,
            channelName: COMPETITOR_NAMES[i % COMPETITOR_NAMES.length],
            subscriberCount,
            avgViews,
            avgEngagement: parseFloat((rng(offset + 3) * 0.07 + 0.005).toFixed(4)),
            uploadFrequency: parseFloat((rng(offset + 4) * 4 + 0.5).toFixed(2)),
            topicOverlap: Math.round(rng(offset + 5) * 100),
            threatLevel: 'LOW' as const, // will be recalculated by rankBenchmarks
        };
        void subMultiplier; // consumed implicitly via rng branching
    });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run the full Creator Intelligence analysis pipeline for a given channelId.
 *
 * Execution order:
 * 1. Simulate ChannelProfile
 * 2. Simulate recentVideos (last 20)
 * 3. Simulate topVideos (top 10 by views)
 * 4. Simulate 6 competitor ChannelBenchmarks
 * 5. Classify each video's performanceTier
 * 6. Calculate channelHealthScore
 * 7. Determine growthTrajectory
 * 8. Determine nichePosition
 * 9. Rank benchmarks by threat score
 * 10. Generate strategyInsights
 * 11. Assemble and return CreatorAnalysis
 */
export async function analyzeCreator(channelId: string): Promise<CreatorAnalysis> {
    const rng = makePrng(channelId);

    // ── Step 1: Channel profile ───────────────────────────────────────────────
    // SIMULATED — replace with YouTube Data API v3 channels.list endpoint
    const channel = simulateChannelProfile(channelId, rng);

    // ── Step 2: Recent videos (last 20) ──────────────────────────────────────
    // SIMULATED — replace with YouTube Data API v3 search.list (order=date)
    // + videos.list for statistics
    const rawRecentVideos = simulateVideoList(channel.channelId, channel, 20, rng, 100);

    // ── Step 3: Top videos (top 10 by views) ─────────────────────────────────
    // SIMULATED — replace with YouTube Data API v3 search.list (order=viewCount)
    // + videos.list for statistics
    const rawTopVideos = simulateVideoList(channel.channelId, channel, 10, rng, 500);
    // Ensure top videos actually appear "top" by boosting views deterministically
    const topVideos: VideoPerformance[] = rawTopVideos
        .map((v, i) => ({
            ...v,
            views: Math.floor(channel.averageViewsPerVideo * (2 + rng(900 + i) * 8)),
        }))
        .sort((a, b) => b.views - a.views);

    // ── Step 4: Competitor benchmarks ────────────────────────────────────────
    // SIMULATED — replace with YouTube Data API v3 search.list (type=channel)
    // filtered by the channel's topic tags
    const rawCompetitors = simulateCompetitors(channel, 6, rng);

    // ── Step 5: Classify performance tier for each video ─────────────────────
    const avgViews = channel.averageViewsPerVideo;
    const subs = channel.subscriberCount;

    const recentVideos: VideoPerformance[] = rawRecentVideos.map((v) => ({
        ...v,
        performanceTier: classifyVideoPerformance(v, avgViews, subs),
    }));

    const classifiedTopVideos: VideoPerformance[] = topVideos.map((v) => ({
        ...v,
        performanceTier: classifyVideoPerformance(v, avgViews, subs),
    }));

    // ── Step 6: Channel health score ─────────────────────────────────────────
    const channelHealthScore = calculateChannelHealthScore(channel, recentVideos);

    // ── Step 7: Growth trajectory ─────────────────────────────────────────────
    const growthTrajectory = determineGrowthTrajectory(recentVideos);

    // ── Step 8: Niche position ───────────────────────────────────────────────
    const nichePosition = determineNichePosition(channel, rawCompetitors);

    // ── Step 9: Rank benchmarks by threat ────────────────────────────────────
    const benchmarks = rankBenchmarks(channel, rawCompetitors);

    // ── Step 10: Strategy insights ───────────────────────────────────────────
    const strategyInsights = generateStrategyInsights(channel, recentVideos, growthTrajectory);

    // ── Step 11: Assemble result ─────────────────────────────────────────────
    return {
        channel,
        recentVideos,
        topVideos: classifiedTopVideos,
        benchmarks,
        strategyInsights,
        channelHealthScore,
        growthTrajectory,
        nichePosition,
        computedAt: new Date().toISOString(),
    };
}

/**
 * Search for YouTube channels matching a freeform query.
 *
 * Returns 5 deterministically-simulated ChannelSearchResult records.
 *
 * // SIMULATED — replace with:
 *   GET https://www.googleapis.com/youtube/v3/search
 *     ?part=snippet
 *     &q={query}
 *     &type=channel
 *     &maxResults=5
 *   Map: snippet.channelId → channelId, snippet.channelTitle → channelName,
 *        snippet.thumbnails.default.url → thumbnailUrl.
 *   Then channels.list?part=statistics&id=... for subscriberCount.
 */
export async function searchChannels(query: string): Promise<ChannelSearchResult[]> {
    const rng = makePrng(query);

    return Array.from({ length: 5 }, (_, i) => {
        const offset = i * 50;
        const subscriberCount = Math.floor(rng(offset) * 9_900_000) + 1_000;
        const tidx = Math.floor(rng(offset + 1) * TOPIC_HINTS.length);

        // Incorporate the query into the channel name so results feel relevant
        const nameSuffix = `${query.charAt(0).toUpperCase()}${query.slice(1, 6)}`;
        const channelName = `${nameSuffix}${i === 0 ? '' : i}`;

        return {
            channelId: `UCsim${query.slice(0, 4)}${i}`,
            channelName,
            handle: `@${query.toLowerCase().replace(/\s+/g, '')}${i === 0 ? '' : i}`,
            subscriberCount,
            thumbnailUrl: `https://picsum.photos/seed/${query}${i}/80/80`,
            topicHint: TOPIC_HINTS[tidx],
        };
    });
}

// ---------------------------------------------------------------------------
// YouTube Data API v3 — Migration Notes
// ---------------------------------------------------------------------------
//
// Every "// SIMULATED" block in this file maps to a specific API call:
//
// 1. simulateChannelProfile()
//    → channels.list?part=snippet,statistics,brandingSettings&id={channelId}
//    Fields: snippet.title, snippet.customUrl, snippet.country,
//            snippet.publishedAt, snippet.thumbnails.high.url,
//            statistics.subscriberCount, statistics.viewCount,
//            statistics.videoCount
//
// 2. simulateVideoList() — recent videos
//    → search.list?part=snippet&channelId={channelId}&order=date&maxResults=20&type=video
//    + videos.list?part=statistics,contentDetails&id={comma-separated}
//    Fields: statistics.viewCount, statistics.likeCount, statistics.commentCount,
//            contentDetails.duration (parse ISO 8601 → seconds)
//
// 3. simulateVideoList() — top videos
//    → search.list?part=snippet&channelId={channelId}&order=viewCount&maxResults=10&type=video
//    + videos.list?part=statistics,contentDetails&id={comma-separated}
//
// 4. simulateCompetitors()
//    → search.list?part=snippet&q={channel.topicTags.join('+')}&type=channel&maxResults=10
//    + channels.list?part=statistics&id={comma-separated}
//    Compute topicOverlap using keyword similarity between channel tags and
//    competitor category/keywords from brandingSettings.channel.keywords.
//
// 5. searchChannels()
//    → search.list?part=snippet&q={query}&type=channel&maxResults=5
//    + channels.list?part=statistics&id={comma-separated}
