## 2025-05-14 - Secure Process Execution Pattern
**Vulnerability:** Command injection via string-interpolated process arguments and information disclosure via verbose error messages/system diagnostic endpoints.
**Learning:** Using `ProcessStartInfo.Arguments` with string interpolation (e.g., `$"\"{scriptPath}\" \"{topic}\""`) is vulnerable to argument injection if the input is not perfectly sanitized. Additionally, diagnostic endpoints like `DebugController` often inadvertently expose internal system details (ProcessId, MachineName, stack traces).
**Prevention:**
1. Always use `ProcessStartInfo.ArgumentList` to pass arguments to external processes.
2. Implement cross-platform executable detection (e.g., `RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "py" : "python3"`) to ensure scripts run securely in different environments.
3. Redact sensitive system information (ProcessId, MachineName, BaseDirectory) in diagnostic responses using a standard placeholder like `[REDACTED]`.
4. Ensure `catch` blocks in API controllers do not return `ex.ToString()` to the client; return generic or high-level error messages instead.
