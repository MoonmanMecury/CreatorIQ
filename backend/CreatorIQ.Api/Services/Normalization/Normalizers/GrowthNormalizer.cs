using CreatorIQ.Api.Services.Normalization.Helpers;
using CreatorIQ.Api.Services.Normalization.Models;

namespace CreatorIQ.Api.Services.Normalization.Normalizers;

/// <summary>
/// Computes the Growth Score (0–100) representing the trend velocity (acceleration/deceleration).
///
/// Algorithm: Linear regression (OLS) slope over the full interest time series.
/// Maps slope to 0–100 using: score = (slope / MaxSlopePerWeek) * 50 + 50
/// where slope of 0 = score 50 (neutral), +MaxSlopePerWeek = 100, -MaxSlopePerWeek = 0.
///
/// Trade-off: Highly sensitive to single-week spikes at the start or end of the series.
/// A pure OLS slope is more robust than just comparing first/last week, but for very
/// noisy or seasonal data, smoothing before regression would improve accuracy.
/// </summary>
public static class GrowthNormalizer
{
    // --- Tunable Constants ---

    /// <summary>The slope value at which the growth score saturates at ~100 (or ~0 for negative).</summary>
    private const double MaxSlopePerWeek = 3.0;

    /// <summary>Minimum data points required before returning an estimate instead of a computed score.</summary>
    private const int MinTrendPointsRequired = 4;

    /// <summary>
    /// Computes the growth (trend velocity) score for a topic.
    /// </summary>
    /// <param name="interestOverTime">Ordered time series of trend interest, oldest to newest.</param>
    /// <param name="meta">Mutation target for metadata flags and warnings.</param>
    /// <returns>A score in [0.0, 100.0], rounded to 1 decimal place.</returns>
    public static double Compute(
        IReadOnlyList<TrendDataPoint> interestOverTime,
        NormalizationMeta meta)
    {
        if (interestOverTime.Count < MinTrendPointsRequired)
        {
            meta.IsGrowthEstimated = true;
            meta.Warnings.Add(
                $"Growth score estimated (neutral 50.0): only {interestOverTime.Count} trend data point(s) found, " +
                $"minimum required is {MinTrendPointsRequired}.");
            return 50.0;
        }

        // Build (x, y) pairs where x = week index (0, 1, 2...) and y = interest value
        var points = interestOverTime
            .Select((pt, idx) => ((double)idx, (double)pt.Value))
            .ToList();

        double slope = MathHelpers.LinearSlope(points);

        // Map [-MaxSlopePerWeek, +MaxSlopePerWeek] → [0, 100]
        // slope of 0 → 50, slope of +MaxSlope → 100, slope of -MaxSlope → 0
        double score = (slope / MaxSlopePerWeek) * 50.0 + 50.0;
        return Math.Round(MathHelpers.Clamp100(score), 1);
    }
}
