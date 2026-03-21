## 2025-05-15 - Neutralizing Command Injection Risks
**Vulnerability:** User input (topic) was directly interpolated into a process command string in `TrendService.cs`.
**Learning:** String interpolation in `ProcessStartInfo.Arguments` is a common vector for command injection, especially when handling user-provided strings.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` instead of the `Arguments` property. `ArgumentList` ensures each argument is correctly escaped and treated as a single token, preventing shell meta-character exploitation.

## 2025-05-15 - Minimizing Information Disclosure in Diagnostic Endpoints
**Vulnerability:** `DebugController.cs` was returning detailed system information (MachineName, UserName, ProcessId, absolute file paths) in its response.
**Learning:** Diagnostic endpoints often leak sensitive infrastructure details that can assist an attacker in reconnaissance or environment-specific exploits.
**Prevention:** Sanitize all diagnostic responses. Only return essential health/status indicators and avoid exposing system-level details, internal paths, or user/machine identifiers in production-facing APIs.
