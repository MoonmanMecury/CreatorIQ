namespace CreatorIQ.Api.Services.Normalization.Models;

/// <summary>
/// Metadata about the quality and completeness of a normalization run.
/// Consumers should inspect Warnings before using scores for high-stakes decisions.
/// </summary>
public class NormalizationMeta
{
    /// <summary>True if the demand score was estimated due to insufficient data points.</summary>
    public bool IsDemandEstimated { get; set; }

    /// <summary>True if the growth score was estimated due to insufficient data points.</summary>
    public bool IsGrowthEstimated { get; set; }

    /// <summary>Number of YouTube videos used for engagement score calculation.</summary>
    public int VideoSampleSize { get; set; }

    /// <summary>Number of Google Trends data points used for demand/growth scoring.</summary>
    public int TrendDataPoints { get; set; }

    /// <summary>
    /// Human-readable warnings about data quality issues encountered during normalization.
    /// An empty list means the normalization ran cleanly.
    /// </summary>
    public List<string> Warnings { get; set; } = new();
}
