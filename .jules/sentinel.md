## 2025-05-15 - [Harden External Process Execution & Diagnostic Info Disclosure]
**Vulnerability:** Use of string interpolation in `ProcessStartInfo.Arguments` posed a command injection risk; additionally, the `DebugController` was leaking sensitive machine details (UserName, MachineName, ProcessId, absolute paths).
**Learning:** Even diagnostic endpoints can become major attack vectors if they leak environment metadata or use unsafe shell execution patterns.
**Prevention:** Use `ProcessStartInfo.ArgumentList` instead of `Arguments` to ensure parameters are treated as literal strings; redact all non-essential system metadata from API responses; and use generic error messages instead of leaking stack traces via `Exception.ToString()`.
