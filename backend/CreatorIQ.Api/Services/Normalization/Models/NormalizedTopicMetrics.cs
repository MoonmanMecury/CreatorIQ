namespace CreatorIQ.Api.Services.Normalization.Models;

/// <summary>
/// The output of the normalization layer. All scores are on a stable 0–100 scale,
/// rounded to 1 decimal place, and suitable for downstream ranking or blending.
/// </summary>
public class NormalizedTopicMetrics
{
    /// <summary>The topic that was normalized.</summary>
    public required string Topic { get; set; }

    /// <summary>
    /// Demand Score (0–100): How much people are searching for this topic right now.
    /// Derived from the exponentially weighted recent trend interest.
    /// Higher = more search demand.
    /// </summary>
    public double DemandScore { get; set; }

    /// <summary>
    /// Growth Score (0–100): Rate of trend acceleration or deceleration.
    /// 50 = flat, >50 = growing, <50 = declining.
    /// Derived from a linear regression slope over the full trend series.
    /// </summary>
    public double GrowthScore { get; set; }

    /// <summary>
    /// Supply Score (0–100): How saturated the YouTube market is for this topic.
    /// Based on total video count with logarithmic normalization.
    /// Higher = more competition from existing content.
    /// </summary>
    public double SupplyScore { get; set; }

    /// <summary>
    /// Engagement Score (0–100): Quality signal based on how interactively audiences
    /// respond to existing content in this niche (likes + comments / views).
    /// Higher = more engaged audience.
    /// </summary>
    public double EngagementScore { get; set; }

    /// <summary>
    /// Regional Strength (0–100): Geographic concentration of interest.
    /// High = interest is geographically concentrated (easier to target).
    /// Low = globally distributed interest (harder to tailor content).
    /// </summary>
    public double RegionalStrength { get; set; }

    /// <summary>UTC timestamp of when this normalization was computed.</summary>
    public DateTime ComputedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Data quality metadata for this normalization run.</summary>
    public NormalizationMeta Meta { get; set; } = new();
}
