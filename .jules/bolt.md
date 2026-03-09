## 2025-05-15 - Parallelizing independent I/O tasks
**Learning:** Sequential execution of independent I/O-bound tasks (external script execution and API calls) is a common bottleneck in `TrendService.GetTrendsAsync`. Parallelizing them using `Task.WhenAll` reduces the total latency to the duration of the longest task rather than the sum of all tasks.
**Action:** Proactively identify independent I/O-bound operations and utilize `Task.WhenAll` to improve response times.
