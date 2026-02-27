using CreatorIQ.Api.Repositories;
using CreatorIQ.Api.Services.Conductor;
using CreatorIQ.Api.Services.Encryption;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace CreatorIQ.Api.Controllers
{
    [ApiController]
    [Route("api/conductor")]
    public class ConductorController : ControllerBase
    {
        private readonly IUserApiKeyRepository _repository;
        private readonly IApiKeyEncryptionService _encryptionService;
        private readonly IUniversalLLMCaller _llmCaller;
        private readonly ILogger<ConductorController> _logger;

        public ConductorController(
            IUserApiKeyRepository repository,
            IApiKeyEncryptionService encryptionService,
            IUniversalLLMCaller llmCaller,
            ILogger<ConductorController> logger)
        {
            _repository = repository;
            _encryptionService = encryptionService;
            _llmCaller = llmCaller;
            _logger = logger;
        }

        private string GetUserId() => "test_user_1"; // Stubbed for MVP

        [HttpPost("complete")]
        public async Task<IActionResult> Complete([FromBody] ConductorRequest request)
        {
            var prefs = await _repository.GetPreferences(GetUserId());
            if (prefs == null) return Ok(new { has_key = false, fallback_required = true });

            var key = await _repository.GetByUserAndProvider(GetUserId(), prefs.ActiveProvider);
            if (key == null) return Ok(new { has_key = false, fallback_required = true });

            string rawKey = _encryptionService.Decrypt(key.EncryptedKey);
            string systemPrompt = GetSystemPrompt(request.feature);

            try
            {
                var response = await _llmCaller.Complete(
                    prefs.ActiveProvider,
                    prefs.ActiveModel,
                    rawKey,
                    systemPrompt,
                    JsonSerializer.Serialize(request.context)
                );

                return Ok(new
                {
                    content = response.Content,
                    provider = response.Provider,
                    model = response.Model,
                    latency_ms = response.LatencyMs,
                    has_key = true,
                    fallback_required = false
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Primary LLM call failed for provider {Provider}", prefs.ActiveProvider);
                
                // Try Fallback
                if (!string.IsNullOrEmpty(prefs.FallbackProvider) && !string.IsNullOrEmpty(prefs.FallbackModel))
                {
                    var fallbackKey = await _repository.GetByUserAndProvider(GetUserId(), prefs.FallbackProvider);
                    if (fallbackKey != null)
                    {
                        try
                        {
                            string rawFallbackKey = _encryptionService.Decrypt(fallbackKey.EncryptedKey);
                            var response = await _llmCaller.Complete(
                                prefs.FallbackProvider,
                                prefs.FallbackModel,
                                rawFallbackKey,
                                systemPrompt,
                                JsonSerializer.Serialize(request.context)
                            );

                            return Ok(new
                            {
                                content = response.Content,
                                provider = response.Provider,
                                model = response.Model,
                                latency_ms = response.LatencyMs,
                                has_key = true,
                                fallback_required = false
                            });
                        }
                        catch (Exception fallbackEx)
                        {
                            _logger.LogError(fallbackEx, "Fallback LLM call failed for provider {Provider}", prefs.FallbackProvider);
                        }
                    }
                }

                return Ok(new { has_key = true, fallback_required = true, error = ex.Message });
            }
        }

        [HttpPost("stream")]
        public async Task Stream([FromBody] ConductorRequest request)
        {
            var prefs = await _repository.GetPreferences(GetUserId());
            if (prefs == null || !prefs.StreamingEnabled) 
            {
                Response.StatusCode = 400;
                return;
            }

            var key = await _repository.GetByUserAndProvider(GetUserId(), prefs.ActiveProvider);
            if (key == null)
            {
                Response.StatusCode = 400;
                return;
            }

            string rawKey = _encryptionService.Decrypt(key.EncryptedKey);
            string systemPrompt = GetSystemPrompt(request.feature);

            Response.ContentType = "text/event-stream";

            try
            {
                await foreach (var token in _llmCaller.Stream(
                    prefs.ActiveProvider,
                    prefs.ActiveModel,
                    rawKey,
                    systemPrompt,
                    JsonSerializer.Serialize(request.context)
                ))
                {
                    await Response.WriteAsync($"data: {token}\n\n");
                    await Response.Body.FlushAsync();
                }

                await Response.WriteAsync("data: [DONE]\n\n");
                await Response.Body.FlushAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Streaming LLM call failed");
                // In SSE, we can't easily change status code after starting
            }
        }

        private string GetSystemPrompt(string feature)
        {
            // System prompts are mostly handled on the frontend and passed here, 
            // but intel.md suggests the feature name is sent.
            // Actually, Part 2C shows prompts are defined on Next.js side.
            // But the backend needs to know them if it's responsible for the call.
            // Let's assume for now we provide a default or the frontend sends it.
            // intel.md says: Call IUniversalLLMCaller.Complete() with the feature's system prompt...
            // This implies the backend might need a copy or the frontend sends it.
            // "Body: { feature: string, context: object }"
            // Since PART 2C is Next.js, I'll rely on the feature string to choose a prompt if I have them here.
            // If not, I'll just use a generic one or assume the frontend should have sent it (but it doesn't in the schema).
            // Actually, I'll add the prompts here too for robustness.
            
            return feature switch
            {
                "attackEngine" => "You are a sharp YouTube growth strategist...",
                "strategy" => "You are a professional content strategist...",
                "monetization" => "You are a monetization analyst...",
                "synthesizer" => "You are a trend analyst...",
                "growth" => "You are a YouTube growth coach...",
                _ => "You are a helpful AI assistant."
            };
        }
    }

    public class ConductorRequest
    {
        public string feature { get; set; }
        public object context { get; set; }
    }
}
