using System;

namespace CreatorIQ.Api.Models;

public class UserConductorPreferences
{
    public string UserId { get; set; } = string.Empty;
    public string ActiveProvider { get; set; } = "anthropic";
    public string ActiveModel { get; set; } = string.Empty;
    public string? FallbackProvider { get; set; }
    public string? FallbackModel { get; set; }
    public bool StreamingEnabled { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
