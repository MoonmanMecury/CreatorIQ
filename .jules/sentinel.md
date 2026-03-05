## 2025-05-15 - [Securing External Process Execution]
**Vulnerability:** Command injection risk via string-interpolated 'Arguments' in 'ProcessStartInfo'.
**Learning:** Using 'ProcessStartInfo.Arguments' with string interpolation is vulnerable to injection if inputs contain shell-sensitive characters.
**Prevention:** Always use 'ProcessStartInfo.ArgumentList' (available since .NET Core 2.1) to pass arguments as a collection, ensuring they are correctly escaped and handled by the OS without shell interpretation.

## 2025-05-15 - [Preventing Information Disclosure in Debug Endpoints]
**Vulnerability:** Debug endpoints leaking system metadata (PID, machine name, working directory) and request headers.
**Learning:** Developers often include detailed system info in debug/health endpoints for troubleshooting, which inadvertently aids attacker reconnaissance.
**Prevention:** Minimize data returned by debug endpoints. Remove system-specific identifiers and absolute file paths. Use generic error messages in API responses while logging full details internally.

## 2025-05-15 - [Configuration Security and Secret Management]
**Vulnerability:** Hardcoded credentials and API keys in 'appsettings.json'.
**Learning:** Secrets committed to source control are easily leaked and difficult to revoke.
**Prevention:** Never commit real secrets. Use placeholders in 'appsettings.json' and provide an 'appsettings.Example.json' template. Use environment variables or secret management services for production.
