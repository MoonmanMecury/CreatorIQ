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
        // SECURITY: Redacting sensitive system information from status responses.
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
            // SECURITY: Using ArgumentList and python3 to prevent command injection.
            var startInfo = new ProcessStartInfo
            {
                FileName = "python3",
                ArgumentList = { "-V" },
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

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
            _logger.LogError(ex, "Python test failed");
            return StatusCode(500, new { error = "An error occurred during Python execution" });
        }
    }

    [HttpGet("test-pytrends")]
    public async Task<IActionResult> TestPytrends()
    {
        try
        {
            // Better: just use a simple import check.
            // SECURITY: Using ArgumentList and python3 to prevent command injection.
            var startInfo = new ProcessStartInfo
            {
                FileName = "python3",
                ArgumentList = { "-c", "import pytrends; print('success')" },
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

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
            _logger.LogError(ex, "Pytrends test failed");
            return StatusCode(500, new { error = "An error occurred during Pytrends check" });
        }
    }

    [HttpGet("info")]
    public IActionResult GetInfo()
    {
        var headers = Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString());
        var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        
        // SECURITY: Redacting sensitive environment and server details.
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
            return NotFound(new { error = "Scripts directory not found" });
        }

        var files = Directory.GetFiles(scriptsDir, "*.py");
        // SECURITY: Redacting absolute file paths to prevent system discovery.
        return Ok(new
        {
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
