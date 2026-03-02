## 2025-05-15 - [Parallelize independent data fetching]
**Learning:** In a C# ASP.NET Core backend, independent I/O-bound tasks (e.g., executing external scripts and making API calls) should be executed in parallel using `Task.WhenAll` to minimize cumulative latency.
**Action:** Identify sequences of `await` calls that don't depend on each other and refactor them to use `Task.WhenAll`.
