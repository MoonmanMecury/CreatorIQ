using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace CreatorIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DebugController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<DebugController> _logger;

    public DebugController(IConfiguration configuration, ILogger<DebugController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { message = "pong", timestamp = DateTime.UtcNow });
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "Healthy", message = "Backend API is up and running" });
    }

    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        // SECURITY: Redact sensitive system information to prevent information leakage
        return Ok(new
        {
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            os = RuntimeInformation.OSDescription,
            framework = RuntimeInformation.FrameworkDescription,
            server_time = DateTime.UtcNow,
            process_id = "[REDACTED]",
            working_directory = "[REDACTED]"
        });
    }

    [HttpGet("test-python")]
    public async Task<IActionResult> TestPython()
    {
        try
        {
            // SECURITY: Prevent command injection by using ArgumentList
            var startInfo = new ProcessStartInfo
            {
                FileName = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "py" : "python3",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            startInfo.ArgumentList.Add("-V");

            using var process = new Process { StartInfo = startInfo };
            process.Start();

            string output = await process.StandardOutput.ReadToEndAsync();
            string error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            return Ok(new
            {
                success = process.ExitCode == 0,
                version = output.Trim(),
                error = error.Trim(),
                exit_code = process.ExitCode
            });
        }
        catch (Exception ex)
        {
            // SECURITY: Log the error but return a generic message to prevent information leakage
            _logger.LogError(ex, "An error occurred in TestPython");
            return StatusCode(500, new { error = "An issue occurred while testing Python execution." });
        }
    }

    [HttpGet("test-pytrends")]
    public async Task<IActionResult> TestPytrends()
    {
        try
        {
            // Better: just use a simple import check.
            // SECURITY: Prevent command injection by using ArgumentList
            var startInfo = new ProcessStartInfo
            {
                FileName = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "py" : "python3",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            startInfo.ArgumentList.Add("-c");
            startInfo.ArgumentList.Add("import pytrends; print('success')");

            using var process = new Process { StartInfo = startInfo };
            process.Start();

            string output = await process.StandardOutput.ReadToEndAsync();
            string error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            return Ok(new
            {
                success = process.ExitCode == 0,
                output = output.Trim(),
                error = error.Trim(),
                exit_code = process.ExitCode,
                suggestion = process.ExitCode != 0 ? "Try: pip install pytrends" : null
            });
        }
        catch (Exception ex)
        {
            // SECURITY: Log the error but return a generic message to prevent information leakage
            _logger.LogError(ex, "An error occurred in TestPytrends");
            return StatusCode(500, new { error = "An issue occurred while testing Pytrends." });
        }
    }

    [HttpGet("info")]
    public IActionResult GetInfo()
    {
        var headers = Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString());
        var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        
        return Ok(new
        {
            request = new
            {
                method = Request.Method,
                path = Request.Path.Value,
                query = Request.QueryString.Value,
                headers = headers,
                remote_ip = remoteIp
            },
            server = new
            {
                // SECURITY: Redact sensitive system information to prevent information leakage
                machine_name = "[REDACTED]",
                user_name = "[REDACTED]",
                base_directory = "[REDACTED]",
                current_directory = "[REDACTED]"
            }
        });
    }

    [HttpGet("test-scripts")]
    public IActionResult TestScripts()
    {
        var scriptsDir = Path.Combine(Directory.GetCurrentDirectory(), "Scripts");
        if (!Directory.Exists(scriptsDir))
        {
            return NotFound(new { error = "Scripts directory not found", path = scriptsDir });
        }

        var files = Directory.GetFiles(scriptsDir, "*.py");
        return Ok(new
        {
            // SECURITY: Redact full path to prevent information leakage
            directory = "[REDACTED]",
            count = files.Length,
            files = files.Select(Path.GetFileName).ToList()
        });
    }

    [HttpGet("test-error")]
    public IActionResult TestError()
    {
        _logger.LogError("DebugController: Test error triggered at {Time}", DateTime.UtcNow);
        throw new Exception("This is a test exception from the DebugController.");
    }
}
