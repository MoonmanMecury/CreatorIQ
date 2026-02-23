import { CreatorTopicCluster } from '../types';
import { extractKeywords, extractNamedEntities, clusterKeywordsByTopic } from '../utils/keywordUtils';
import { daysSince } from '../utils/velocityUtils';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function extractCreatorTopics(channelId: string): Promise<CreatorTopicCluster[]> {
    if (!YOUTUBE_API_KEY) {
        console.warn('YOUTUBE_API_KEY is missing');
        return [];
    }

    try {
        // Step 1 — Fetch recent videos
        const searchRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=50&key=${YOUTUBE_API_KEY}`
        );
        const searchData = await searchRes.json();

        if (!searchData.items || searchData.items.length === 0) return [];

        const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

        // Step 2 — Fetch video stats
        const statsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );
        const statsData = await statsRes.json();

        // Step 3 — Extract keywords and step 4 — prepare for clustering
        const videoKeywords: string[][] = statsData.items.map((v: any) => {
            const text = `${v.snippet.title} ${v.snippet.description} ${v.snippet.tags?.join(' ') || ''}`;
            return [...extractKeywords(text), ...extractNamedEntities(text)];
        });

        // Step 4 — Cluster
        const clusters = clusterKeywordsByTopic(videoKeywords);

        // Step 5 — Assemble CreatorTopicCluster
        const result: CreatorTopicCluster[] = [];

        for (const [topic, keywords] of clusters.entries()) {
            const clusterVideos = statsData.items.filter((v: any, index: number) => {
                const words = new Set(videoKeywords[index]);
                const overlap = keywords.filter(w => words.has(w)).length;
                return overlap >= 2;
            });

            if (clusterVideos.length === 0) continue;

            const lastVideo = clusterVideos.reduce((prev: any, current: any) => {
                return new Date(prev.snippet.publishedAt) > new Date(current.snippet.publishedAt) ? prev : current;
            });

            const avgViews = clusterVideos.reduce((sum: number, v: any) => sum + parseInt(v.statistics.viewCount || '0'), 0) / clusterVideos.length;
            const lastCoveredAt = lastVideo.snippet.publishedAt;
            const videoCount = clusterVideos.length;
            const coverageScore = Math.min(videoCount / 10, 1);
            const recency = Math.max(0, 1 - (daysSince(lastCoveredAt) / 365));

            result.push({
                topic,
                keywords,
                videoCount,
                lastCoveredAt,
                avgViewsOnTopic: Math.round(avgViews),
                recencyScore: recency,
                coverageScore,
                isCooling: daysSince(lastCoveredAt) > 60
            });
        }

        return result.sort((a, b) => b.coverageScore - a.coverageScore).slice(0, 20);
    } catch (err) {
        console.error('[TopicExtraction] Failed to extract topics:', err);
        return [];
    }
}
