## 2025-05-14 - Hardening Backend Diagnostics and Process Execution
**Vulnerability:** Information disclosure in diagnostic endpoints and command injection risk in external process execution.
**Learning:** Diagnostic endpoints like `DebugController` were leaking sensitive server-side information (Process IDs, Machine Names, absolute file paths) and request headers. Additionally, using string interpolation for process arguments created a command injection risk.
**Prevention:**
- Always sanitize diagnostic output; remove any fields that reveal internal server state.
- Use `ProcessStartInfo.ArgumentList` instead of string-interpolated `Arguments` to ensure safe argument handling.
- Use generic error messages in `catch` blocks to prevent leaking stack traces.
- Provide an `appsettings.Example.json` and keep actual secrets out of version-controlled configuration files.
