## 2025-05-15 - Command Injection in Process Execution
**Vulnerability:** Command injection via string-interpolated arguments in `ProcessStartInfo`.
**Learning:** Using the `Arguments` property with string interpolation allows an attacker to inject shell commands if user-provided input (like `topic`) contains shell-metacharacters (`;`, `&`, `|`).
**Prevention:** Always use the `ArgumentList` collection in `ProcessStartInfo` to ensure arguments are correctly escaped by the operating system, neutralizing injection risks.
