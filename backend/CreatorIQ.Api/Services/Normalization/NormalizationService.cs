using CreatorIQ.Api.Services.Normalization.Models;
using CreatorIQ.Api.Services.Normalization.Normalizers;

namespace CreatorIQ.Api.Services.Normalization;

/// <summary>
/// Contract for the normalization service orchestrator.
/// </summary>
public interface INormalizationService
{
    /// <summary>
    /// Normalizes raw topic metrics from multiple data sources into a unified,
    /// comparable set of 0–100 scores.
    /// </summary>
    /// <param name="raw">The raw metrics to normalize. Must not be null.</param>
    /// <returns>
    ///   A <see cref="NormalizedTopicMetrics"/> object with all five scores computed,
    ///   accompanied by data quality metadata.
    /// </returns>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="raw"/> is null.</exception>
    NormalizedTopicMetrics Normalize(RawTopicMetrics raw);
}

/// <summary>
/// Orchestrates the full normalization pipeline.
/// Delegates each dimension of scoring to the appropriate standalone normalizer,
/// then assembles the final output object.
///
/// This class is registered as Scoped in ASP.NET Core DI and is stateless —
/// no instance fields, no shared mutable state. Same input always produces same output.
/// </summary>
public class NormalizationService : INormalizationService
{
    private readonly ILogger<NormalizationService> _logger;

    public NormalizationService(ILogger<NormalizationService> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc />
    public NormalizedTopicMetrics Normalize(RawTopicMetrics raw)
    {
        ArgumentNullException.ThrowIfNull(raw, nameof(raw));
        if (string.IsNullOrWhiteSpace(raw.Topic))
            throw new ArgumentException("Topic must not be null or whitespace.", nameof(raw));

        _logger.LogInformation("Starting normalization for topic: {Topic}", raw.Topic);

        // Shared metadata object – mutated by each normalizer to record warnings and quality flags
        var meta = new NormalizationMeta();

        // Execute each normalizer independently — failures in one do not cascade
        double demandScore = RunSafe(() =>
            DemandNormalizer.Compute(raw.InterestOverTime, meta),
            fallback: 50.0, meta, "DemandNormalizer");

        double growthScore = RunSafe(() =>
            GrowthNormalizer.Compute(raw.InterestOverTime, meta),
            fallback: 50.0, meta, "GrowthNormalizer");

        double supplyScore = RunSafe(() =>
            SupplyNormalizer.Compute(raw.TotalVideoCount, meta),
            fallback: 0.0, meta, "SupplyNormalizer");

        double engagementScore = RunSafe(() =>
            EngagementNormalizer.Compute(raw.Videos, meta),
            fallback: 50.0, meta, "EngagementNormalizer");

        double regionalStrength = RunSafe(() =>
            RegionNormalizer.Compute(raw.RegionalInterest, meta),
            fallback: 50.0, meta, "RegionNormalizer");

        var result = new NormalizedTopicMetrics
        {
            Topic = raw.Topic,
            DemandScore = demandScore,
            GrowthScore = growthScore,
            SupplyScore = supplyScore,
            EngagementScore = engagementScore,
            RegionalStrength = regionalStrength,
            ComputedAt = DateTime.UtcNow,
            Meta = meta
        };

        _logger.LogInformation(
            "Normalization complete for [{Topic}]: Demand={D}, Growth={G}, Supply={S}, Engagement={E}, Regional={R}. Warnings: {W}",
            raw.Topic, demandScore, growthScore, supplyScore, engagementScore, regionalStrength,
            meta.Warnings.Count);

        return result;
    }

    /// <summary>
    /// Wraps a normalizer call in exception handling. If a normalizer throws,
    /// the error is logged, a warning is added to metadata, and the fallback value is used.
    /// This ensures a partial data failure never crashes the entire pipeline.
    /// </summary>
    private double RunSafe(
        Func<double> normalizer,
        double fallback,
        NormalizationMeta meta,
        string normalizerName)
    {
        try
        {
            return normalizer();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Normalizer {Name} threw an exception. Using fallback value {Fallback}.", normalizerName, fallback);
            meta.Warnings.Add($"{normalizerName} failed with an unexpected error. Score defaulted to {fallback}.");
            return fallback;
        }
    }
}
