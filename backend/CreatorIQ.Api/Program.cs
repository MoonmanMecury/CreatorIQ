using CreatorIQ.Api.Data;
using CreatorIQ.Api.Repositories;
using CreatorIQ.Api.Services;
using CreatorIQ.Api.Services.Conductor;
using CreatorIQ.Api.Services.Encryption;
using CreatorIQ.Api.Services.Normalization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower;
    });

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();

// Custom Services
builder.Services.AddScoped<ITrendService, TrendService>();
builder.Services.AddScoped<IYouTubeService, YouTubeService>();
builder.Services.AddScoped<INormalizationService, NormalizationService>();

// Conductor & API Key Services
builder.Services.AddDataProtection();
builder.Services.AddHttpClient<IKeyVerificationService, KeyVerificationService>();
builder.Services.AddHttpClient<IUniversalLLMCaller, UniversalLLMCaller>();
builder.Services.AddScoped<IApiKeyEncryptionService, ApiKeyEncryptionService>();
builder.Services.AddScoped<IUserApiKeyRepository, UserApiKeyRepository>();

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var secret = builder.Configuration["Jwt:Secret"] ?? "a-very-long-secret-key-that-is-at-least-32-chars";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false, // Set to true and configure Issuer in production
            ValidateAudience = false, // Set to true and configure Audience in production
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
        };
    });

// CORS configuration for Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJS", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Next.js default port
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowNextJS");
app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        // Use EnsureCreated for MVP to avoid migration setup issues
        db.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Could not ensure database is created. The app will continue, but trend storage may fail.");
    }
}

app.MapControllers();

app.Run();
