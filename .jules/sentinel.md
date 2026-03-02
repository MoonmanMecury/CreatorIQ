## 2025-05-15 - [Process Security Hardening]
**Vulnerability:** Command injection risks and information disclosure.
**Learning:** Using `ProcessStartInfo.Arguments` with string interpolation can lead to command injection if inputs are not properly sanitized. Additionally, debug endpoints often leak sensitive server metadata (process ID, machine name, user name, absolute paths) which can be useful for attackers during the reconnaissance phase.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` instead of a concatenated `Arguments` string when executing external processes. Ensure that error handling logs detailed exceptions internally while returning generic error messages to the client. Harden debug endpoints to only expose non-sensitive operational data.
