## 2025-05-14 - Secure External Process Execution
**Vulnerability:** Command/Argument injection when executing external Python scripts using string-interpolated `ProcessStartInfo.Arguments`.
**Learning:** Manual quoting and string concatenation for process arguments are error-prone and can be bypassed. The environment also uses `python3` instead of the `py` launcher.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` instead of `Arguments`. This ensures the operating system handles argument boundaries safely, preventing injection. Also, ensure the executable name matches the environment (e.g., `python3`).
