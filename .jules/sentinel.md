## 2025-05-15 - Hardening Backend Diagnostics and External Execution

**Vulnerability:**
1.  **Critical:** Hardcoded secrets in `appsettings.json` (Supabase and YouTube).
2.  **High:** Command injection risk in `TrendService` due to string-interpolated arguments.
3.  **Medium:** Information leakage in `DebugController` via sensitive server fields and raw exception details.

**Learning:**
- Diagnostics endpoints (`DebugController`) are often overlooked and can leak critical infrastructure details (PID, machine name, internal paths).
- Using `ProcessStartInfo.Arguments` with string interpolation is a common vector for command injection; `ArgumentList` provides native protection.

**Prevention:**
- Use `appsettings.Example.json` as a mandatory template and exclude `appsettings.json` (or sanitize it in the base repo).
- Adopt `ArgumentList` for all external process executions.
- Enforce generic error responses in controllers to "fail securely".
