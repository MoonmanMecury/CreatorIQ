## 2025-05-15 - Command Injection in ProcessStartInfo
**Vulnerability:** Use of string interpolation to construct command-line arguments in `ProcessStartInfo.Arguments` allowed potential command injection if user input (like `topic`) contained shell-sensitive characters.
**Learning:** Even when `UseShellExecute` is `false`, string-interpolated arguments can still lead to unexpected behavior or injection depending on how the target executable parses its command line.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` to pass arguments as a collection of individual strings. This ensures the .NET runtime handles proper quoting and escaping for the target platform, neutralizing injection risks.
