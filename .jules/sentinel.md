## 2025-05-15 - [Hardened Command Execution]
**Vulnerability:** Command injection risk in `TrendService.cs` due to unsanitized user input (`topic`) being passed via string interpolation to `ProcessStartInfo.Arguments`.
**Learning:** Even with quotes, string interpolation in `Arguments` is vulnerable to escape characters and shell metacharacters.
**Prevention:** Use `ProcessStartInfo.ArgumentList` to safely pass arguments as a collection, which prevents shell interpretation and argument injection.

## 2025-05-15 - [Secret Management Hygiene]
**Vulnerability:** Hardcoded credentials (Supabase password and YouTube API key) in `appsettings.json`.
**Learning:** MVP/Prototype code often leaks real credentials into version control.
**Prevention:** Use placeholders in `appsettings.json` and provide an `appsettings.Example.json` for developers.
