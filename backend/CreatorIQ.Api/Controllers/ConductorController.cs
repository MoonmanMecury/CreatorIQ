using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using CreatorIQ.Api.Repositories;
using CreatorIQ.Api.Services.Conductor;
using CreatorIQ.Api.Services.Encryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CreatorIQ.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/conductor")]
public class ConductorController : ControllerBase
{
    private readonly IUserApiKeyRepository _repository;
    private readonly IApiKeyEncryptionService _encryptionService;
    private readonly IUniversalLLMCaller _llmCaller;

    public ConductorController(
        IUserApiKeyRepository repository,
        IApiKeyEncryptionService encryptionService,
        IUniversalLLMCaller llmCaller)
    {
        _repository = repository;
        _encryptionService = encryptionService;
        _llmCaller = llmCaller;
    }

    private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value ?? string.Empty;

    [HttpPost("complete")]
    public async Task<IActionResult> Complete([FromBody] ConductorRequest request)
    {
        var prefs = await _repository.GetPreferences(UserId);
        if (prefs == null)
        {
            return Ok(new { hasKey = false, fallbackRequired = true });
        }

        var key = await _repository.GetByUserAndProvider(UserId, prefs.ActiveProvider);
        if (key == null)
        {
            return Ok(new { hasKey = false, fallbackRequired = true });
        }

        try
        {
            var rawKey = _encryptionService.Decrypt(key.EncryptedKey);

            // Note: In a real app, systemPrompt and context would be mapped based on 'request.Feature'
            // For now we expect them in the request or use defaults.
            // The frontend will provide the context and feature name.
            // We'll use the prompt from the frontend or a registry.

            var result = await _llmCaller.Complete(
                prefs.ActiveProvider,
                prefs.ActiveModel,
                rawKey,
                request.SystemPrompt ?? "You are a helpful assistant.",
                request.UserMessage ?? "{}",
                request.MaxTokens);

            return Ok(new
            {
                hasKey = true,
                fallbackRequired = false,
                content = result.Content,
                provider = result.Provider,
                model = result.Model,
                latencyMs = result.LatencyMs
            });
        }
        catch (Exception ex)
        {
            // Try fallback if configured
            if (!string.IsNullOrEmpty(prefs.FallbackProvider))
            {
                // Fallback logic could go here
            }

            return Ok(new
            {
                hasKey = true,
                fallbackRequired = true,
                error = ex.Message
            });
        }
    }

    [HttpPost("stream")]
    public async Task Stream([FromBody] ConductorRequest request)
    {
        var prefs = await _repository.GetPreferences(UserId);
        if (prefs == null || string.IsNullOrEmpty(prefs.ActiveProvider))
        {
            Response.StatusCode = 200;
            await Response.WriteAsync("data: {\"fallbackRequired\": true}\n\n");
            return;
        }

        var key = await _repository.GetByUserAndProvider(UserId, prefs.ActiveProvider);
        if (key == null)
        {
            Response.StatusCode = 200;
            await Response.WriteAsync("data: {\"fallbackRequired\": true}\n\n");
            return;
        }

        Response.ContentType = "text/event-stream";
        var rawKey = _encryptionService.Decrypt(key.EncryptedKey);

        var tokens = _llmCaller.Stream(
            prefs.ActiveProvider,
            prefs.ActiveModel,
            rawKey,
            request.SystemPrompt ?? "You are a helpful assistant.",
            request.UserMessage ?? "{}",
            request.MaxTokens);

        await foreach (var token in tokens)
        {
            await Response.WriteAsync($"data: {token}\n\n");
            await Response.Body.FlushAsync();
        }

        await Response.WriteAsync("data: [DONE]\n\n");
        await Response.Body.FlushAsync();
    }
}

public class ConductorRequest
{
    public string Feature { get; set; } = string.Empty;
    public string? SystemPrompt { get; set; }
    public string? UserMessage { get; set; }
    public int MaxTokens { get; set; } = 1500;
}
