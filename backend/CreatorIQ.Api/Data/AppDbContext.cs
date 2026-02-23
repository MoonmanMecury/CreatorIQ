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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Ensure table name matches TrendService and previous conventions
        modelBuilder.Entity<TrendEntry>().ToTable("Trends");
    }
}
