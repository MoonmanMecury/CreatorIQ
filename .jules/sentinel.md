## 2025-01-24 - Hardened Command Execution and Information Disclosure
**Vulnerability:** Command injection risks via string-interpolated `Arguments` in `ProcessStartInfo`, and excessive information disclosure in `DebugController`.
**Learning:** Using `ProcessStartInfo.ArgumentList` (available in .NET 5+) automatically handles argument escaping and prevents injection, making it safer than manual string formatting. Hardened diagnostic endpoints must never return environment-specific details like process IDs or machine names.
**Prevention:** Always use `ArgumentList` for external process execution. Implement a consistent error-handling policy that logs details server-side but returns generic messages to the client.
