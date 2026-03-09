# Sentinel Security Journal

## 2025-05-14 - [CRITICAL] Command Injection via ProcessStartInfo.Arguments
**Vulnerability:** Use of string-interpolated arguments in `ProcessStartInfo.Arguments` when executing external Python scripts.
**Learning:** Even with double quotes around parameters, shell-based argument parsing in `ProcessStartInfo.Arguments` is susceptible to injection if inputs are not perfectly sanitized.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` in .NET Core / .NET 5+ to ensure arguments are passed as a discrete list to the OS, bypassing shell interpretation and neutralizing injection risks.
