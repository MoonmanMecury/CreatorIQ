## 2025-01-24 - Command Injection via Process Arguments
**Vulnerability:** User-provided input (topic) was directly interpolated into a shell command string used to invoke a Python script.
**Learning:** Using string interpolation with `ProcessStartInfo.Arguments` is risky because it relies on manual quoting and escaping, which can be bypassed by malicious input.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` in .NET Core/.NET 5+ to pass arguments as a collection. The runtime handles platform-specific escaping and quoting, preventing command injection.
