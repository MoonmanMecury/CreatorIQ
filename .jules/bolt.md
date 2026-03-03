## 2025-05-15 - [Parallelizing YouTube API Requests]
**Learning:** In the YouTube v3 API, `search.list(part="snippet")` returns `channelId` for each result. This allows fetching video statistics and channel statistics concurrently using `Task.WhenAll`, rather than fetching channel IDs from the video details response sequentially.
**Action:** Always check if dependent resource IDs are available in the initial list/search response to enable parallel secondary requests.
