## 2025-05-15 - Hardcoded Secrets in appsettings.json
**Vulnerability:** Hardcoded PostgreSQL connection string (including password) and YouTube API key were found in `backend/CreatorIQ.Api/appsettings.json`.
**Learning:** Initial MVP development often leads to hardcoding secrets for convenience, but these can be easily overlooked and committed to version control.
**Prevention:** Use environment variables or a secure secret manager for all credentials. Ensure `appsettings.json` only contains non-sensitive configuration and uses placeholders for secrets.

## 2025-05-15 - Command Injection and Information Disclosure in DebugController
**Vulnerability:** `DebugController.cs` contains endpoints that leak system information (MachineName, absolute paths) and process execution methods vulnerable to command injection via string interpolation.
**Learning:** Debugging tools often bypass security checks and can become major liabilities if left in production-ready code.
**Prevention:** Remove or strictly protect debug endpoints in production. Always use `ProcessStartInfo.ArgumentList` instead of string-interpolated `Arguments` to prevent injection.
