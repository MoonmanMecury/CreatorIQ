## 2025-05-15 - Hardening External Process Execution
**Vulnerability:** Command injection risk when using string-interpolated arguments for external Python scripts.
**Learning:** Using `ProcessStartInfo.Arguments` with interpolated strings is dangerous if input is not perfectly sanitized. `ProcessStartInfo.ArgumentList` provides a safer way to pass arguments as a collection, handled by the OS.
**Prevention:** Always use `ArgumentList` instead of `Arguments` for process execution in .NET.

## 2025-05-15 - Minimizing Diagnostic Information Disclosure
**Vulnerability:** Diagnostic endpoints in `DebugController` were leaking sensitive server-side metadata (Process ID, machine name, absolute paths).
**Learning:** Default diagnostic endpoints often expose more than intended, which can be used for reconnaissance.
**Prevention:** Hardened diagnostic responses should only include essential, non-sensitive data and use generic error messages for failures.
