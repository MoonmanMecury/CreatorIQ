## 2025-05-15 - [Securing External Process Execution and Diagnostic Endpoints]
**Vulnerability:** Command injection via string interpolation in `ProcessStartInfo.Arguments` and Information Disclosure via diagnostic endpoints leaking server internals (MachineName, UserName, ProcessId, physical paths).
**Learning:** Even with `UseShellExecute = false`, using the `Arguments` property with string interpolation is risky. Diagnostic endpoints intended for debugging often leak too much metadata that can be used for reconnaissance.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` to ensure arguments are passed as a distinct array. Redact all environment-specific metadata from API responses and return generic error messages instead of stack traces.
