## 2025-03-13 - [Command Injection and Information Disclosure Hardening]
**Vulnerability:** Command injection via string interpolation in `ProcessStartInfo.Arguments` and information disclosure in diagnostic endpoints (`DebugController.cs`).
**Learning:** Using `ProcessStartInfo.Arguments` with string interpolation for user-provided input (like `topic`) creates a command injection risk. Additionally, diagnostic endpoints often leak sensitive environment details (PID, machine name, absolute paths) if not carefully sanitized.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` to ensure arguments are properly escaped. Explicitly sanitize API responses to exclude environment-specific metadata and genericize error messages to avoid leaking stack traces.
