## 2025-05-14 - [Secrets in Config & Info Disclosure]
**Vulnerability:** Hardcoded Supabase and YouTube API keys in `appsettings.json`. Sensitive server environment details (machine name, user, paths) exposed via `DebugController`.
**Learning:** Development-focused diagnostic endpoints often prioritize developer convenience over security, leading to significant information disclosure. Hardcoded secrets are a common "temporary" measure that persists.
**Prevention:** Use `appsettings.Example.json` for templates. Ensure diagnostic endpoints only return the minimum necessary information and sanitize all error responses to avoid leaking stack traces or internal paths.
