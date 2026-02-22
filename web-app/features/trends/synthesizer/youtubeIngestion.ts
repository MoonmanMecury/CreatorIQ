import type { YouTubeItem, SynthesizerConfig, TrendCategory } from './types'
import { extractKeywords } from './rssIngestion'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns hours between a publishedAt ISO string and now. Minimum 1hr to avoid division by zero.
 */
export function calculateHoursSincePublish(publishedAt: string): number {
    const diff = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60)
    return Math.max(diff, 1)
}

/**
 * Batches an array into sub-arrays of a given size.
 */
function chunk<T>(arr: T[], size: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        batches.push(arr.slice(i, i + size))
    }
    return batches
}

// ─── YouTube Ingestion ────────────────────────────────────────────────────────

interface YouTubeSearchItem {
    id: { videoId: string }
    snippet: {
        title: string
        description: string
        publishedAt: string
        channelTitle: string
        tags?: string[]
    }
}

interface YouTubeVideoStats {
    id: string
    snippet: {
        title: string
        description: string
        publishedAt: string
        channelTitle: string
        tags?: string[]
    }
    statistics: {
        viewCount?: string
        likeCount?: string
        commentCount?: string
    }
}

/**
 * Fetches YouTube trending videos for a list of topics, preserving their source category.
 */
export async function fetchYouTubeTrendingForTopics(
    topics: { keyword: string, category: TrendCategory }[],
    config: SynthesizerConfig
): Promise<YouTubeItem[]> {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
        console.warn('[YouTube] YOUTUBE_API_KEY not set — skipping YouTube ingestion')
        return []
    }

    const publishedAfter = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const topicBatches = chunk(topics, 5)
    const allVideoIds: string[] = []
    const videoMetaMap: Record<string, { snippet: YouTubeSearchItem['snippet'], category: TrendCategory }> = {}

    // Step 1: Search for videos per topic
    for (const batch of topicBatches) {
        await Promise.allSettled(
            batch.map(async (topicObj) => {
                const topic = topicObj.keyword
                const category = topicObj.category
                try {
                    const url = new URL('https://www.googleapis.com/youtube/v3/search')
                    url.searchParams.set('part', 'snippet')
                    url.searchParams.set('q', topic)
                    url.searchParams.set('type', 'video')
                    url.searchParams.set('order', 'viewCount')
                    url.searchParams.set('publishedAfter', publishedAfter)
                    url.searchParams.set('maxResults', String(config.youtubeResultsPerTopic))
                    url.searchParams.set('key', apiKey)

                    const res = await fetch(url.toString())
                    if (res.status === 403) {
                        console.warn('[YouTube] Quota exceeded — stopping YouTube fetch')
                        return
                    }
                    if (!res.ok) {
                        console.warn(`[YouTube] Search for "${topic}" returned ${res.status}`)
                        return
                    }

                    const data = await res.json() as { items: YouTubeSearchItem[] }
                    for (const item of data.items ?? []) {
                        const videoId = item.id?.videoId
                        if (videoId && !allVideoIds.includes(videoId)) {
                            allVideoIds.push(videoId)
                            videoMetaMap[videoId] = { snippet: item.snippet, category }
                        }
                    }
                } catch (err) {
                    console.warn(`[YouTube] Error fetching topic "${topic}":`, err)
                }
            })
        )
    }

    if (allVideoIds.length === 0) return []

    // Step 2: Batch-fetch video statistics
    const idBatches = chunk(allVideoIds, 50) // YouTube allows up to 50 per request
    const result: YouTubeItem[] = []

    for (const idBatch of idBatches) {
        try {
            const url = new URL('https://www.googleapis.com/youtube/v3/videos')
            url.searchParams.set('part', 'statistics,snippet')
            url.searchParams.set('id', idBatch.join(','))
            url.searchParams.set('key', apiKey)

            const res = await fetch(url.toString())
            if (res.status === 403) {
                console.warn('[YouTube] Quota exceeded during stats fetch')
                break
            }
            if (!res.ok) {
                console.warn(`[YouTube] Stats fetch returned ${res.status}`)
                continue
            }

            const data = await res.json() as { items: YouTubeVideoStats[] }
            for (const video of data.items ?? []) {
                try {
                    const publishedAt = video.snippet.publishedAt
                    const hoursSince = calculateHoursSincePublish(publishedAt)
                    const viewCount = parseInt(video.statistics.viewCount ?? '0', 10)
                    const likeCount = parseInt(video.statistics.likeCount ?? '0', 10)
                    const commentCount = parseInt(video.statistics.commentCount ?? '0', 10)

                    const viewsPerHour = viewCount / hoursSince
                    const likeVelocity = likeCount / hoursSince
                    const commentVelocity = commentCount / hoursSince
                    const popularity = Math.min(viewsPerHour / 10000, 1)

                    const tags = (video.snippet.tags ?? []).slice(0, 10)
                    const keywords = [...new Set([...tags.map(t => t.toLowerCase()), ...extractKeywords(video.snippet.title)])]
                        .slice(0, 10)

                    result.push({
                        id: video.id,
                        source: 'YOUTUBE',
                        title: video.snippet.title,
                        summary: video.snippet.description.slice(0, 200),
                        url: `https://www.youtube.com/watch?v=${video.id}`,
                        publishedAt,
                        popularity,
                        topic: keywords[0] ?? video.snippet.title.split(' ')[0].toLowerCase(),
                        category: videoMetaMap[video.id]?.category || 'GENERAL',
                        keywords,
                        duplicateCount: 0,
                        channelName: video.snippet.channelTitle,
                        viewCount,
                        likeCount,
                        commentCount,
                        viewsPerHour,
                        likeVelocity,
                        commentVelocity,
                        tags,
                    })
                } catch (err) {
                    console.warn('[YouTube] Error mapping video:', video.id, err)
                }
            }
        } catch (err) {
            console.warn('[YouTube] Error in stats batch fetch:', err)
        }
    }

    return result
}
