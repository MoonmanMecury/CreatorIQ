namespace CreatorIQ.Api.Models;

public class CreatorAnalysisResponse
{
    public CreatorProfile Profile { get; set; } = new();
    public EngagementBreakdown EngagementBreakdown { get; set; } = new();
    public AudienceOverview AudienceOverview { get; set; } = new();
    public CompetitionDensity CompetitionDensity { get; set; } = new();
}

public class CreatorProfile
{
    public string Name { get; set; } = string.Empty;
    public string Followers { get; set; } = string.Empty;
    public string EngagementRate { get; set; } = string.Empty;
    public string GrowthRate { get; set; } = string.Empty;
}

public class EngagementBreakdown
{
    public List<EngagementPost> Posts { get; set; } = new();
    public List<EngagementTrend> Trend { get; set; } = new();
}

public class EngagementPost
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Engagement { get; set; }
}

public class EngagementTrend
{
    public string Date { get; set; } = string.Empty;
    public double Rate { get; set; }
}

public class AudienceOverview
{
    public List<AudienceRegion> Regions { get; set; } = new();
    public List<AgeSegment> AgeSegments { get; set; } = new();
}

public class AudienceRegion
{
    public string Name { get; set; } = string.Empty;
    public double Value { get; set; }
}

public class AgeSegment
{
    public string Segment { get; set; } = string.Empty;
    public double Percentage { get; set; }
}

public class CompetitionDensity
{
    public int SaturationScore { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}
