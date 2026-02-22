using System.Text.Json.Serialization;

namespace CreatorIQ.Api.Models;

public class TrendResponse
{
    [JsonPropertyName("main_topic")]
    public string MainTopic { get; set; } = string.Empty;

    [JsonPropertyName("niche_score")]
    public int NicheScore { get; set; }

    [JsonPropertyName("score")]
    public int Score { get => NicheScore; set => NicheScore = value; }

    [JsonPropertyName("trend_velocity")]
    public double TrendVelocity { get; set; }

    [JsonPropertyName("competition_density")]
    public string CompetitionDensity { get; set; } = "Low";

    [JsonPropertyName("revenue_potential")]
    public int RevenuePotential { get; set; }

    [JsonPropertyName("top_regions")]
    public List<string> TopRegions { get; set; } = new();

    [JsonPropertyName("trend_data")]
    public List<TrendPoint> TrendData { get; set; } = new();

    [JsonPropertyName("subtopics")]
    public List<Subtopic> Subtopics { get; set; } = new();

    [JsonPropertyName("keyword_clusters")]
    public List<KeywordCluster> KeywordClusters { get; set; } = new();

    [JsonPropertyName("opportunity_insights")]
    public OpportunityInsights OpportunityInsights { get; set; } = new();

    [JsonPropertyName("youtube_metrics")]
    public YouTubeTrendMetrics? YouTubeMetrics { get; set; }

    [JsonPropertyName("is_mock")]
    public bool IsMock { get; set; }
}

public class TrendPoint
{
    [JsonPropertyName("date")]
    public string Date { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public int Value { get; set; }
}

public class Subtopic
{
    [JsonPropertyName("keyword")]
    public string Keyword { get; set; } = string.Empty;

    [JsonPropertyName("growth_rate")]
    public double GrowthRate { get; set; }

    [JsonPropertyName("competition_score")]
    public int CompetitionScore { get; set; }

    [JsonPropertyName("recommendation")]
    public string Recommendation { get; set; } = string.Empty;
}

public class KeywordCluster
{
    [JsonPropertyName("keyword")]
    public string Keyword { get; set; } = string.Empty;

    [JsonPropertyName("volume")]
    public string Volume { get; set; } = "N/A";

    [JsonPropertyName("growth")]
    public double Growth { get; set; }
}

public class YouTubeTrendMetrics
{
    [JsonPropertyName("total_views")]
    public long TotalViews { get; set; }

    [JsonPropertyName("average_engagement")]
    public double AverageEngagement { get; set; }

    [JsonPropertyName("supply_count")]
    public int SupplyCount { get; set; }
}

public class OpportunityInsights
{
    [JsonPropertyName("underserved_angles")]
    public List<string> UnderservedAngles { get; set; } = new();

    [JsonPropertyName("emerging_keywords")]
    public List<string> EmergingKeywords { get; set; } = new();

    [JsonPropertyName("recommended_format")]
    public string RecommendedFormat { get; set; } = string.Empty;
}
