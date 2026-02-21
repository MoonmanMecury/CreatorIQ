using System.Diagnostics;
using System.Text.Json;
using CreatorIQ.Api.Models;

namespace CreatorIQ.Api.Services;

public interface ITrendService
{
    Task<TrendResponse> GetTrendsAsync(string topic);
}

public class TrendService : ITrendService
{
    private readonly ILogger<TrendService> _logger;
    private readonly IConfiguration _configuration;

    public TrendService(ILogger<TrendService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<TrendResponse> GetTrendsAsync(string topic)
    {
        try
        {
            var scriptPath = Path.Combine(AppContext.BaseDirectory, "Scripts", "get_trends.py");
            
            // In development, we might want to use a relative path if the base directory is different
            if (!File.Exists(scriptPath))
            {
               scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "Scripts", "get_trends.py");
            }

            _logger.LogInformation("Executing python script at {ScriptPath} for topic {Topic}", scriptPath, topic);

            var startInfo = new ProcessStartInfo
            {
                FileName = "py", // Use 'py' launcher on windows
                Arguments = $"\"{scriptPath}\" \"{topic}\"",
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

            if (process.ExitCode != 0)
            {
                _logger.LogError("Python script exited with code {ExitCode}. Error: {Error}", process.ExitCode, error);
                throw new Exception("Backend script failed to execute.");
            }

            if (string.IsNullOrWhiteSpace(output))
            {
                throw new Exception("Backend script returned empty output.");
            }

            var result = JsonSerializer.Deserialize<TrendResponse>(output);
            return result ?? throw new Exception("Failed to deserialize trend data.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching trends for {Topic}", topic);
            // Return a safe mock if everything fails
            return new TrendResponse 
            { 
               Score = 0, 
               IsMock = true, 
               OpportunityInsights = new OpportunityInsights { RecommendedFormat = "Error occurred" } 
            };
        }
    }
}
