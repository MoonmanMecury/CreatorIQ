using CreatorIQ.Api.Models;
using CreatorIQ.Api.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace CreatorIQ.Tests;

public class TrendServiceTests
{
    private class MockYouTubeService : IYouTubeService
    {
        public int Calls = 0;
        public Task<YouTubeTrendMetrics> GetMetricsAsync(string topic)
        {
            Calls++;
            return Task.FromResult(new YouTubeTrendMetrics());
        }
        public Task<YouTubeAnalysisResponse> GetDetailedAnalysisAsync(string topic, YouTubeSearchFilters? filters = null)
            => Task.FromResult(new YouTubeAnalysisResponse());
    }

    [Fact]
    public async Task GetTrendsAsync_ReturnsCachedData_OnSubsequentCalls()
    {
        // Arrange
        var topic = "test-topic";
        var logger = NullLogger<TrendService>.Instance;
        var config = new ConfigurationBuilder().Build();
        var ytService = new MockYouTubeService();
        var cache = new MemoryCache(new MemoryCacheOptions());

        // We don't need a real dbContext for the cache-hit path as it returns before accessing it
        var service = new TrendService(logger, config, ytService, null!, cache);

        var cachedResponse = new TrendResponse { MainTopic = topic, NicheScore = 99 };
        cache.Set($"trend_analysis_{topic}", cachedResponse);

        // Act
        var result = await service.GetTrendsAsync(topic);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(99, result.NicheScore);
        Assert.Equal(0, ytService.Calls);
    }
}
