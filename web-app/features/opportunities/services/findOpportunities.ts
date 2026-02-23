import {
    calculateWeakCompetitionSignal,
    calculateUnderservedDemandSignal,
    calculateSmallCreatorAdvantageSignal,
    calculateFreshnessGapSignal
} from "../gapAnalysis";
import {
    calculateOpportunityIndex,
    getOpportunityClassification,
    generateCompetitionInsights,
    generateEntryInsights
} from "../opportunityIndex";
import { detectBreakoutVideos } from "../breakoutDetection";
import { expandKeywords } from "../keywordExpansion";
import { OpportunityResult, RawVideoData } from "../types";
import { youtubeApi } from "@/lib/youtube";

/**
 * Fetches real video data from YouTube API v3.
 */
async function fetchYouTubeData(keyword: string): Promise<RawVideoData[]> {
    try {
        const videoIds = await youtubeApi.searchVideos({ q: keyword, maxResults: 20 });
        if (videoIds.length === 0) return [];

        const videoItems = await youtubeApi.fetchVideos(videoIds);

        const channelIds = [...new Set(videoItems.map((v: any) => v.snippet.channelId))];
        const channelDetailsRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds.join(',')}&key=${youtubeApi.getApiKey()}`);
        const channelStatsData = await channelDetailsRes.json();

        const channelMap = new Map();
        (channelStatsData.items || []).forEach((c: any) => {
            channelMap.set(c.id, {
                subs: parseInt(c.statistics.subscriberCount || '0', 10),
                videoCount: parseInt(c.statistics.videoCount || '0', 10)
            });
        });

        return videoItems.map((v: any) => {
            const chanInfo = channelMap.get(v.snippet.channelId) || { subs: 0, videoCount: 0 };
            return {
                videoId: v.id,
                title: v.snippet.title,
                views: parseInt(v.statistics.viewCount || '0', 10),
                likes: parseInt(v.statistics.likeCount || '0', 10),
                comments: parseInt(v.statistics.commentCount || '0', 10),
                publishDate: v.snippet.publishedAt,
                channelId: v.snippet.channelId,
                channelName: v.snippet.channelTitle,
                channelSubscribers: chanInfo.subs,
                channelVideoCount: chanInfo.videoCount,
                thumbnailUrl: v.snippet.thumbnails.high?.url || v.snippet.thumbnails.default?.url
            };
        });
    } catch (err) {
        console.error('[YouTube Integration] Error:', err);
        return [];
    }
}

/**
 * Main service to orchestration the opportunity discovery pipeline.
 */
export async function findOpportunities(keyword: string): Promise<OpportunityResult> {
    const rawVideos = await fetchYouTubeData(keyword);

    const totalViews = rawVideos.reduce((acc, v) => acc + v.views, 0);
    const demandScore = Math.min(100, Math.log10(totalViews + 1) * 10 + (keyword.length > 10 ? 20 : 10));

    const freshVideos = rawVideos.filter(v => {
        const ageInDays = (Date.now() - new Date(v.publishDate).getTime()) / (1000 * 60 * 60 * 24);
        return ageInDays < 30;
    }).length;
    const growthScore = Math.min(100, 20 + (freshVideos * 10));

    // Fetch real trend data (related queries) from backend
    let relatedQueries: string[] = [];
    let risingQueries: string[] = [];
    try {
        const baseUrl = process.env.PYTRENDS_BASE_URL || 'http://localhost:5087';
        const res = await fetch(`${baseUrl}/api/trends/related?keyword=${encodeURIComponent(keyword)}`);
        if (res.ok) {
            const data = await res.json();
            // Data structure from TrendsController: { keyword: string, related_queries: KeywordCluster[] }
            relatedQueries = data.related_queries?.map((q: any) => q.keyword) || [];
            // Use the top half of growth-sorted queries as "rising"
            risingQueries = [...relatedQueries].slice(0, Math.ceil(relatedQueries.length / 2));
        }
    } catch (err) {
        console.error('[Pytrends Integration] Error:', err);
        // Fallback to simple expansion if backend fails
        relatedQueries = [`best ${keyword}`, `${keyword} tutorials`];
        risingQueries = [`${keyword} 2026`];
    }

    const signals = {
        weakCompetition: Math.round(calculateWeakCompetitionSignal(rawVideos)),
        underservedDemand: Math.round(calculateUnderservedDemandSignal(rawVideos, demandScore, growthScore)),
        smallCreatorAdvantage: Math.round(calculateSmallCreatorAdvantageSignal(rawVideos)),
        freshnessGap: Math.round(calculateFreshnessGapSignal(rawVideos, growthScore))
    };

    const opportunityIndex = calculateOpportunityIndex(signals);
    const classification = getOpportunityClassification(opportunityIndex);
    const breakoutVideos = detectBreakoutVideos(rawVideos, 1.5);
    const underservedKeywords = expandKeywords(keyword, relatedQueries, risingQueries);
    const competitionInsights = generateCompetitionInsights(signals, rawVideos);
    const entryInsights = generateEntryInsights(signals, underservedKeywords);

    return {
        keyword,
        opportunityIndex,
        classification,
        signals,
        breakoutVideos,
        underservedKeywords,
        competitionInsights,
        entryInsights,
        computedAt: new Date().toISOString()
    };
}
