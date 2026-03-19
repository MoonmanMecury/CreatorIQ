## 2025-03-19 - [Parallelizing I/O-bound tasks in C#]
**Learning:** Sequential await calls for independent I/O operations (like Python script execution and multiple YouTube API calls) are a major source of latency. Using `Task.WhenAll` can significantly reduce total response time.
**Action:** Always look for independent `Task` objects that can be started concurrently and awaited together using `Task.WhenAll`.
