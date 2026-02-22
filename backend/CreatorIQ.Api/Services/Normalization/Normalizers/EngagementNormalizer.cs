using CreatorIQ.Api.Services.Normalization.Helpers;
using CreatorIQ.Api.Services.Normalization.Models;

namespace CreatorIQ.Api.Services.Normalization.Normalizers;

/// <summary>
/// Computes the Engagement Score (0–100) representing content quality signal on YouTube.
///
/// Algorithm:
/// 1. Filter to videos with > MinVideoViewThreshold views (removes noise from tiny/test videos)
/// 2. Compute per-video rate = (likes + comments) / views
/// 3. Average across all valid videos
/// 4. Apply asymptotic mapping: score = (1 - e^(-k * avgRate)) / (1 - e^(-k * refRate)) * 100
///    where k = EngagementSteepness (60), refRate = HighEngagementRate (0.05 = 5%).
///    This creates a curve where the score climbs steeply from 0 to 5% engagement, then flattens.
///
/// Trade-off: The asymptotic curve prevents a single outlier video with an extreme engagement rate
/// from inflating the score to 100. The reference rate of 5% is a generous benchmark —
/// typical YouTube engagement is 1–3%, so 5%+ justifies a near-maximum signal.
/// Normalizing by refRate ensures the denominator is a constant, keeping scores stable across topics.
/// </summary>
public static class EngagementNormalizer
{
    // --- Tunable Constants ---

    /// <summary>Minimum view count for a video to be included in engagement calculation. Filters bots/noise.</summary>
    private const int MinVideoViewThreshold = 100;

    /// <summary>The engagement rate (likes+comments)/views at which the score approaches ~100.</summary>
    private const double HighEngagementRate = 0.05;

    /// <summary>Controls the steepness of the asymptotic mapping curve. Higher = steeper initial climb.</summary>
    private const double EngagementSteepness = 60.0;

    /// <summary>Pre-computed denominator for the asymptotic formula. Computed once at startup.</summary>
    private static readonly double AsymptoticDenominator = 1.0 - Math.Exp(-EngagementSteepness * HighEngagementRate);

    /// <summary>
    /// Computes the engagement score for a topic based on YouTube video metrics.
    /// </summary>
    /// <param name="videos">List of video metrics with views, likes, and comments.</param>
    /// <param name="meta">Mutation target for metadata flags and warnings.</param>
    /// <returns>A score in [0.0, 100.0], rounded to 1 decimal place.</returns>
    public static double Compute(IReadOnlyList<RawVideoMetrics> videos, NormalizationMeta meta)
    {
        // Filter to only videos with meaningful view counts — noise reduction gate
        var validVideos = videos
            .Where(v => v.Views >= MinVideoViewThreshold)
            .ToList();

        meta.VideoSampleSize = validVideos.Count;

        if (validVideos.Count == 0)
        {
            meta.Warnings.Add(
                "Engagement score set to neutral (50.0): no valid video samples found with " +
                $"more than {MinVideoViewThreshold} views.");
            return 50.0;
        }

        // Compute per-video engagement rate and average
        double avgRate = validVideos
            .Select(v => (double)(v.Likes + v.Comments) / v.Views)
            .Average();

        // Asymptotic curve mapping: maps [0, ∞) → [0, 100] with 5% engagement ≈ 100
        // This ensures no single crazy rate can saturate the score artificially
        double numerator = 1.0 - Math.Exp(-EngagementSteepness * avgRate);
        double score = (numerator / AsymptoticDenominator) * 100.0;

        return Math.Round(MathHelpers.Clamp100(score), 1);
    }
}
