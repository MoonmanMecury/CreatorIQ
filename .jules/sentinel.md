## 2025-05-14 - Redacting Secrets and Hardening Process Execution

**Vulnerability:** Hardcoded Supabase connection strings and YouTube API keys were found in `appsettings.json`. Additionally, external process execution using string interpolation for arguments posed a command injection risk, and several debug endpoints leaked sensitive server information.

**Learning:** Development-time convenience often leads to committing secrets to version control. Using string interpolation for process arguments is a common pattern that bypasses OS-level protections against argument injection.

**Prevention:**
1. Always use `appsettings.Example.json` for templates and never commit real secrets.
2. Use `ProcessStartInfo.ArgumentList` instead of `Arguments` to ensure safe argument handling by the OS.
3. Audit debug endpoints to ensure they do not expose internal system details or full stack traces.
