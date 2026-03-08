# Sentinel Security Journal

## 2025-05-22 - [CRITICAL] Sanitized Hardcoded Secrets
**Vulnerability:** Hardcoded Supabase connection string (including password) and YouTube API key were found in `backend/CreatorIQ.Api/appsettings.json`.
**Learning:** MVP/Prototype code often contains hardcoded secrets for convenience, which can be easily committed to version control.
**Prevention:** Always use placeholders in `appsettings.json` and provide an `appsettings.Example.json` for development. Ensure real secrets are managed via environment variables or secure secret stores in production.
