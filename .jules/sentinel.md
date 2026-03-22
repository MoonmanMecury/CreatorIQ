## 2025-05-14 - Command Injection via Process Execution
**Vulnerability:** Command injection in `TrendService.cs` and `DebugController.cs` via string-interpolated `ProcessStartInfo.Arguments`.
**Learning:** Using `ProcessStartInfo.Arguments` with user-provided or unsanitized strings allows attackers to execute arbitrary commands by injecting shell metacharacters.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` instead of `Arguments` to ensure arguments are properly escaped and handled as a list, preventing shell interpretation of special characters.

## 2025-05-14 - Information Leakage in Diagnostic Endpoints
**Vulnerability:** `DebugController.cs` leaked `MachineName`, `UserName`, `ProcessId`, and absolute directory paths.
**Learning:** Unauthenticated diagnostic or "health check" endpoints often inadvertently expose sensitive system metadata that can be used for reconnaissance.
**Prevention:** Redact sensitive system information from public endpoints. Return only the minimum necessary data for health checks. Ensure error handlers do not return stack traces (`ex.ToString()`) to the client.
