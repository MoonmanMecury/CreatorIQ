using CreatorIQ.Api.Services.Normalization.Helpers;
using CreatorIQ.Api.Services.Normalization.Models;

namespace CreatorIQ.Api.Services.Normalization.Normalizers;

/// <summary>
/// Computes the Demand Score (0–100) from Google Trends interest-over-time data.
///
/// Algorithm: Exponential weighted average of the most recent N weeks,
/// where weights are powers of 2 (2^0, 2^1, ..., 2^(n-1)), with the most
/// recent week having the highest weight. This heavily emphasizes recency
/// over historical baseline.
///
/// Trade-off: Recency bias means that a single high week can significantly raise the score.
/// This is intentional — current demand matters more than 3-month-old interest.
/// </summary>
public static class DemandNormalizer
{
    // --- Tunable Constants ---

    /// <summary>How many of the most recent trend weeks to use for the weighted average.</summary>
    private const int DemandRecentWeeks = 8;

    /// <summary>Minimum data points required before returning an estimate instead of a computed score.</summary>
    private const int MinTrendPointsRequired = 4;

    /// <summary>
    /// Computes the demand score for a topic.
    /// </summary>
    /// <param name="interestOverTime">Ordered time series of trend interest, oldest to newest.</param>
    /// <param name="meta">Mutation target for metadata flags and warnings.</param>
    /// <returns>A score in [0.0, 100.0], rounded to 1 decimal place.</returns>
    public static double Compute(
        IReadOnlyList<TrendDataPoint> interestOverTime,
        NormalizationMeta meta)
    {
        meta.TrendDataPoints = interestOverTime.Count;

        if (interestOverTime.Count < MinTrendPointsRequired)
        {
            meta.IsDemandEstimated = true;
            meta.Warnings.Add(
                $"Demand score estimated (neutral 50.0): only {interestOverTime.Count} trend data point(s) found, " +
                $"minimum required is {MinTrendPointsRequired}.");
            return 50.0;
        }

        // Take the most recent N weeks for calculation
        var recent = interestOverTime
            .TakeLast(DemandRecentWeeks)
            .ToList();

        // Assign exponential weights: oldest = 2^0 = 1, newest = 2^(n-1)
        int n = recent.Count;
        double weightedSum = 0;
        double totalWeight = 0;

        for (int i = 0; i < n; i++)
        {
            double weight = Math.Pow(2, i); // 2^0 for oldest, 2^(n-1) for newest
            weightedSum += recent[i].Value * weight;
            totalWeight += weight;
        }

        // The raw value is already on a 0-100 scale from Google Trends
        double score = totalWeight > 0 ? weightedSum / totalWeight : 50.0;
        return Math.Round(MathHelpers.Clamp100(score), 1);
    }
}
