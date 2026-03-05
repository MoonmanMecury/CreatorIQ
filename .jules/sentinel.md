## 2025-05-15 - Command Injection in Process Execution
**Vulnerability:** Shell command injection via string-interpolated arguments in `ProcessStartInfo`.
**Learning:** Using `Arguments` with string interpolation (e.g., `$"\"{scriptPath}\" \"{topic}\""`) allows user-controlled input to break out of the intended argument context if it contains shell metacharacters, especially when `UseShellExecute` is involved or when the underlying shell parses the string.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` instead of `Arguments`. `ArgumentList` passes arguments directly to the OS without shell interpretation, neutralizing injection risks.

## 2025-05-15 - Information Disclosure via Debug Endpoints
**Vulnerability:** Debug endpoints (`/api/debug/status`, `/api/debug/info`) exposing sensitive system metadata and request headers.
**Learning:** Developers often include verbose debug endpoints for troubleshooting that expose Process IDs, working directories, and full request headers (which may contain sensitive tokens).
**Prevention:** Harden debug endpoints before production. Mask or remove system-specific metadata and ensure `catch` blocks return generic error messages instead of full stack traces or exception details.
