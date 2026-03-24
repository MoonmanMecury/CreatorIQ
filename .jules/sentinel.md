## 2025-03-24 - Neutralizing Command Injection via ArgumentList
**Vulnerability:** Command Injection risk when executing external Python scripts via `ProcessStartInfo.Arguments` with string-interpolated user input.
**Learning:** Even with manual quoting, string interpolation in process arguments is fragile. The `ProcessStartInfo.ArgumentList` property (available since .NET Core 2.1) is the architecturally superior and secure way to pass arguments as it treats each entry as data, not as a shell-parsed command.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` instead of `ProcessStartInfo.Arguments` when executing external processes with any variable input.
