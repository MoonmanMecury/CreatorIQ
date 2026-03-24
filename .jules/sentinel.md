## 2025-05-15 - Command Injection and Information Leakage in Diagnostic Endpoints
**Vulnerability:** Command injection via `ProcessStartInfo.Arguments` and disclosure of system internals (ProcessId, paths, machine names) in debug controllers.
**Learning:** String interpolation for process arguments is highly risky, especially when passing user-provided strings like 'topic'. Diagnostic endpoints often inadvertently leak environment details that aid attackers.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` to ensure proper argument escaping. Redact system-specific metadata in API responses using a standard '[REDACTED]' placeholder. Use `RuntimeInformation.IsOSPlatform` for safe cross-platform executable selection.
