using Microsoft.EntityFrameworkCore;
using CreatorIQ.Api.Models;

namespace CreatorIQ.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<TrendEntry> Trends { get; set; } = null!;
    public DbSet<UserApiKey> UserApiKeys { get; set; } = null!;
    public DbSet<UserConductorPreferences> UserConductorPreferences { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Ensure table name matches TrendService and previous conventions
        modelBuilder.Entity<TrendEntry>().ToTable("Trends");

        modelBuilder.Entity<UserApiKey>(entity =>
        {
            entity.ToTable("user_api_keys");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.UserId, e.Provider }).IsUnique();
        });

        modelBuilder.Entity<UserConductorPreferences>(entity =>
        {
            entity.ToTable("user_conductor_preferences");
            entity.HasKey(e => e.UserId);
        });
    }
}
