## 2025-01-24 - [CRITICAL] Sanitize hardcoded secrets in appsettings.json
**Vulnerability:** Hardcoded Supabase connection string and YouTube API key in `appsettings.json`.
**Learning:** Initial MVP development often leads to hardcoding secrets for convenience, which can be easily overlooked and committed to the repository.
**Prevention:** Always provide an `appsettings.Example.json` template and use environment variables or secret managers for real credentials.
