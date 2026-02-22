using System.ComponentModel.DataAnnotations;

namespace CreatorIQ.Api.Models;

public class TrendEntry
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Topic { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string RawPytrendsData { get; set; } = string.Empty;

    public string RawYouTubeData { get; set; } = string.Empty;

    public int NicheScore { get; set; }

    public double TrendVelocity { get; set; }

    public string CompetitionDensity { get; set; } = "Low";

    public string NormalizedResultJson { get; set; } = string.Empty;
}
