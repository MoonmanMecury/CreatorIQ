using System;

namespace CreatorIQ.Api.Models;

public class UserApiKey
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string EncryptedKey { get; set; } = string.Empty;
    public string KeyHint { get; set; } = string.Empty;
    public string ModelPreference { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime? LastVerifiedAt { get; set; }
    public bool Verified { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
