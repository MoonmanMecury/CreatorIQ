## 2025-05-15 - [CRITICAL] Fixed Argument Injection in TrendService
**Vulnerability:** The 'TrendService.cs' used string interpolation to build the 'Arguments' for a Python process execution ($"\"{scriptPath}\" \"{topic}\""). This could allow an attacker to inject additional arguments or commands if the 'topic' input was not properly sanitized.
**Learning:** Even with manual quoting (e.g., \"{topic}\"), string-interpolated arguments in 'ProcessStartInfo' are vulnerable to injection attacks.
**Prevention:** Always use 'ProcessStartInfo.ArgumentList' instead of the 'Arguments' property when executing external processes with user-supplied data. This ensures the runtime handles escaping and quoting correctly for the target OS.
