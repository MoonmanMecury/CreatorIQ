## 2025-05-14 - [CRITICAL] Removed Hardcoded Secrets from Configuration
**Vulnerability:** Hardcoded Supabase connection string (including plaintext password) and YouTube API key in `appsettings.json`.
**Learning:** Development-time credentials were left in the main configuration file, posing a severe risk if committed to version control.
**Prevention:** Always use environment variables, user secrets, or a secure vault for sensitive credentials. Use placeholders in template configuration files.
