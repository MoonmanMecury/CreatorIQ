using CreatorIQ.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace CreatorIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CreatorsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetCreatorAnalysis([FromQuery] string handle = "tech_creator")
    {
        // Mocking sophisticated analysis data for MVP
        var response = new CreatorAnalysisResponse
        {
            Profile = new CreatorProfile
            {
                Name = "Sarah Developer",
                Followers = "125K",
                EngagementRate = "4.8%",
                GrowthRate = "+12% MoM"
            },
            EngagementBreakdown = new EngagementBreakdown
            {
                Posts = new List<EngagementPost>
                {
                    new() { Id = "P001", Type = "Video", Engagement = 8500 },
                    new() { Id = "P002", Type = "Image", Engagement = 4200 },
                    new() { Id = "P003", Type = "Carousel", Engagement = 6700 },
                    new() { Id = "P004", Type = "Video", Engagement = 12000 }
                },
                Trend = Enumerable.Range(0, 7).Select(i => new EngagementTrend
                {
                    Date = DateTime.Now.AddDays(-i).ToString("yyyy-MM-dd"),
                    Rate = 3.5 + Random.Shared.NextDouble() * 2
                }).Reverse().ToList()
            },
            AudienceOverview = new AudienceOverview
            {
                Regions = new List<AudienceRegion>
                {
                    new() { Name = "USA", Value = 45 },
                    new() { Name = "UK", Value = 15 },
                    new() { Name = "Germany", Value = 10 },
                    new() { Name = "Others", Value = 30 }
                },
                AgeSegments = new List<AgeSegment>
                {
                    new() { Segment = "18-24", Percentage = 25 },
                    new() { Segment = "25-34", Percentage = 55 },
                    new() { Segment = "35-44", Percentage = 15 },
                    new() { Segment = "45+", Percentage = 5 }
                }
            },
            CompetitionDensity = new CompetitionDensity
            {
                SaturationScore = 65,
                Status = "Moderate Saturation",
                Color = "yellow"
            }
        };

        return Ok(response);
    }
}
