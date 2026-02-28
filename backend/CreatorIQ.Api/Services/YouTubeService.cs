using CreatorIQ.Api.Models;
using Google.Apis.Services;
using Google.Apis.YouTube.v3;
using Microsoft.Extensions.Caching.Memory;

namespace CreatorIQ.Api.Services;

public interface IYouTubeService
{
    Task<YouTubeTrendMetrics> GetMetricsAsync(string topic);
    Task<YouTubeAnalysisResponse> GetDetailedAnalysisAsync(string topic, YouTubeSearchFilters? filters = null);
}

public class YouTubeService : IYouTubeService
{
    private readonly string? _apiKey;
    private readonly ILogger<YouTubeService> _logger;
    private readonly IMemoryCache _cache;

    public YouTubeService(IConfiguration configuration, ILogger<YouTubeService> logger, IMemoryCache cache)
    {
        _apiKey = configuration["YouTube:ApiKey"];
        _logger = logger;
        _cache = cache;
    }

    public async Task<YouTubeTrendMetrics> GetMetricsAsync(string topic)
    {
        var analysis = await GetDetailedAnalysisAsync(topic);
        return new YouTubeTrendMetrics
        {
            TotalViews = analysis.TopVideos.Sum(v => v.Views),
            AverageEngagement = analysis.EngagementRateAvg,
            SupplyCount = analysis.VideoCount
        };
    }

    public async Task<YouTubeAnalysisResponse> GetDetailedAnalysisAsync(string topic, YouTubeSearchFilters? filters = null)
    {
        if (string.IsNullOrEmpty(topic)) return new YouTubeAnalysisResponse();

        // ⚡ Bolt: Implement caching to avoid redundant external API calls.
        // We normalize the topic to ensure cache hits for similar queries.
        var normalizedTopic = topic.Trim().ToLowerInvariant();
        var cacheKey = $"YT_Analysis_{normalizedTopic}_{filters?.RegionCode}_{filters?.Language}_{filters?.MaxResults}_{filters?.PublishedAfter?.Ticks}";

        if (_cache.TryGetValue(cacheKey, out YouTubeAnalysisResponse? cached))
        {
            _logger.LogInformation("Returning cached YouTube analysis for {Topic}", normalizedTopic);
            return cached!;
        }

        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("YouTube API Key is missing. Returning mock data.");
            var mock = GetMockAnalysis(topic);
            _cache.Set(cacheKey, mock, TimeSpan.FromMinutes(5));
            return mock;
        }

        try
        {
            var youtubeService = new Google.Apis.YouTube.v3.YouTubeService(new BaseClientService.Initializer()
            {
                ApiKey = _apiKey,
                ApplicationName = "CreatorIQ"
            });

            // 1. Search for videos
            var searchRequest = youtubeService.Search.List("snippet");
            searchRequest.Q = topic;
            searchRequest.Type = "video";
            searchRequest.MaxResults = filters?.MaxResults ?? 10;
            searchRequest.Order = SearchResource.ListRequest.OrderEnum.Relevance;
            
            if (!string.IsNullOrEmpty(filters?.RegionCode)) searchRequest.RegionCode = filters.RegionCode;
            if (!string.IsNullOrEmpty(filters?.Language)) searchRequest.RelevanceLanguage = filters.Language;
            if (filters?.PublishedAfter.HasValue == true) searchRequest.PublishedAfter = filters.PublishedAfter.Value;

            var searchResponse = await searchRequest.ExecuteAsync();

            var videoIds = searchResponse.Items.Select(i => i.Id.VideoId).ToList();
            var channelIds = searchResponse.Items.Select(i => i.Snippet.ChannelId).Distinct().ToList();

            if (!videoIds.Any())
            {
                var emptyResult = new YouTubeAnalysisResponse { Topic = topic };
                _cache.Set(cacheKey, emptyResult, TimeSpan.FromMinutes(10));
                return emptyResult;
            }

            // ⚡ Bolt: Parallelize video and channel statistics fetching.
            // These calls are independent and can be executed concurrently to reduce latency.
            var videoRequest = youtubeService.Videos.List("snippet,statistics");
            videoRequest.Id = string.Join(",", videoIds);

            var channelRequest = youtubeService.Channels.List("statistics");
            channelRequest.Id = string.Join(",", channelIds);

            var videoTask = videoRequest.ExecuteAsync();
            var channelTask = channelRequest.ExecuteAsync();

            await Task.WhenAll(videoTask, channelTask);

            var videoResponse = await videoTask;
            var channelResponse = await channelTask;

            var channelSubsMap = channelResponse.Items.ToDictionary(c => c.Id, c => (long)(c.Statistics.SubscriberCount ?? 0));

            // 4. Transform and Normalize
            var videoInfos = videoResponse.Items.Select(v => {
                long views = (long)(v.Statistics.ViewCount ?? 0);
                long likes = (long)(v.Statistics.LikeCount ?? 0);
                long comments = (long)(v.Statistics.CommentCount ?? 0);
                double engagement = views > 0 ? (double)(likes + comments) / views * 100 : 0;
                
                return new YouTubeVideoInfo
                {
                    Title = v.Snippet.Title,
                    Views = views,
                    Likes = likes,
                    Comments = comments,
                    ChannelSubs = channelSubsMap.GetValueOrDefault(v.Snippet.ChannelId, 0),
                    EngagementRate = Math.Round(engagement, 2)
                };
            }).ToList();

            double avgEngagement = videoInfos.Any() ? videoInfos.Average(v => v.EngagementRate) : 0;
            
            // Competition Score Logic: Based on video count and average views of top results
            // More videos and more views = higher competition
            int videoCount = searchResponse.PageInfo.TotalResults ?? 0;
            int competitionScore = CalculateCompetition(videoCount, videoInfos);

            var result = new YouTubeAnalysisResponse
            {
                Topic = topic,
                VideoCount = videoCount,
                TopVideos = videoInfos,
                CompetitionScore = competitionScore,
                EngagementRateAvg = Math.Round(avgEngagement, 2)
            };

            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(10));
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching detailed YouTube metrics for {Topic}", topic);
            return GetMockAnalysis(topic);
        }
    }

    private int CalculateCompetition(int totalResults, List<YouTubeVideoInfo> topVideos)
    {
        if (!topVideos.Any()) return 0;
        
        double avgViews = topVideos.Average(v => v.Views);
        // Normalize results: 1,000,000 views and 500 videos = high competition (100)
        double score = (Math.Log10(Math.Max(1, totalResults)) * 20) + (Math.Log10(Math.Max(1, avgViews)) * 10);
        return (int)Math.Clamp(score, 0, 100);
    }

    private YouTubeAnalysisResponse GetMockAnalysis(string topic)
    {
        var random = new Random(topic.GetHashCode());
        var videoCount = random.Next(100, 5000);
        
        var videoInfos = Enumerable.Range(1, 5).Select(i => new YouTubeVideoInfo
        {
            Title = $"{topic} - Full Guide #{i}",
            Views = random.Next(50000, 1000000),
            Likes = random.Next(1000, 50000),
            Comments = random.Next(100, 5000),
            ChannelSubs = random.Next(10000, 2000000),
            EngagementRate = Math.Round(random.NextDouble() * 8 + 1, 2)
        }).ToList();

        return new YouTubeAnalysisResponse
        {
            Topic = topic,
            VideoCount = videoCount,
            TopVideos = videoInfos,
            CompetitionScore = random.Next(30, 90),
            EngagementRateAvg = Math.Round(videoInfos.Average(v => v.EngagementRate), 2),
            IsMock = true
        };
    }
}
