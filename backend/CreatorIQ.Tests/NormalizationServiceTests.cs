using CreatorIQ.Api.Services.Normalization;
using CreatorIQ.Api.Services.Normalization.Models;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace CreatorIQ.Tests;

public class NormalizationServiceTests
{
    private readonly NormalizationService _sut = new(NullLogger<NormalizationService>.Instance);

    // ─── Helpers ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Generates a synthetic Google Trends time series for testing.
    /// </summary>
    /// <param name="startValue">The interest value at week 0.</param>
    /// <param name="slope">How many points to add per week.</param>
    /// <param name="weeks">How many data points to produce.</param>
    private static List<TrendDataPoint> GenerateTrend(double startValue, double slope, int weeks)
    {
        var baseDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        return Enumerable.Range(0, weeks)
            .Select(i => new TrendDataPoint(
                Date: baseDate.AddDays(i * 7),
                Value: (int)Math.Clamp(startValue + slope * i, 0, 100)))
            .ToList();
    }

    // ─── Test 1: Fully populated rising trend ────────────────────────────────────

    [Fact]
    public void Normalize_FullyPopulated_RisingTrend_AllScoresInRangeAndGrowthAbove50()
    {
        // Arrange: the "home workout" success scenario from the prompt
        var raw = new RawTopicMetrics
        {
            Topic = "home workout",
            InterestOverTime = GenerateTrend(startValue: 40, slope: 2, weeks: 12),
            TotalVideoCount = 850_000,
            Videos = Enumerable.Repeat(
                new RawVideoMetrics(Views: 50_000, Likes: 1_200, Comments: 300), 20).ToList(),
            RegionalInterest = new Dictionary<string, int>
            {
                ["United States"] = 100,
                ["United Kingdom"] = 75,
                ["Canada"] = 68,
                ["Australia"] = 60
            }
        };

        // Act
        var result = _sut.Normalize(raw);

        // Assert – all scores in valid range
        Assert.InRange(result.DemandScore, 0, 100);
        Assert.InRange(result.GrowthScore, 0, 100);
        Assert.InRange(result.SupplyScore, 0, 100);
        Assert.InRange(result.EngagementScore, 0, 100);
        Assert.InRange(result.RegionalStrength, 0, 100);

        // Growth score MUST be > 50 for a rising trend
        Assert.True(result.GrowthScore > 50,
            $"Expected growth score > 50 for rising trend, got {result.GrowthScore}");

        // No data quality warnings expected for full data
        Assert.Empty(result.Meta.Warnings);
        Assert.False(result.Meta.IsDemandEstimated);
        Assert.False(result.Meta.IsGrowthEstimated);
    }

    // ─── Test 2: Fully empty input ───────────────────────────────────────────────

    [Fact]
    public void Normalize_EmptyInput_ReturnsFallbacksAndPopulatesWarnings()
    {
        // Arrange
        var raw = new RawTopicMetrics
        {
            Topic = "empty topic"
            // All collections left at default (empty)
        };

        // Act
        var result = _sut.Normalize(raw);

        // Assert – all scores are neutral fallbacks or zero
        Assert.Equal(50.0, result.DemandScore);    // Neutral fallback
        Assert.Equal(50.0, result.GrowthScore);     // Neutral fallback
        Assert.Equal(0.0, result.SupplyScore);      // Zero videos → zero supply
        Assert.Equal(50.0, result.EngagementScore); // No valid videos → neutral
        Assert.Equal(50.0, result.RegionalStrength); // No regions → neutral

        // Metadata flags
        Assert.True(result.Meta.IsDemandEstimated);
        Assert.True(result.Meta.IsGrowthEstimated);
        Assert.NotEmpty(result.Meta.Warnings); // Must have at least one warning
    }

    // ─── Test 3: Declining trend ─────────────────────────────────────────────────

    [Fact]
    public void Normalize_DecliningTrend_GrowthScoreBelow50()
    {
        // Arrange: starts at 80, drops ~3 points/week
        var raw = new RawTopicMetrics
        {
            Topic = "fax machine",
            InterestOverTime = GenerateTrend(startValue: 80, slope: -3, weeks: 12),
            TotalVideoCount = 100_000,
            Videos = new List<RawVideoMetrics>
            {
                new(Views: 5000, Likes: 50, Comments: 10)
            },
            RegionalInterest = new Dictionary<string, int> { ["US"] = 70, ["DE"] = 30 }
        };

        // Act
        var result = _sut.Normalize(raw);

        // Assert – declining trend must produce growth score < 50
        Assert.True(result.GrowthScore < 50,
            $"Expected growth score < 50 for declining trend, got {result.GrowthScore}");
        Assert.InRange(result.GrowthScore, 0, 100);
    }

    // ─── Test 4: Maximum supply (10M+ videos) ────────────────────────────────────

    [Fact]
    public void Normalize_MaximumVideoCount_SupplyScoreNearHundred()
    {
        // Arrange: 10M+ videos — expected to produce supply score near 100
        var raw = new RawTopicMetrics
        {
            Topic = "music",
            InterestOverTime = GenerateTrend(50, 0, 8),
            TotalVideoCount = 15_000_000,
            Videos = new List<RawVideoMetrics> { new(Views: 200, Likes: 10, Comments: 2) },
            RegionalInterest = new Dictionary<string, int> { ["US"] = 100 }
        };

        // Act
        var result = _sut.Normalize(raw);

        // Assert – must be at or near ceiling for saturated markets
        Assert.True(result.SupplyScore >= 95.0,
            $"Expected supply score >= 95 for 15M videos, got {result.SupplyScore}");
    }

    // ─── Test 5: Zero video count ────────────────────────────────────────────────

    [Fact]
    public void Normalize_ZeroVideoCount_SupplyScoreIsZero()
    {
        // Arrange: brand new niche with absolutely no YouTube content
        var raw = new RawTopicMetrics
        {
            Topic = "quantum synergy farming",
            InterestOverTime = GenerateTrend(30, 1, 6),
            TotalVideoCount = 0,
            Videos = new List<RawVideoMetrics>(),
            RegionalInterest = new Dictionary<string, int>()
        };

        // Act
        var result = _sut.Normalize(raw);

        // Assert – zero videos = zero supply = zero competition
        Assert.Equal(0.0, result.SupplyScore);
        Assert.NotEmpty(result.Meta.Warnings); // Supply warning expected
    }

    // ─── Test 6: Null input guard ────────────────────────────────────────────────

    [Fact]
    public void Normalize_NullInput_ThrowsArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => _sut.Normalize(null!));
    }
}
