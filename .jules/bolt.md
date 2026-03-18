## 2025-05-15 - Parallelizing independent I/O-bound tasks in TrendService
**Learning:** Sequential execution of independent I/O tasks (Python script and YouTube API) created unnecessary latency. Using `Task.WhenAll` allowed these tasks to overlap, effectively reducing the response time to the duration of the single longest task.
**Action:** Always look for independent `await` calls in the same method that can be initiated concurrently and awaited together using `Task.WhenAll`.

## 2025-05-15 - Hardening process execution with ArgumentList
**Learning:** Using string interpolation for `ProcessStartInfo.Arguments` is insecure and error-prone (especially with user-provided input like `topic`). `ArgumentList` handles escaping and prevents argument injection.
**Action:** Prefer `ProcessStartInfo.ArgumentList` over `Arguments` for all external process executions.
