## 2025-05-15 - Command Injection in Process Execution
**Vulnerability:** String-interpolated `Arguments` in `ProcessStartInfo` allowed for potential command injection if user-provided input (e.g., `topic`) was not properly sanitized.
**Learning:** Even with quotes around arguments, string interpolation for process execution is a high-risk pattern in .NET.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` instead of `Arguments` to let the framework handle safe argument escaping and quoting.
