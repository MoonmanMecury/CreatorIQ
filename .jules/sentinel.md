## 2025-05-14 - Prevent Command Injection via ArgumentList
**Vulnerability:** String-interpolated Arguments in ProcessStartInfo.
**Learning:** Using string interpolation to build command line arguments allows for argument injection if input is not strictly validated.
**Prevention:** Always use `ProcessStartInfo.ArgumentList` instead of `Arguments` string to ensure input is treated as a literal argument.

## 2025-05-14 - Information Disclosure in Debug Endpoints
**Vulnerability:** Debug endpoints exposing Process ID, Machine Name, and file paths.
**Learning:** Development-focused debug endpoints often leak sensitive infrastructure details that can assist an attacker in reconnaissance.
**Prevention:** Remove sensitive server metadata from public/internal API responses and return generic error messages instead of stack traces.
