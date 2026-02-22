using CreatorIQ.Api.Services.Normalization.Helpers;
using CreatorIQ.Api.Services.Normalization.Models;

namespace CreatorIQ.Api.Services.Normalization.Normalizers;

/// <summary>
/// Computes the Regional Strength Score (0–100) measuring geographic audience concentration.
///
/// Algorithm:
/// 1. Compute the Herfindahl-Hirschman Index (HHI) of the regional distribution.
///    HHI = Σ(share_i²), where share_i = region_value / total_value.
///    Result is in [1/N, 1.0], where N = number of regions.
/// 2. Min-Max normalize HHI from the theoretical range [1/N, 1.0] to [0, 100].
///
/// Interpretation:
///   - Score near 100 = interest is concentrated in 1-2 regions (e.g., US and Canada dominate).
///     Benefit: Easier to target content, higher relevance per region.
///   - Score near 0 = interest is uniformly distributed globally.
///     This is informative, not necessarily bad — just harder to hyper-target.
///
/// Trade-off: The HHI approach is mathematically sound but sensitive to high N (many regions).
/// With 50+ regions and uniform distribution, HHI approaches 0.02, giving a clean low score.
/// A potential future enhancement is weighted HHI where only top-K regions are considered.
/// </summary>
public static class RegionNormalizer
{
    /// <summary>
    /// Computes the regional strength score for a topic.
    /// </summary>
    /// <param name="regionalInterest">Dictionary of region → interest (0–100).</param>
    /// <param name="meta">Mutation target for metadata flags and warnings.</param>
    /// <returns>A score in [0.0, 100.0], rounded to 1 decimal place.</returns>
    public static double Compute(
        IReadOnlyDictionary<string, int> regionalInterest,
        NormalizationMeta meta)
    {
        if (regionalInterest.Count == 0)
        {
            meta.Warnings.Add("Regional strength set to neutral (50.0): no regional interest data available.");
            return 50.0;
        }

        var values = regionalInterest.Values.Select(v => (double)v).ToList();

        // Step 1: Compute HHI. This gives a value in [1/N, 1.0]
        double hhi = MathHelpers.HHI(values);

        // Step 2: Compute the min-max bounds for the HHI range given N regions
        int n = values.Count;
        double hhi_min = 1.0 / n;    // Perfectly uniform distribution
        double hhi_max = 1.0;         // Fully concentrated (one region = 100%)

        // Step 3: MinMax normalize into [0, 100]
        double score = MathHelpers.MinMaxNormalize(hhi, hhi_min, hhi_max);
        return Math.Round(score, 1);
    }
}
