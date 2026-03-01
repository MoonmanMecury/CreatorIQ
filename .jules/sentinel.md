## 2025-05-15 - [CRITICAL] Command Injection in Trend Pipeline
**Vulnerability:** User-provided `topic` parameter was directly interpolated into the command-line arguments of a Python script via `ProcessStartInfo.Arguments`.
**Learning:** This pattern allows an attacker to execute arbitrary commands by injecting shell-sensitive characters (e.g., `&`, `;`, `|`).
**Prevention:** Always use `ProcessStartInfo.ArgumentList` in .NET when executing external processes, as it automatically handles argument escaping and quoting.

## 2025-05-15 - [CRITICAL] Hardcoded Secrets in Config
**Vulnerability:** Real Supabase and YouTube API credentials were committed to `appsettings.json`.
**Learning:** Secrets should never be committed to source control.
**Prevention:** Use environment variables or secret management tools (like AWS Secrets Manager or Azure Key Vault) and provide an `appsettings.Example.json` for development setup.
