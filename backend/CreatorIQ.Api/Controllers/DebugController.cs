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
        return Ok(new
        {
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            os = RuntimeInformation.OSDescription,
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
                FileName = "py",
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
                version = output.Trim()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing python version");
            return StatusCode(500, new { error = "An error occurred while testing Python version." });
        }
    }

    [HttpGet("test-pytrends")]
    public async Task<IActionResult> TestPytrends()
    {
        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "py",
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
                output = output.Trim()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing pytrends import");
            return StatusCode(500, new { error = "An error occurred while testing pytrends import." });
        }
    }

    [HttpGet("info")]
    public IActionResult GetInfo()
    {
        var headers = Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString());
        
        return Ok(new
        {
            request = new
            {
                method = Request.Method,
                path = Request.Path.Value,
                query = Request.QueryString.Value,
                headers = headers
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
        return StatusCode(500, new { error = "A test error was triggered and logged." });
    }
}
