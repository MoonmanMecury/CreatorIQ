## 2025-05-15 - [Securing External Process Execution]
**Vulnerability:** Command injection and information disclosure through `ProcessStartInfo`.
**Learning:** String interpolation for `Arguments` in `ProcessStartInfo` is unsafe for user-controlled input. Additionally, debug endpoints often leak sensitive server metadata.
**Prevention:** Use `ArgumentList` for secure argument passing and explicitly sanitize or remove sensitive environment variables and headers from API responses.
