namespace CreatorIQ.Api.Services.Normalization.Models;

/// <summary>
/// Represents a single point in a Google Trends interest-over-time time series.
/// </summary>
public record TrendDataPoint(DateTime Date, int Value);

/// <summary>
/// Represents the raw per-video metrics extracted from YouTube Data API.
/// </summary>
public record RawVideoMetrics(long Views, long Likes, long Comments);

/// <summary>
/// The unified input contract for the normalization layer.
/// All raw data from Pytrends and YouTube must be mapped to this model
/// before normalization can begin.
/// </summary>
public class RawTopicMetrics
{
    /// <summary>The search keyword or niche to be analyzed.</summary>
    public required string Topic { get; set; }

    /// <summary>
    /// Weekly interest-over-time data from Google Trends (0–100 scale).
    /// Should be ordered from oldest to most recent.
    /// </summary>
    public List<TrendDataPoint> InterestOverTime { get; set; } = new();

    /// <summary>
    /// Regional interest from Google Trends. Key = region/country name, Value = interest 0–100.
    /// </summary>
    public Dictionary<string, int> RegionalInterest { get; set; } = new();

    /// <summary>
    /// Total number of YouTube videos returned for this topic query.
    /// Used for Supply Score computation.
    /// </summary>
    public long TotalVideoCount { get; set; }

    /// <summary>
    /// Sample of individual videos with their engagement metrics.
    /// A sample of 10–20 videos provides statistically sufficient signal.
    /// </summary>
    public List<RawVideoMetrics> Videos { get; set; } = new();
}
