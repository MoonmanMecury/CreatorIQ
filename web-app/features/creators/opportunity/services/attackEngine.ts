import { AttackEngineResult, MomentumData } from '../types';
import { enhanceWithLLM } from '@/features/conductor/conductorService';
import { buildAttackEngineContext } from '@/features/conductor/contextBuilder';
import { extractCreatorTopics } from './topicExtraction';
import { buildGlobalOpportunityMap } from './globalOpportunityMap';
import { analyzeOverlap } from './overlapAnalysis';
import { scoreAttackOpportunities } from './opportunityScoring';
import { generateTacticalRecommendations } from './tacticalRecommendations';
import { calculateUploadCadence, calculateViewVelocity } from '../utils/velocityUtils';
import { fetchAndParseRss } from '../utils/rssParser';

// In-memory cache for process-level persistence
const cache = new Map<string, { result: AttackEngineResult, timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const NEWS_FEEDS = [
    'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en'
];

export async function runAttackEngine(channelId: string): Promise<AttackEngineResult> {
    const now = Date.now();
    const cached = cache.get(channelId);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
        return cached.result;
    }

    try {
        const startTime = Date.now();

        // 1. YouTube Extraction
        const creatorTopics = await extractCreatorTopics(channelId);
        const ytDataTime = Date.now();

        // 2. Momentum Data calculation (using same videos from extraction if possible)
        // For simplicity, we'll re-fetch or assume extraction returns enough
        // but here we'll simulate a bit of the fetch to get video list for velocity
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        const searchRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=50&key=${YOUTUBE_API_KEY}`
        );
        const searchData = await searchRes.json();
        if (!searchData.items || searchData.items.length === 0) {
            throw new Error('No videos found for this channel');
        }

        const videoIds = searchData.items.map((item: any) => item.id.videoId).filter(Boolean).join(',');
        if (!videoIds) throw new Error('Could not extract video IDs');

        const statsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );
        const statsData = await statsRes.json();
        if (!statsData.items || statsData.items.length === 0) {
            throw new Error('Could not fetch video statistics');
        }

        const publishDates = statsData.items.map((v: any) => v.snippet.publishedAt);
        const videosForVelocity = statsData.items.map((v: any) => ({
            views: parseInt(v.statistics?.viewCount || '0'),
            publishedAt: v.snippet.publishedAt
        }));

        const cadence = calculateUploadCadence(publishDates);
        const velocity = calculateViewVelocity(videosForVelocity);

        const momentumData: MomentumData = {
            uploadsLast30Days: publishDates.filter((d: string) => (now - new Date(d).getTime()) < (30 * 24 * 60 * 60 * 1000)).length,
            uploadsLast90Days: publishDates.filter((d: string) => (now - new Date(d).getTime()) < (90 * 24 * 60 * 60 * 1000)).length,
            avgViewsLast30Days: Math.round(videosForVelocity.slice(0, 10).reduce((a: number, b: any) => a + b.views, 0) / Math.max(1, Math.min(10, videosForVelocity.length))),
            avgViewsLast90Days: Math.round(videosForVelocity.reduce((a: number, b: any) => a + b.views, 0) / Math.max(1, videosForVelocity.length)),
            uploadCadenceTrend: cadence.trend,
            viewVelocityTrend: velocity.trend,
            engagementTrend: 'STABLE', // Simplified fallback
            topPerformingTopicLast30Days: creatorTopics[0]?.topic || 'N/A',
            slowestTopicLast30Days: creatorTopics[creatorTopics.length - 1]?.topic || 'N/A'
        };

        // 3. Global Opportunity Map
        const seedKeywords = Array.from(new Set(creatorTopics.flatMap(c => c.keywords.slice(0, 3))));
        const globalOpportunities = await buildGlobalOpportunityMap(seedKeywords);
        const trendingTime = Date.now();

        // 4. Overlap Analysis
        const overlapResults = analyzeOverlap(creatorTopics, globalOpportunities);

        // 5. News Ingestion for scoring matching
        const newsItemsArrays = await Promise.all(NEWS_FEEDS.map(url => fetchAndParseRss(url)));
        const allNewsItems = newsItemsArrays.flat();

        // 6. Scoring
        const scoredOpportunities = scoreAttackOpportunities(overlapResults, momentumData, allNewsItems);

        // 7. Tactical Recommendations
        const channelName = searchData?.items?.[0]?.snippet?.channelTitle || 'Unknown Creator';
        const finalOpportunities = generateTacticalRecommendations(scoredOpportunities, channelName);

        // 8. Strategic Summary
        const topOpp = finalOpportunities[0];
        const hotIgnoredCount = overlapResults.filter(r => r.classification === 'HOT_IGNORED').length;

        const summary = `${channelName} is currently ${momentumData.uploadCadenceTrend.toLowerCase()} in content volume. We identified ${hotIgnoredCount} critical topic gaps. The highest-leverage move is covering ${topOpp?.topic || 'N/A'}, which is currently accelerating in search demand. Acting within the next ${topOpp?.urgency === 'IMMEDIATE' ? '48 hours' : '14 days'} is recommended to capture prime traffic.`;

        const result: AttackEngineResult = {
            channelId,
            channelName,
            analyzedAt: new Date().toISOString(),
            attackOpportunities: finalOpportunities,
            creatorTopics,
            globalOpportunities,
            overlapResults,
            momentumData,
            strategicSummary: summary,
            totalHotIgnoredTopics: hotIgnoredCount,
            topUrgentOpportunity: finalOpportunities.find(o => o.urgency === 'IMMEDIATE' || o.urgency === 'HIGH') || finalOpportunities[0] || null,
            dataFreshness: {
                youtubeDataAge: Math.round((ytDataTime - startTime) / 60000),
                pytrendsDataAge: Math.round((trendingTime - ytDataTime) / 60000),
                newsDataAge: 0
            }
        };

        const enhancedResult = await enhanceWithLLM('attackEngine', result, buildAttackEngineContext, {
            strategicSummary: 'strategicSummary'
        });

        cache.set(channelId, { result: enhancedResult, timestamp: Date.now() });
        return enhancedResult;

    } catch (err) {
        console.error('[AttackEngine] Orchestration failed:', err);
        throw err;
    }
}
