using CreatorIQ.Api.Services.Normalization.Helpers;
using CreatorIQ.Api.Services.Normalization.Models;

namespace CreatorIQ.Api.Services.Normalization.Normalizers;

/// <summary>
/// Computes the Supply Score (0–100) representing content market saturation on YouTube.
///
/// Algorithm: Log10 normalization: score = log10(videoCount + 1) / MaxLogValue * 100
/// The +1 prevents log(0) and ensures topics with 0 videos score 0.
/// MaxLogValue = log10(10,000,000) = 7.0, treating 10M videos as a 100/100 saturated market.
///
/// Trade-off: Logarithmic scale is appropriate for this metric because video counts span
/// 5+ orders of magnitude across niches. A linear scale would compress almost all real niches
/// into a tiny slice near zero. The ceiling of 10M is an assumption; some mega-niches may exceed
/// this, but those niches are so saturated that capping at 100 is semantically correct.
/// </summary>
public static class SupplyNormalizer
{
    // --- Tunable Constants ---

    /// <summary>log10(10,000,000) — the video count at which supply score reaches 100.</summary>
    private const double MaxLogValue = 7.0;

    /// <summary>
    /// Computes the supply (market saturation) score for a topic.
    /// </summary>
    /// <param name="totalVideoCount">Total YouTube video count returned for the topic query.</param>
    /// <param name="meta">Mutation target for metadata flags and warnings.</param>
    /// <returns>A score in [0.0, 100.0], rounded to 1 decimal place.</returns>
    public static double Compute(long totalVideoCount, NormalizationMeta meta)
    {
        if (totalVideoCount <= 0)
        {
            meta.Warnings.Add("Supply score is 0: no YouTube videos found for this topic.");
            return 0.0;
        }

        // Use +1 to make the formula defined at videoCount = 0
        double raw = MathHelpers.LogNormalize(totalVideoCount + 1, MaxLogValue);
        return Math.Round(raw, 1);
    }
}
