using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CreatorIQ.Api.Models
{
    [Table("user_api_keys")]
    public class UserApiKey
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(255)]
        public string UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Provider { get; set; }

        [Required]
        public string EncryptedKey { get; set; }

        [Required]
        [MaxLength(10)]
        public string KeyHint { get; set; }

        [Required]
        [MaxLength(100)]
        public string ModelPreference { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? LastVerifiedAt { get; set; }

        public bool Verified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("user_conductor_preferences")]
    public class UserConductorPreferences
    {
        [Key]
        [MaxLength(255)]
        public string UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string ActiveProvider { get; set; } = "anthropic";

        [Required]
        [MaxLength(100)]
        public string ActiveModel { get; set; }

        [MaxLength(50)]
        public string? FallbackProvider { get; set; }

        [MaxLength(100)]
        public string? FallbackModel { get; set; }

        public bool StreamingEnabled { get; set; } = true;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
