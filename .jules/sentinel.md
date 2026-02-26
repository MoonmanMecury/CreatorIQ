# Sentinel's Journal - Critical Security Learnings

## 2025-05-15 - Argument Injection in Python Script Execution
**Vulnerability:** Use of string-interpolated `Arguments` in `ProcessStartInfo` when calling Python scripts with user-provided topics.
**Learning:** This pattern was found in `TrendService.cs` where the `topic` query parameter was passed directly to a Python script without sanitization, allowing for potential argument injection.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` instead of the `Arguments` property to ensure proper quoting and escaping of individual arguments by the OS.
