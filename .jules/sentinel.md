## 2025-05-22 - Neutralizing Command Injection in Process Execution
**Vulnerability:** Use of string-interpolated `Arguments` in `ProcessStartInfo` allowed for potential argument injection if user-provided inputs (like `topic`) contained shell-sensitive characters or quotes.
**Learning:** Even when wrapping arguments in quotes (e.g., `"{topic}"`), shell injection can still be possible depending on how the underlying process is spawned and how the OS handles escaping.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` instead of the `Arguments` string property. .NET's `ArgumentList` automatically handles cross-platform escaping and quoting, ensuring that each entry in the list is treated as a single literal argument.
