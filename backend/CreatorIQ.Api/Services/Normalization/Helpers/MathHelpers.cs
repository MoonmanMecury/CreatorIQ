namespace CreatorIQ.Api.Services.Normalization.Helpers;

/// <summary>
/// Pure, stateless mathematical utility functions used across all normalizers.
/// All methods are deterministic and have no side effects.
/// </summary>
public static class MathHelpers
{
    /// <summary>
    /// Clamps a value to the valid score range [0, 100].
    /// </summary>
    /// <param name="value">The raw score to clamp.</param>
    /// <returns>A value in [0.0, 100.0].</returns>
    public static double Clamp100(double value) => Math.Clamp(value, 0.0, 100.0);

    /// <summary>
    /// Maps a value linearly into the [0, 100] range using a known min/max boundary.
    /// Used when the business domain defines a clear ceiling and floor.
    /// Returns 50.0 as a neutral fallback when min equals max (division-by-zero guard).
    /// </summary>
    /// <param name="value">The value to normalize.</param>
    /// <param name="min">The lower bound of the expected input range.</param>
    /// <param name="max">The upper bound of the expected input range.</param>
    /// <returns>A value in [0.0, 100.0].</returns>
    public static double MinMaxNormalize(double value, double min, double max)
    {
        if (Math.Abs(max - min) < double.Epsilon)
        {
            return 50.0; // Neutral fallback: no meaningful spread exists
        }
        return Clamp100((value - min) / (max - min) * 100.0);
    }

    /// <summary>
    /// Applies log10-based normalization to compress very large value ranges.
    /// Essential for video count normalization where ranges span many orders of magnitude.
    /// Handles non-positive values gracefully by returning 0.
    /// </summary>
    /// <param name="value">The raw value (e.g., video count).</param>
    /// <param name="maxLogValue">
    ///   The log10 of the maximum expected value (e.g., 7.0 for 10M max).
    ///   Defines the ceiling at which score = 100.
    /// </param>
    /// <returns>A value in [0.0, 100.0].</returns>
    public static double LogNormalize(double value, double maxLogValue)
    {
        if (value <= 0) return 0.0;
        return Clamp100(Math.Log10(value) / maxLogValue * 100.0);
    }

    /// <summary>
    /// Computes the slope of a linear regression (OLS) over a series of (x, y) data points.
    /// Used to measure trend velocity — the rate of change of interest over time.
    /// Returns 0 if fewer than 2 points are provided (no slope computable).
    /// </summary>
    /// <param name="points">A sequence of (x, y) pairs, where x = time index, y = interest value.</param>
    /// <returns>
    ///   The slope (Δy per unit Δx). Positive = growing, Negative = declining.
    /// </returns>
    public static double LinearSlope(IReadOnlyList<(double x, double y)> points)
    {
        if (points.Count < 2) return 0.0;

        int n = points.Count;
        double sumX = points.Sum(p => p.x);
        double sumY = points.Sum(p => p.y);
        double sumXY = points.Sum(p => p.x * p.y);
        double sumX2 = points.Sum(p => p.x * p.x);

        double denominator = n * sumX2 - sumX * sumX;
        if (Math.Abs(denominator) < double.Epsilon) return 0.0;

        return (n * sumXY - sumX * sumY) / denominator;
    }

    /// <summary>
    /// Computes the Herfindahl-Hirschman Index (HHI) from a collection of raw values.
    /// HHI measures market concentration. Here, it measures geographic concentration of audience interest.
    /// Formula: HHI = Σ(share_i²), where share_i = value_i / totalValue.
    /// Returns 1.0 (maximum concentration) if the collection is empty or sums to zero.
    /// </summary>
    /// <param name="values">Raw values representing each region's interest magnitude.</param>
    /// <returns>
    ///   A value in [1/N, 1.0]. Near 1.0 = fully concentrated. Near 1/N = perfectly distributed.
    /// </returns>
    public static double HHI(IReadOnlyList<double> values)
    {
        if (values.Count == 0) return 1.0;
        
        double total = values.Sum();
        if (total <= 0) return 1.0; // Treat as fully concentrated if no data

        return values
            .Select(v => v / total)
            .Select(share => share * share)
            .Sum();
    }
}
