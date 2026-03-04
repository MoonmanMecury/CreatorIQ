## 2025-05-14 - [CRITICAL] Hardcoded secrets and Information Disclosure
**Vulnerability:** Hardcoded database connection string (with plaintext password) and YouTube API key in `appsettings.json`. Additionally, `DebugController` was exposing sensitive system details like machine name, user name, process IDs, and absolute file paths.
**Learning:** Development-time shortcuts (hardcoded keys) and diagnostic endpoints often leak into production environments if not explicitly sanitized or removed.
**Prevention:** Never commit real secrets to configuration files; use placeholders and provided example files. Diagnostic controllers should be strictly guarded by authentication or removed entirely before production.

## 2025-05-14 - [HIGH] Command Injection risk in TrendService
**Vulnerability:** `TrendService` was using string interpolation to build command line arguments for a Python script, which is vulnerable to command injection if the `topic` input is not properly sanitized.
**Learning:** `ProcessStartInfo.Arguments` with string interpolation is a common source of command injection.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` to ensure arguments are properly escaped and handled by the operating system, preventing injection attacks.
