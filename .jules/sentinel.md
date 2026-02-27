## 2025-05-14 - [Secrets Sanitization and Argument Injection Prevention]
**Vulnerability:** Hardcoded credentials (Supabase & YouTube API) and potential command injection via unsanitized process arguments.
**Learning:** Found secrets in `appsettings.json` and unsafe `ProcessStartInfo` usage. Using `ArgumentList` is safer than string concatenation for external process execution.
**Prevention:** Always use `appsettings.Example.json` for templates and `ArgumentList` for passing parameters to child processes.
