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
        // Removed process_id and working_directory for security
        return Ok(new
        {
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            os = "Hidden", // Masked
            framework = RuntimeInformation.FrameworkDescription,
            server_time = DateTime.UtcNow
        });
    }

    [HttpGet("test-python")]
    public async Task<IActionResult> TestPython()
    {
        try
        {
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
        catch (Exception)
        {
            // Do not leak stack traces or internal details
            return StatusCode(500, new { error = "An internal error occurred while testing Python." });
        }
    }

    [HttpGet("test-pytrends")]
    public async Task<IActionResult> TestPytrends()
    {
        try
        {
            // Use ArgumentList to prevent potential injection
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
        catch (Exception)
        {
            // Do not leak stack traces or internal details
            return StatusCode(500, new { error = "An internal error occurred while testing Pytrends." });
        }
    }

    [HttpGet("info")]
    public IActionResult GetInfo()
    {
        // Removed machine_name, user_name, and directories for security
        return Ok(new
        {
            request = new
            {
                method = Request.Method,
                path = Request.Path.Value,
                query = Request.QueryString.Value,
                remote_ip = "Hidden" // Masked
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
        return Ok(new
        {
            count = files.Length,
            files = files.Select(Path.GetFileName).ToList()
        });
    }

    [HttpGet("test-error")]
    public IActionResult TestError()
    {
        _logger.LogError("DebugController: Test error triggered at {Time}", DateTime.UtcNow);
        // Generic error message
        return StatusCode(500, new { error = "A deliberate test error was triggered." });
    }
}
