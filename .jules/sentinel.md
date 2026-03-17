## 2025-05-14 - Hardcoded Secrets in Configuration
**Vulnerability:** Hardcoded database connection strings (including password) and YouTube API keys were present in `backend/CreatorIQ.Api/appsettings.json`.
**Learning:** Credentials were being stored directly in the main configuration file for convenience during the MVP stage, leading to immediate exposure of live Supabase and Google Cloud resources.
**Prevention:** Never commit raw credentials. Use descriptive placeholders in configuration files and leverage Environment Variables or Secret Management (e.g., .NET Secrets Manager for local dev) for actual values.
