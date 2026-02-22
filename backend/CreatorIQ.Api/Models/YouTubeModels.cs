using System.Text.Json.Serialization;

namespace CreatorIQ.Api.Models;

public class YouTubeAnalysisResponse
{
    [JsonPropertyName("topic")]
    public string Topic { get; set; } = string.Empty;

    [JsonPropertyName("video_count")]
    public int VideoCount { get; set; }

    [JsonPropertyName("top_videos")]
    public List<YouTubeVideoInfo> TopVideos { get; set; } = new();

    [JsonPropertyName("competition_score")]
    public int CompetitionScore { get; set; }

    [JsonPropertyName("engagement_rate_avg")]
    public double EngagementRateAvg { get; set; }

    [JsonPropertyName("is_mock")]
    public bool IsMock { get; set; }
}

public class YouTubeVideoInfo
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("views")]
    public long Views { get; set; }

    [JsonPropertyName("likes")]
    public long Likes { get; set; }

    [JsonPropertyName("comments")]
    public long Comments { get; set; }

    [JsonPropertyName("channel_subs")]
    public long ChannelSubs { get; set; }

    [JsonPropertyName("engagement_rate")]
    public double EngagementRate { get; set; }
}

public class YouTubeSearchFilters
{
    public string? RegionCode { get; set; }
    public string? Language { get; set; }
    public DateTime? PublishedAfter { get; set; }
    public int MaxResults { get; set; } = 10;
}
