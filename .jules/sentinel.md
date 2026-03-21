## 2025-05-22 - Neutralizing Command Injection via ProcessStartInfo.ArgumentList
**Vulnerability:** Command injection was possible in `TrendService` and `DebugController` due to string interpolation of user-provided topics and script paths in `ProcessStartInfo.Arguments`.
**Learning:** The `py` launcher is environment-specific (Windows-centric) and unavailable in this sandbox. Using `python3` is more reliable here. `ProcessStartInfo.ArgumentList` is the standard .NET 6+ way to prevent injection by handling argument separation at the OS level.
**Prevention:** Always use `ArgumentList` instead of `Arguments` when executing external processes with variable inputs. Include `// SECURITY:` comments to signal rationale to other engineers.

## 2025-05-22 - Hardening Diagnostic Endpoints against System Discovery
**Vulnerability:** `DebugController` endpoints (`/status`, `/info`, `/test-scripts`) leaked internal process IDs, machine names, usernames, and absolute file system paths.
**Learning:** Diagnostic tools often become the first vector for system reconnaissance. Redacting these details by default doesn't break developer utility but significantly raises the bar for an attacker.
**Prevention:** Sanitize all diagnostic outputs. Use `[REDACTED]` for sensitive system-level fields and return generic error messages to the client while logging details internally.
