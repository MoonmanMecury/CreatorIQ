## 2025-05-15 - Command Injection via ProcessStartInfo
**Vulnerability:** Use of string interpolation in `ProcessStartInfo.Arguments` for executing external Python scripts allowed for command injection if the `topic` parameter contained shell metacharacters.
**Learning:** Even with `UseShellExecute = false`, string-based arguments are parsed by the OS/runtime and can be manipulated.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` which handles argument separation and escaping automatically, preventing injection.

## 2025-05-15 - Information Disclosure in Debug Endpoints
**Vulnerability:** Debug endpoints (`/status`, `/info`) were leaking sensitive server-side information including Process IDs, Machine Names, Working Directories, and full Request Headers (which could contain session tokens).
**Learning:** Debug tools often prioritize developer convenience over security and can expose the internal structure of the server environment.
**Prevention:** Ensure debug endpoints are either removed from production or strictly limited to non-sensitive environment metadata. Use generic error messages in API responses to avoid leaking stack traces.
