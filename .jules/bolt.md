## 2025-05-15 - [Conditional Caching Pattern]
**Learning:** Using `GetOrCreateAsync` in `IMemoryCache` can lead to caching mock or error results if an exception occurs within the factory method, persisting a degraded state for the duration of the cache life.
**Action:** Use `TryGetValue` and `Set` explicitly to only cache successful, high-quality results.

## 2025-05-15 - [Task Parallelization in YouTube API]
**Learning:** YouTube Search API returns `ChannelId` in its snippet results. Fetching Video statistics and Channel statistics (for subscriber counts) can be performed in parallel after the search result is obtained, reducing sequential network RTT.
**Action:** Use `Task.WhenAll` to execute independent `Google.Apis.Requests` in parallel.
