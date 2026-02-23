/**
 * @file analyzeCreator.ts
 * Creator Analysis Service — orchestrates the full channel intelligence pipeline.
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
import { youtubeApi, parseISO8601Duration } from '@/lib/youtube';

// ---------------------------------------------------------------------------
// Real Data Fetching
// ---------------------------------------------------------------------------

async function fetchChannelProfile(channelId: string): Promise<ChannelProfile> {
    const raw = await youtubeApi.fetchChannel(channelId);
    if (!raw) throw new Error("Channel not found");

    const subs = parseInt(raw.statistics.subscriberCount || '0', 10);
    const videoCount = parseInt(raw.statistics.videoCount || '0', 10);
    const views = parseInt(raw.statistics.viewCount || '0', 10);

    // Estimate upload frequency based on total videos and channel age
    const joinedAt = new Date(raw.snippet.publishedAt);
    const weeksActive = Math.max(1, (Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const uploadFrequency = parseFloat((videoCount / weeksActive).toFixed(2));

    return {
        channelId: raw.id,
        channelName: raw.snippet.title,
        handle: raw.snippet.customUrl || `@${raw.snippet.title.toLowerCase().replace(/\s+/g, '')}`,
        subscriberCount: subs,
        totalVideoCount: videoCount,
        totalViews: views,
        averageViewsPerVideo: videoCount > 0 ? Math.floor(views / videoCount) : 0,
        averageEngagementRate: 0, // Will be updated after fetching videos
        uploadFrequencyPerWeek: uploadFrequency,
        topicTags: raw.snippet.tags?.slice(0, 5) || ['Content'],
        thumbnailUrl: raw.snippet.thumbnails.high?.url || raw.snippet.thumbnails.default?.url,
        channelUrl: `https://youtube.com/channel/${raw.id}`,
        joinedDate: raw.snippet.publishedAt,
        country: raw.snippet.country || 'US',
    };
}

async function fetchVideoList(channelId: string, channel: ChannelProfile, order: string, count: number): Promise<VideoPerformance[]> {
    const videoIds = await youtubeApi.searchVideos({ channelId, order, maxResults: count });
    if (videoIds.length === 0) return [];

    const videoItems = await youtubeApi.fetchVideos(videoIds);

    return videoItems.map((v: any) => {
        const views = parseInt(v.statistics.viewCount || '0', 10);
        const likes = parseInt(v.statistics.likeCount || '0', 10);
        const comments = parseInt(v.statistics.commentCount || '0', 10);
        const engagementRate = views > 0 ? (likes + comments) / views : 0;
        const duration = v.contentDetails?.duration ? parseISO8601Duration(v.contentDetails.duration) : 0;

        return {
            videoId: v.id,
            title: v.snippet.title,
            views,
            likes,
            comments,
            publishDate: v.snippet.publishedAt,
            durationSeconds: duration,
            engagementRate: parseFloat(engagementRate.toFixed(4)),
            viewsPerSubscriber: channel.subscriberCount > 0 ? parseFloat((views / channel.subscriberCount).toFixed(4)) : 0,
            performanceTier: 'AVERAGE',
            thumbnailUrl: v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url,
            videoUrl: `https://youtube.com/watch?v=${v.id}`,
        };
    });
}

async function fetchCompetitors(channel: ChannelProfile, count: number): Promise<ChannelBenchmark[]> {
    const query = channel.topicTags.join(' ');
    const apiKey = youtubeApi.getApiKey();
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'channel');
    url.searchParams.set('maxResults', count.toString());
    url.searchParams.set('key', apiKey!);

    const searchRes = await fetch(url.toString());
    const searchData = await searchRes.json();
    const channelIds = searchData.items?.map((i: any) => i.id.channelId) || [];

    if (channelIds.length === 0) return [];

    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelIds.join(',')}&key=${apiKey}`);
    const statsData = await statsRes.json();

    return statsData.items.map((c: any) => {
        const subs = parseInt(c.statistics.subscriberCount || '0', 10);
        const views = parseInt(c.statistics.viewCount || '0', 10);
        const vCount = parseInt(c.statistics.videoCount || '0', 10);

        // Simple topic overlap estimate
        const competitorTags = c.snippet.tags || [];
        const overlap = channel.topicTags.filter(t => competitorTags.includes(t)).length;
        const topicOverlap = channel.topicTags.length > 0 ? Math.round((overlap / channel.topicTags.length) * 100) : 50;

        return {
            channelId: c.id,
            channelName: c.snippet.title,
            subscriberCount: subs,
            avgViews: vCount > 0 ? Math.floor(views / vCount) : 0,
            avgEngagement: 0.04, // Still a placeholder as fetching all videos for 6 competitors is too many API calls
            uploadFrequency: 1.0,
            topicOverlap,
            threatLevel: subs > channel.subscriberCount ? 'HIGH' : 'LOW',
        };
    });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function analyzeCreator(channelId: string): Promise<CreatorAnalysis> {
    const channel = await fetchChannelProfile(channelId);

    const [rawRecentVideos, rawTopVideos, rawCompetitors] = await Promise.all([
        fetchVideoList(channelId, channel, 'date', 20),
        fetchVideoList(channelId, channel, 'viewCount', 10),
        fetchCompetitors(channel, 6)
    ]);

    // Update channel profile with real engagement rate from recent videos
    const avgEngagement = rawRecentVideos.length > 0
        ? rawRecentVideos.reduce((acc, v) => acc + v.engagementRate, 0) / rawRecentVideos.length
        : 0;
    channel.averageEngagementRate = parseFloat(avgEngagement.toFixed(4));

    const avgViews = channel.averageViewsPerVideo;
    const subs = channel.subscriberCount;

    const recentVideos: VideoPerformance[] = rawRecentVideos.map((v) => ({
        ...v,
        performanceTier: classifyVideoPerformance(v, avgViews, subs),
    }));

    const topVideos: VideoPerformance[] = rawTopVideos.map((v) => ({
        ...v,
        performanceTier: classifyVideoPerformance(v, avgViews, subs),
    }));

    const channelHealthScore = calculateChannelHealthScore(channel, recentVideos);
    const growthTrajectory = determineGrowthTrajectory(recentVideos);
    const nichePosition = determineNichePosition(channel, rawCompetitors);
    const benchmarks = rankBenchmarks(channel, rawCompetitors);
    const strategyInsights = generateStrategyInsights(channel, recentVideos, growthTrajectory);

    return {
        channel,
        recentVideos,
        topVideos,
        benchmarks,
        strategyInsights,
        channelHealthScore,
        growthTrajectory,
        nichePosition,
        computedAt: new Date().toISOString(),
    };
}

export async function searchChannels(query: string): Promise<ChannelSearchResult[]> {
    const apiKey = youtubeApi.getApiKey();
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'channel');
    url.searchParams.set('maxResults', '5');
    url.searchParams.set('key', apiKey!);

    const res = await fetch(url.toString());
    const data = await res.json();
    const channelIds = data.items?.map((i: any) => i.id.channelId) || [];

    if (channelIds.length === 0) return [];

    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds.join(',')}&key=${apiKey}`);
    const statsData = await statsRes.json();

    const subsMap = new Map();
    statsData.items.forEach((c: any) => subsMap.set(c.id, parseInt(c.statistics.subscriberCount || '0', 10)));

    return data.items.map((item: any) => ({
        channelId: item.id.channelId,
        channelName: item.snippet.channelTitle,
        handle: `@${item.snippet.channelTitle.toLowerCase().replace(/\s+/g, '')}`,
        subscriberCount: subsMap.get(item.id.channelId) || 0,
        thumbnailUrl: item.snippet.thumbnails.default?.url,
        topicHint: 'Creator',
    }));
}
