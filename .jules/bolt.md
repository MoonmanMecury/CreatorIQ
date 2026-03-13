## 2025-05-15 - Parallelize independent I/O tasks
**Learning:** In `TrendService.GetTrendsAsync`, fetching data from Python scripts and the YouTube API sequentially adds unnecessary latency. Using `Task.WhenAll` can significantly reduce the total response time.
**Action:** Identify independent asynchronous operations and execute them in parallel using `Task.WhenAll` to improve responsiveness.
