import { BreakoutVideo, RawVideoData } from "./types";

/**
 * Detects 'breakout' videos that outperformed their channel's subscriber count.
 * A video qualifies if views / channelSubscribers > threshold.
 */
export function detectBreakoutVideos(
    videos: RawVideoData[],
    threshold: number = 2.0
): BreakoutVideo[] {
    return videos
        .filter(v => v.channelSubscribers > 0) // Avoid division by zero
        .filter(v => (v.views / v.channelSubscribers) > threshold)
        .map(v => ({
            videoId: v.videoId,
            title: v.title,
            channelName: v.channelName,
            channelSubscribers: v.channelSubscribers,
            views: v.views,
            likes: v.likes,
            comments: v.comments,
            publishDate: v.publishDate,
            outperformanceRatio: Math.round((v.views / v.channelSubscribers) * 100) / 100,
            thumbnailUrl: v.thumbnailUrl,
            videoUrl: `https://youtube.com/watch?v=${v.videoId}`
        }))
        .sort((a, b) => b.outperformanceRatio - a.outperformanceRatio)
        .slice(0, 10);
}
