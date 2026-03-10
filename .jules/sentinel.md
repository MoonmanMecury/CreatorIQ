## 2025-05-15 - Hardcoded Credentials and Argument Injection

**Vulnerability:** Found a hardcoded Supabase connection string with a plaintext password and a YouTube API key in `appsettings.json`. Also identified a potential argument injection vulnerability in `TrendService.cs` where a user-provided topic was interpolated directly into a shell command arguments string.

**Learning:** In ASP.NET Core projects, `appsettings.json` is often committed to source control while `appsettings.Development.json` is ignored. If secrets are placed in the main `appsettings.json`, they are leaked to everyone with access to the repo. Furthermore, using string interpolation for `ProcessStartInfo.Arguments` is a classic injection risk that is easily overlooked in favor of simpler code.

**Prevention:**
- Always use environment variables or a secure Secret Manager for credentials.
- Provide an `appsettings.Example.json` template with placeholders.
- Use `ProcessStartInfo.ArgumentList` instead of `Arguments` string to ensure all parameters are correctly escaped by the operating system.
