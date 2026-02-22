using CreatorIQ.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CreatorIQ.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<TrendEntry> Trends { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<TrendEntry>()
            .HasIndex(t => t.Topic);
    }
}
