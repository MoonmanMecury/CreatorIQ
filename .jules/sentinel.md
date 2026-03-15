## 2025-05-22 - Neutralizing Command Injection via ArgumentList
**Vulnerability:** External process execution (`python3`) was using string-interpolated `Arguments`, allowing potential command injection if user-provided topics contained shell-sensitive characters.
**Learning:** `ProcessStartInfo.Arguments` is prone to injection. The backend environment uses `python3` instead of `py`.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` instead of `Arguments`. This ensures arguments are passed as a distinct list to the OS, bypassing shell interpretation.

## 2025-05-22 - Information Disclosure in Diagnostic Endpoints
**Vulnerability:** `DebugController` was leaking `MachineName`, `UserName`, `ProcessId`, and absolute physical file paths in `/status`, `/info`, and `/test-scripts`.
**Learning:** Diagnostic endpoints often expose too much system metadata that can aid an attacker in reconnaissance.
**Prevention:** Omit system-specific identifiers from API responses. Return generic status indicators or relative counts instead of physical paths.
