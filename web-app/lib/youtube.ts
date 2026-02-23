export interface YouTubeVideoDetail {
    videoId: string;
    title: string;
    description: string;
    views: number;
    likes: number;
    comments: number;
    publishDate: string;
    channelId: string;
    channelName: string;
    thumbnailUrl: string;
    duration: string; // ISO 8601
}

export interface YouTubeChannelDetail {
    channelId: string;
    channelName: string;
    handle: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    thumbnailUrl: string;
    joinedDate: string;
    country: string;
}

/**
 * Parses ISO 8601 duration string (e.g., PT10M30S) into total seconds.
 */
export function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return (hours * 3600) + (minutes * 60) + seconds;
}

/**
 * Shared utility for YouTube Data API v3 calls.
 */
export const youtubeApi = {
    getApiKey: () => process.env.YOUTUBE_API_KEY,

    async fetchVideos(ids: string[]): Promise<any[]> {
        const key = this.getApiKey();
        if (!key || ids.length === 0) return [];
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids.join(',')}&key=${key}`);
        const data = await res.json();
        return data.items || [];
    },

    async fetchChannel(channelId: string): Promise<any | null> {
        const key = this.getApiKey();
        if (!key) return null;
        const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${key}`);
        const data = await res.json();
        return data.items?.[0] || null;
    },

    async searchVideos(params: { q?: string, channelId?: string, order?: string, maxResults?: number }): Promise<string[]> {
        const key = this.getApiKey();
        if (!key) return [];
        const url = new URL('https://www.googleapis.com/youtube/v3/search');
        url.searchParams.set('part', 'snippet');
        url.searchParams.set('type', 'video');
        if (params.q) url.searchParams.set('q', params.q);
        if (params.channelId) url.searchParams.set('channelId', params.channelId);
        if (params.order) url.searchParams.set('order', params.order);
        url.searchParams.set('maxResults', (params.maxResults || 10).toString());
        url.searchParams.set('key', key);

        const res = await fetch(url.toString());
        const data = await res.json();
        return data.items?.map((i: any) => i.id.videoId) || [];
    }
};
