using CreatorIQ.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace CreatorIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrendsController : ControllerBase
{
    private readonly ITrendService _trendService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<TrendsController> _logger;

    public TrendsController(ITrendService trendService, IMemoryCache cache, ILogger<TrendsController> logger)
    {
        _trendService = trendService;
        _cache = cache;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetTrends([FromQuery] string topic = "Next.js")
    {
        if (string.IsNullOrWhiteSpace(topic))
        {
            return BadRequest("Topic is required.");
        }

        var cacheKey = $"trends_{topic.ToLower().Replace(" ", "_")}";

        if (!_cache.TryGetValue(cacheKey, out var response))
        {
            _logger.LogInformation("Cache miss for {Topic}. Fetching fresh data.", topic);
            response = await _trendService.GetTrendsAsync(topic);
            
            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromHours(1))
                .SetAbsoluteExpiration(TimeSpan.FromHours(6));

            _cache.Set(cacheKey, response, cacheEntryOptions);
        }
        else
        {
            _logger.LogInformation("Cache hit for {Topic}.", topic);
        }

        return Ok(response);
    }
}
