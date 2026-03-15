## 2025-05-14 - Parallelize independent I/O-bound tasks
**Learning:** In the C# backend, independent I/O-bound operations like external process execution (Python scripts) and external API calls (YouTube) can be executed concurrently using `Task.WhenAll` to significantly reduce total latency.
**Action:** Always identify independent I/O tasks and use `Task.WhenAll` to parallelize them, ensuring better API responsiveness.
