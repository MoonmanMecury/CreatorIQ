## 2026-03-11 - [Hardened Command Execution and Info Leakage]
**Vulnerability:** Command injection risks and excessive information disclosure in diagnostic endpoints.
**Learning:** Using `ProcessStartInfo.Arguments` with string interpolation (even with quotes) is vulnerable to injection. Diagnostic endpoints like `DebugController` often leak sensitive server environment details and request headers.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` to safely pass arguments to external processes. Harden diagnostic endpoints by only returning the minimum necessary information and generic error messages.
