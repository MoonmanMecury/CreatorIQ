using CreatorIQ.Api.Models;
using CreatorIQ.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace CreatorIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class YouTubeController : ControllerBase
{
    private readonly IYouTubeService _youtubeService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<YouTubeController> _logger;

    public YouTubeController(IYouTubeService youtubeService, IMemoryCache cache, ILogger<YouTubeController> logger)
    {
        _youtubeService = youtubeService;
        _cache = cache;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetYouTubeAnalysis(
        [FromQuery] string topic,
        [FromQuery] string? region = null,
        [FromQuery] string? lang = null,
        [FromQuery] int maxResults = 10)
    {
        if (string.IsNullOrWhiteSpace(topic))
        {
            return BadRequest("Topic is required.");
        }

        var cacheKey = $"yt_analysis_{topic}_{region}_{lang}_{maxResults}";
        if (_cache.TryGetValue(cacheKey, out YouTubeAnalysisResponse? cachedResponse))
        {
            _logger.LogInformation("Cache hit for YouTube analysis: {Topic}", topic);
            return Ok(cachedResponse);
        }

        var filters = new YouTubeSearchFilters
        {
            RegionCode = region,
            Language = lang,
            MaxResults = maxResults
        };

        var response = await _youtubeService.GetDetailedAnalysisAsync(topic, filters);

        var cacheOptions = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromHours(1))
            .SetAbsoluteExpiration(TimeSpan.FromHours(6));

        _cache.Set(cacheKey, response, cacheOptions);

        return Ok(response);
    }
}
