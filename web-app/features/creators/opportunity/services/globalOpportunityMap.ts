import { GlobalOpportunityTopic } from '../types';
import { extractKeywords, extractNamedEntities } from '../utils/keywordUtils';
import { fetchAndParseRss } from '../utils/rssParser';

const PYTRENDS_BASE_URL = process.env.PYTRENDS_BASE_URL || 'http://localhost:5087';

const NEWS_FEEDS = [
    'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en'
];

export async function buildGlobalOpportunityMap(seedKeywords: string[]): Promise<GlobalOpportunityTopic[]> {
    try {
        // Step 1 — Pytrends
        const pytrendsResults = await Promise.all(
            seedKeywords.slice(0, 15).map(async (kw) => {
                try {
                    const interestRes = await fetch(`${PYTRENDS_BASE_URL}/api/trends/interest?keyword=${encodeURIComponent(kw)}&timeframe=now+7-d`);
                    const risingRes = await fetch(`${PYTRENDS_BASE_URL}/api/trends/related?keyword=${encodeURIComponent(kw)}`);

                    const interestData = interestRes.ok ? await interestRes.json() : null;
                    const risingData = risingRes.ok ? await risingRes.json() : null;

                    return { keyword: kw, interest: interestData, rising: risingData };
                } catch (e) {
                    return { keyword: kw, interest: null, rising: null };
                }
            })
        );

        // Step 2 — Google News RSS
        const newsItemsArrays = await Promise.all(NEWS_FEEDS.map(url => fetchAndParseRss(url)));
        const allNewsItems = newsItemsArrays.flat();

        // Step 3 — Extract topics from news
        const newsTopicCounts = new Map<string, { count: number, velocity: number, keywords: Set<string> }>();
        const now = Date.now();
        const sixHoursAgo = 6 * 60 * 60 * 1000;

        allNewsItems.forEach(item => {
            const text = `${item.title} ${item.description}`;
            const kws = [...extractKeywords(text), ...extractNamedEntities(text)];
            const isRecent = (now - new Date(item.publishedAt).getTime()) < (6 * 60 * 60 * 1000);

            kws.forEach(kw => {
                const entry = newsTopicCounts.get(kw) || { count: 0, velocity: 0, keywords: new Set([kw]) };
                entry.count++;
                if (isRecent) entry.velocity++;
                newsTopicCounts.set(kw, entry);
            });
        });

        // Step 4 & 5 — Cross-reference and Assemble
        const globalTopics: GlobalOpportunityTopic[] = [];

        newsTopicCounts.forEach((stats, topic) => {
            if (stats.count < 3) return;

            const risingMatch = pytrendsResults.find(r =>
                r.rising?.related_queries?.some((q: any) => q.keyword.toLowerCase().includes(topic.toLowerCase()))
            );

            const interestMatch = pytrendsResults.find(r => r.keyword.toLowerCase() === topic.toLowerCase());

            const searchDemandScore = interestMatch?.interest?.trend_data?.reduce((a: number, b: any) => a + b.value, 0) / 12 || 40;
            const searchGrowth = interestMatch?.interest?.trend_data
                ? (interestMatch.interest.trend_data[11].value - interestMatch.interest.trend_data[0].value)
                : 20;

            const crossSourceScore = (risingMatch || interestMatch) ? 1.0 : 0.6;

            globalTopics.push({
                topic,
                keywords: Array.from(stats.keywords),
                searchDemandScore: Math.min(100, searchDemandScore),
                searchGrowthRate: searchGrowth,
                newsMentionCount: stats.count,
                newsVelocityScore: stats.velocity / (stats.count || 1),
                risingQueriesCount: risingMatch?.rising?.related_queries?.length || 0,
                crossSourceScore,
                firstDetectedAt: new Date().toISOString(),
                category: "General" // Inferred
            });
        });

        return globalTopics.sort((a, b) => (b.crossSourceScore * b.searchDemandScore) - (a.crossSourceScore * a.searchDemandScore)).slice(0, 30);
    } catch (err) {
        console.error('[GlobalOpportunityMap] Failed to build map:', err);
        return [];
    }
}
