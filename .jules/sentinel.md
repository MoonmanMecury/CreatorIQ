## 2025-05-15 - Neutralizing Command Injection via ArgumentList
**Vulnerability:** Command injection and argument injection risks when calling external Python scripts using string interpolation for arguments in `ProcessStartInfo.Arguments`.
**Learning:** Even with `UseShellExecute = false`, string interpolation of user-provided inputs into the `Arguments` property can allow attackers to inject additional flags or parameters to the executable.
**Prevention:** Always use the `ProcessStartInfo.ArgumentList` collection instead of the `Arguments` string. This ensures that each argument is correctly escaped and handled as a single literal value by the operating system, preventing injection.
