## 2025-05-15 - [Hardcoded Secrets in Configuration]
**Vulnerability:** Hardcoded PostgreSQL connection string and YouTube API key in `appsettings.json`.
**Learning:** Hardcoding secrets in source control-tracked files is a critical vulnerability that exposes infrastructure and third-party services.
**Prevention:** Use secure placeholders in configuration files and provide actual secrets via environment variables or secure secret management systems (like Key Vault or AWS Secrets Manager) at runtime.
