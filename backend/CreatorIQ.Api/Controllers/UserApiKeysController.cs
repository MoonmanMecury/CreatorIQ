using CreatorIQ.Api.Models;
using CreatorIQ.Api.Repositories;
using CreatorIQ.Api.Services.Conductor;
using CreatorIQ.Api.Services.Encryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CreatorIQ.Api.Controllers
{
    [ApiController]
    [Route("api/user/ai-keys")]
    // [Authorize] // Assuming JWT auth is handled, commented out for MVP if not fully setup
    public class UserApiKeysController : ControllerBase
    {
        private readonly IUserApiKeyRepository _repository;
        private readonly IApiKeyEncryptionService _encryptionService;
        private readonly IKeyVerificationService _verificationService;

        public UserApiKeysController(
            IUserApiKeyRepository repository,
            IApiKeyEncryptionService encryptionService,
            IKeyVerificationService verificationService)
        {
            _repository = repository;
            _encryptionService = encryptionService;
            _verificationService = verificationService;
        }

        private string GetUserId() => "test_user_1"; // Stubbed for MVP, normally from JWT

        [HttpGet]
        public async Task<IActionResult> ListKeys()
        {
            var keys = await _repository.GetAllForUser(GetUserId());
            var result = keys.Select(k => new
            {
                provider = k.Provider,
                provider_display_name = ProviderRegistry.Providers.TryGetValue(k.Provider, out var p) ? p.DisplayName : k.Provider,
                key_hint = k.KeyHint,
                model_preference = k.ModelPreference,
                model_display_name = ProviderRegistry.Providers.TryGetValue(k.Provider, out var p2) 
                    ? p2.Models.FirstOrDefault(m => m.ModelId == k.ModelPreference)?.DisplayName ?? k.ModelPreference 
                    : k.ModelPreference,
                verified = k.Verified,
                last_verified_at = k.LastVerifiedAt
            });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> UpsertKey([FromBody] AddKeyRequest request)
        {
            if (!_encryptionService.ValidateKeyFormat(request.provider, request.raw_key))
            {
                return BadRequest(new { error = "Invalid key format for provider" });
            }

            var encrypted = _encryptionService.Encrypt(request.raw_key);
            var hint = _encryptionService.GetKeyHint(request.raw_key);

            var key = await _repository.Upsert(GetUserId(), request.provider, encrypted, hint, request.model_preference);

            return Ok(new
            {
                provider = key.Provider,
                key_hint = key.KeyHint,
                model_preference = key.ModelPreference,
                verified = key.Verified
            });
        }

        [HttpDelete("{provider}")]
        public async Task<IActionResult> DeleteKey(string provider)
        {
            var success = await _repository.Delete(GetUserId(), provider);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPost("{provider}/verify")]
        public async Task<IActionResult> VerifyKey(string provider, [FromBody] VerifyKeyRequest request)
        {
            var result = await _verificationService.VerifyKey(provider, request.raw_key, request.model);
            if (result.IsValid)
            {
                await _repository.MarkVerified(GetUserId(), provider);
            }
            return Ok(new
            {
                is_valid = result.IsValid,
                error_message = result.ErrorMessage,
                latency_ms = result.LatencyMs
            });
        }

        [HttpGet("providers")]
        public IActionResult ListProviders()
        {
            var result = ProviderRegistry.Providers.Values.Select(p => new
            {
                provider_id = p.ProviderId,
                display_name = p.DisplayName,
                key_prefix = p.KeyPrefix,
                models = p.Models.Select(m => new
                {
                    model_id = m.ModelId,
                    display_name = m.DisplayName,
                    tier = m.Tier,
                    is_default = m.IsDefault
                })
            });
            return Ok(result);
        }

        [HttpGet("preferences")]
        public async Task<IActionResult> GetPreferences()
        {
            var prefs = await _repository.GetPreferences(GetUserId());
            if (prefs == null) return NotFound();

            return Ok(new
            {
                active_provider = prefs.ActiveProvider,
                active_model = prefs.ActiveModel,
                fallback_provider = prefs.FallbackProvider,
                fallback_model = prefs.FallbackModel,
                streaming_enabled = prefs.StreamingEnabled
            });
        }

        [HttpPut("preferences")]
        public async Task<IActionResult> UpdatePreferences([FromBody] UpdatePreferencesRequest request)
        {
            // Validate that user has a key for activeProvider
            var keys = await _repository.GetAllForUser(GetUserId());
            if (!keys.Any(k => k.Provider == request.active_provider))
            {
                return BadRequest(new { error = "You must add an API key for the selected provider first" });
            }

            var prefs = await _repository.UpsertPreferences(
                GetUserId(),
                request.active_provider,
                request.active_model,
                request.fallback_provider,
                request.fallback_model,
                request.streaming_enabled
            );

            return Ok(new
            {
                active_provider = prefs.ActiveProvider,
                active_model = prefs.ActiveModel,
                fallback_provider = prefs.FallbackProvider,
                fallback_model = prefs.FallbackModel,
                streaming_enabled = prefs.StreamingEnabled
            });
        }
    }

    public class AddKeyRequest
    {
        public string provider { get; set; }
        public string raw_key { get; set; }
        public string model_preference { get; set; }
    }

    public class VerifyKeyRequest
    {
        public string raw_key { get; set; }
        public string model { get; set; }
    }

    public class UpdatePreferencesRequest
    {
        public string active_provider { get; set; }
        public string active_model { get; set; }
        public string? fallback_provider { get; set; }
        public string? fallback_model { get; set; }
        public bool streaming_enabled { get; set; }
    }
}
