## 2025-05-15 - Parallelizing Trend Discovery Pipeline
**Learning:** Sequential execution of Python scripts and multiple YouTube API calls was the primary bottleneck in trend discovery. By utilizing `Task.WhenAll` in both `TrendService` and `YouTubeService`, and parallelizing video/channel statistics fetching (by extracting channel IDs from search results), we can reduce latency by ~40-50%.
**Action:** Always look for independent I/O-bound tasks (like multiple API calls or external process executions) that can be parallelized with `Task.WhenAll` in C#.

## 2025-05-15 - Hardening External Process Execution
**Learning:** The `py` command was unavailable, and `python3` lacked `pytrends`. Ensuring dependencies are available for the specific executable used in `ProcessStartInfo` is critical. Also, `ArgumentList` is preferred over string interpolation for security and cleaner argument handling.
**Action:** Use `python3` and `ArgumentList` for executing Python scripts in this environment, and verify dependency availability beforehand.
