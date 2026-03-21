## 2025-05-14 - [Trend Discovery Pipeline Optimization]
**Learning:** Parallelizing independent I/O-bound tasks (Python script execution and YouTube API calls) using `Task.WhenAll` significantly reduces service latency by allowing them to run concurrently. Additionally, `IMemoryCache` is essential for expensive data fetching operations to avoid redundant processing and API costs.
**Action:** Always look for independent `await` calls that can be executed in parallel. Use `ArgumentList` for process execution to ensure security and reliability across different environments.
