import type { RssFeedConfig, SynthesizerConfig } from './types'

export const RSS_FEEDS: RssFeedConfig[] = [
    // Specialized category feeds first (favors them in dedup/clustering)
    { url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en', category: 'TECHNOLOGY', label: 'Technology', isKeywordFeed: false },
    { url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en', category: 'BUSINESS', label: 'Business', isKeywordFeed: false },
    { url: 'https://news.google.com/rss/headlines/section/topic/POLITICS?hl=en-US&gl=US&ceid=US:en', category: 'POLITICS', label: 'Politics', isKeywordFeed: false },
    { url: 'https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en', category: 'HEALTH', label: 'Health', isKeywordFeed: false },
    { url: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en', category: 'SCIENCE', label: 'Science', isKeywordFeed: false },
    { url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en', category: 'ENTERTAINMENT', label: 'Entertainment', isKeywordFeed: false },
    { url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en', category: 'SPORTS', label: 'Sports', isKeywordFeed: false },

    // Keyword feeds
    { url: 'https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en', category: 'TECHNOLOGY', label: 'AI', isKeywordFeed: true },
    { url: 'https://news.google.com/rss/search?q=biotech+breakthrough&hl=en-US&gl=US&ceid=US:en', category: 'SCIENCE', label: 'Biotech', isKeywordFeed: true },
    { url: 'https://news.google.com/rss/search?q=mental+health+wellness&hl=en-US&gl=US&ceid=US:en', category: 'HEALTH', label: 'Wellness', isKeywordFeed: true },
    { url: 'https://news.google.com/rss/search?q=streaming+war+netflix+disney&hl=en-US&gl=US&ceid=US:en', category: 'ENTERTAINMENT', label: 'Streaming', isKeywordFeed: true },

    // Global/General last as fallback
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', category: 'GENERAL', label: 'Google News Global', isKeywordFeed: false },
]

export const DEFAULT_CONFIG: SynthesizerConfig = {
    maxClustersToReturn: 10,
    minItemsPerCluster: 2,
    clusteringWindowHours: 48,
    breakingNewsWindowHours: 6,
    youtubeResultsPerTopic: 5,
    velocityWindowHours: 24,
}
