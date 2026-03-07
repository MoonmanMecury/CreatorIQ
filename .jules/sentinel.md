## 2025-05-15 - Neutralizing Command Injection Risks via ArgumentList
**Vulnerability:** Potential command injection via string-interpolated arguments in `ProcessStartInfo`.
**Learning:** Using `Arguments = $"..."` with user-provided input (like `topic`) is dangerous as it allows subverting the intended command structure.
**Prevention:** Always use `ProcessStartInfo.ArgumentList.Add()` for secure, automatically-escaped argument passing.
