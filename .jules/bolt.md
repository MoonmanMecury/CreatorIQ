## 2025-05-15 - Parallelization and Caching in Trend Discovery
**Learning:** Independent I/O-bound tasks (Python script execution and YouTube API calls) were being executed sequentially, doubling the latency. Additionally, repeat requests for the same topic were re-executing the entire heavy pipeline.
**Action:** Use `Task.WhenAll` to run independent tasks in parallel and implement `IMemoryCache` at the service level to serve repeat requests in near-zero time. Always normalize input strings (trim/lowercase) when used as cache keys.
