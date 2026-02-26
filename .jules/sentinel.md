# Sentinel's Journal - Critical Security Learnings

## 2025-05-15 - Hardcoded Secrets in appsettings.json
**Vulnerability:** Real database connection strings and YouTube API keys were committed to the `appsettings.json` file.
**Learning:** Hardcoded secrets in configuration files are a major security risk as they are exposed to anyone with access to the codebase.
**Prevention:** Never commit real secrets to version control. Use placeholders in configuration files and provide an `appsettings.Example.json` as a template. Use environment variables or a secret manager in production.
