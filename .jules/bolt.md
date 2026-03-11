# Bolt Performance Journal ⚡

## 2025-05-21 - Parallelizing Independent I/O-Bound Tasks
**Learning:** In the `TrendService` and `YouTubeService`, independent external calls (Python scripts and YouTube API requests) were being executed sequentially. This leads to a total latency that is the sum of each request.
**Action:** Use `Task.WhenAll` to execute these independent tasks concurrently, reducing overall latency to the duration of the slowest task.

## 2025-05-21 - Caching External API Results
**Learning:** YouTube API calls are expensive in terms of both latency and quota. Since trend data doesn't change by the second, result caching significantly improves perceived performance.
**Action:** Implement `IMemoryCache` for `YouTubeService.GetDetailedAnalysisAsync` with a normalized key format to ensure cache consistency.
