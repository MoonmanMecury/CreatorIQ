## 2025-05-15 - Parallelize I/O-bound tasks in TrendService
**Learning:** Independent long-running I/O operations (like external process execution and external API calls) should be parallelized using `Task.WhenAll` to minimize total response latency. The total time becomes the max of the tasks rather than the sum.
**Action:** Always identify independent `Task` returning methods in the same scope and consider if they can be executed concurrently.

## 2025-05-15 - Environment-specific Python executable
**Learning:** The development environment uses `python3` instead of `py` (the Windows Python launcher). Hardcoding `py` leads to `command not found` errors in non-Windows environments.
**Action:** Use `python3` as the default or implement a check to detect the correct Python executable for the current environment.
