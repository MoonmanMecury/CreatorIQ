## 2025-05-15 - Command Injection in ProcessStartInfo
**Vulnerability:** Argument injection through user-provided input in shell commands.
**Learning:** Using string interpolation with `ProcessStartInfo.Arguments` is insecure as it relies on manual quoting, which can be bypassed.
**Prevention:** Use `ProcessStartInfo.ArgumentList` instead, which allows the runtime to handle argument escaping safely.
