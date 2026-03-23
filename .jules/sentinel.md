## 2026-03-23 - Hardening Process Execution and Error Handling
**Vulnerability:** Command injection risk via string-interpolated `ProcessStartInfo.Arguments` and internal information leakage through verbose error messages and debug endpoints.
**Learning:** Using `ProcessStartInfo.Arguments` with user-supplied data like `topic` is a high-risk pattern for command injection. Additionally, default debug endpoints can leak sensitive system details like `ProcessId`, absolute paths, and `MachineName`.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` for safe argument handling and redact sensitive system information from public or debug API responses. Catch blocks should return generic error messages to the user while logging details internally.
