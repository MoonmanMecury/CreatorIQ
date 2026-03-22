## 2025-05-14 - Redacting sensitive information in Debug endpoints
**Vulnerability:** Information disclosure via diagnostic endpoints.
**Learning:** Development-time diagnostic endpoints (like `DebugController`) often expose environment variables, absolute file paths, and system details (MachineName, UserName, ProcessId) that can aid an attacker in reconnaissance.
**Prevention:** Always redact system-specific details from production-visible endpoints and return generic error messages instead of full stack traces. Use structured logging to capture the full error server-side.

## 2025-05-14 - Securing process execution in .NET
**Vulnerability:** Command injection via string-interpolated arguments.
**Learning:** Using `ProcessStartInfo.Arguments` with string interpolation/concatenation is prone to command injection if input is not perfectly sanitized.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` when `UseShellExecute` is `false`. This ensures arguments are passed directly to the executable without shell parsing.
