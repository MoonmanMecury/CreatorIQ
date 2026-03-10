## 2025-05-15 - Command Injection Mitigation via ArgumentList

**Vulnerability:** The backend was using string-interpolated `Arguments` in `ProcessStartInfo` to execute Python scripts, which is susceptible to command injection if user-provided strings (like `topic`) contain shell metacharacters.

**Learning:** String interpolation for process arguments is a common anti-pattern that bypasses the shell's argument parsing protection. In this environment, the `py` executable was also missing, requiring a shift to `python3`.

**Prevention:** Always use `ProcessStartInfo.ArgumentList` (available since .NET Core 2.1) instead of `Arguments`. This ensures each argument is passed safely to the OS without shell interpretation.

## 2025-05-15 - Secret Sanitization and Debug Hardening

**Vulnerability:** Hardcoded credentials (DB password and YouTube API key) were present in `appsettings.json`. Additionally, `DebugController` was leaking sensitive server state (Process ID, machine name, user name, full paths) and stack traces.

**Learning:** MVP/Prototype code often leaves diagnostic endpoints and hardcoded secrets as a "temporary" convenience, which becomes a critical liability if not cleaned up.

**Prevention:** Use placeholder values in `appsettings.json` and provide an `appsettings.Example.json`. Catch blocks must return generic error messages to the user while logging the full details internally. Hardened diagnostic endpoints should only return non-sensitive metadata.
