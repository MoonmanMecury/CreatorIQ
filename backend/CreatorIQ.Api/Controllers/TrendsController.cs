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
    public async Task<IActionResult> GetTrends([FromQuery] string topic)
    {
        if (string.IsNullOrWhiteSpace(topic))
        {
            return BadRequest("Topic is required.");
        }

        var response = await _trendService.GetTrendsAsync(topic);
        return Ok(response);
    }

    [HttpGet("interest")]
    public async Task<IActionResult> GetInterest([FromQuery] string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword)) return BadRequest("Keyword is required.");
        var response = await _trendService.GetTrendsAsync(keyword);
        return Ok(new { 
            keyword = keyword,
            trend_data = response.TrendData 
        });
    }

    [HttpGet("related")]
    public async Task<IActionResult> GetRelated([FromQuery] string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword)) return BadRequest("Keyword is required.");
        var response = await _trendService.GetTrendsAsync(keyword);
        return Ok(new { 
            keyword = keyword,
            related_queries = response.KeywordClusters 
        });
    }
}
