using System.Diagnostics;
using System.Text.Json;
using CreatorIQ.Api.Data;
using CreatorIQ.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CreatorIQ.Api.Services;

public interface ITrendService
{
    Task<TrendResponse> GetTrendsAsync(string topic);
}

public class TrendService : ITrendService
{
    private readonly ILogger<TrendService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IYouTubeService _youtubeService;
    private readonly AppDbContext _dbContext;

    public TrendService(
        ILogger<TrendService> logger, 
        IConfiguration configuration,
        IYouTubeService youtubeService,
        AppDbContext dbContext)
    {
        _logger = logger;
        _configuration = configuration;
        _youtubeService = youtubeService;
        _dbContext = dbContext;
    }

    public async Task<TrendResponse> GetTrendsAsync(string topic)
    {
        try
        {
            // ⚡ Bolt: Parallelize Python and YouTube data fetching to reduce total latency.
            // These operations are independent and can run concurrently.
            var pythonTask = ExecutePythonScriptAsync(topic);
            var youtubeTask = _youtubeService.GetMetricsAsync(topic);

            await Task.WhenAll(pythonTask, youtubeTask);

            var pythonData = await pythonTask;
            var youtubeMetrics = await youtubeTask;

            // 3. Aggregate and Normalize
            var response = AggregateResults(topic, pythonData, youtubeMetrics);

            // 4. Store in Database
            await SaveToDatabaseAsync(topic, pythonData, youtubeMetrics, response);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in trend pipeline for {Topic}", topic);
            return CreateFallbackResponse(topic, ex.Message);
        }
    }

    private async Task<TrendResponse> ExecutePythonScriptAsync(string topic)
    {
        var scriptPath = Path.Combine(AppContext.BaseDirectory, "Scripts", "get_trends.py");
        if (!File.Exists(scriptPath))
        {
            scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "Scripts", "get_trends.py");
        }

        var startInfo = new ProcessStartInfo
        {
            FileName = "py",
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

        if (process.ExitCode != 0 || string.IsNullOrWhiteSpace(output))
        {
            _logger.LogWarning("Python script issue: {Error}", error);
            throw new Exception("Pytrends data fetching failed.");
        }

        return JsonSerializer.Deserialize<TrendResponse>(output) ?? throw new Exception("Failed to parse python output.");
    }

    private TrendResponse AggregateResults(string topic, TrendResponse pythonData, YouTubeTrendMetrics youtube)
    {
        // Combined Niche Score logic
        // Formula: (Pytrends Score * 0.4) + (YouTube Engagement * 10 * 0.4) + (Log10(YouTube Views) * 5 * 0.2)
        double ytEngagementScore = Math.Min(100, youtube.AverageEngagement * 10);
        double ytVolumeScore = Math.Min(100, Math.Log10(Math.Max(1, youtube.TotalViews)) * 10);
        
        int combinedScore = (int)((pythonData.Score * 0.4) + (ytEngagementScore * 0.4) + (ytVolumeScore * 0.2));
        combinedScore = Math.Clamp(combinedScore, 0, 100);

        var subtopics = pythonData.KeywordClusters.Select(k => new Subtopic
        {
            Keyword = k.Keyword,
            GrowthRate = k.Growth,
            CompetitionScore = CalculateCompetitionScore(k.Keyword, youtube),
            Recommendation = k.Growth > 100 ? "High Priority: Viral Potential" : "Strategic: Consistent Demand"
        }).ToList();

        return new TrendResponse
        {
            MainTopic = topic,
            NicheScore = combinedScore,
            TrendVelocity = pythonData.TrendVelocity,
            CompetitionDensity = pythonData.CompetitionDensity,
            RevenuePotential = (int)(combinedScore * 0.8 + 10),
            TopRegions = pythonData.TopRegions,
            TrendData = pythonData.TrendData,
            Subtopics = subtopics,
            KeywordClusters = pythonData.KeywordClusters,
            OpportunityInsights = pythonData.OpportunityInsights,
            YouTubeMetrics = youtube,
            IsMock = pythonData.IsMock
        };
    }

    private int CalculateCompetitionScore(string keyword, YouTubeTrendMetrics metrics)
    {
        // Simple logic: mapping supply count to 0-100
        return Math.Min(100, metrics.SupplyCount / 2);
    }

    private async Task SaveToDatabaseAsync(string topic, TrendResponse rawPy, YouTubeTrendMetrics rawYt, TrendResponse final)
    {
        try
        {
            var entry = new TrendEntry
            {
                Topic = topic,
                RawPytrendsData = JsonSerializer.Serialize(rawPy),
                RawYouTubeData = JsonSerializer.Serialize(rawYt),
                NicheScore = final.NicheScore,
                TrendVelocity = final.TrendVelocity,
                CompetitionDensity = final.CompetitionDensity,
                NormalizedResultJson = JsonSerializer.Serialize(final)
            };

            _dbContext.Trends.Add(entry);
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save trend data to DB");
        }
    }

    private TrendResponse CreateFallbackResponse(string topic, string error)
    {
        return new TrendResponse
        {
            MainTopic = topic,
            NicheScore = 0,
            IsMock = true,
            OpportunityInsights = new OpportunityInsights { RecommendedFormat = $"Error: {error}" }
        };
    }
}
