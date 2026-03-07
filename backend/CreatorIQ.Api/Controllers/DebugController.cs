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

    [HttpGet("test-python")]
    public async Task<IActionResult> TestPython()
    {
        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "python3",
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
            _logger.LogError(ex, "Python test failed");
            return StatusCode(500, new { error = "An error occurred while testing Python." });
        }
    }

    [HttpGet("test-pytrends")]
    public async Task<IActionResult> TestPytrends()
    {
        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "python3",
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
                exit_code = process.ExitCode
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Pytrends test failed");
            return StatusCode(500, new { error = "An error occurred while testing pytrends." });
        }
    }

    [HttpGet("test-error")]
    public IActionResult TestError()
    {
        _logger.LogError("DebugController: Test error triggered at {Time}", DateTime.UtcNow);
        return StatusCode(500, new { error = "A test error was triggered." });
    }
}
