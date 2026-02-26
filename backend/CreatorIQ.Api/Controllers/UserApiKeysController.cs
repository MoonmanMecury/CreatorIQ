using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using CreatorIQ.Api.Models;
using CreatorIQ.Api.Repositories;
using CreatorIQ.Api.Services.Conductor;
using CreatorIQ.Api.Services.Encryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CreatorIQ.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/user/ai-keys")]
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

    private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value ?? string.Empty;

    [HttpGet]
    public async Task<IActionResult> GetKeys()
    {
        var keys = await _repository.GetAllForUser(UserId);
        var result = keys.Select(k => new
        {
            Provider = k.Provider,
            ProviderDisplayName = ProviderRegistry.Providers.TryGetValue(k.Provider, out var config) ? config.DisplayName : k.Provider,
            KeyHint = k.KeyHint,
            ModelPreference = k.ModelPreference,
            ModelDisplayName = ProviderRegistry.Providers.TryGetValue(k.Provider, out var cfg)
                ? cfg.Models.FirstOrDefault(m => m.ModelId == k.ModelPreference)?.DisplayName ?? k.ModelPreference
                : k.ModelPreference,
            Verified = k.Verified,
            LastVerifiedAt = k.LastVerifiedAt
        });
        return Ok(result);
    }

    [HttpGet("providers")]
    public IActionResult GetProviders()
    {
        return Ok(ProviderRegistry.Providers.Values);
    }

    [HttpPost]
    public async Task<IActionResult> AddKey([FromBody] AddKeyRequest request)
    {
        if (!_encryptionService.ValidateKeyFormat(request.Provider, request.RawKey))
        {
            return BadRequest(new { message = $"Invalid key format for {request.Provider}" });
        }

        var encryptedKey = _encryptionService.Encrypt(request.RawKey);
        var hint = _encryptionService.GetKeyHint(request.RawKey);

        var key = await _repository.Upsert(UserId, request.Provider, encryptedKey, hint, request.ModelPreference);

        return Ok(new
        {
            Provider = key.Provider,
            KeyHint = key.KeyHint,
            ModelPreference = key.ModelPreference,
            Verified = key.Verified
        });
    }

    [HttpDelete("{provider}")]
    public async Task<IActionResult> DeleteKey(string provider)
    {
        var result = await _repository.Delete(UserId, provider);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("{provider}/verify")]
    public async Task<IActionResult> VerifyKey(string provider, [FromBody] VerifyKeyRequest request)
    {
        var result = await _verificationService.VerifyKey(provider, request.RawKey, request.Model);
        if (result.IsValid)
        {
            await _repository.MarkVerified(UserId, provider);
        }
        return Ok(result);
    }

    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences()
    {
        var prefs = await _repository.GetPreferences(UserId);
        if (prefs == null)
        {
            return Ok(new UserConductorPreferences { UserId = UserId });
        }
        return Ok(prefs);
    }

    [HttpPut("preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] UserConductorPreferences request)
    {
        var key = await _repository.GetByUserAndProvider(UserId, request.ActiveProvider);
        if (key == null)
        {
            return BadRequest(new { message = $"No API key found for {request.ActiveProvider}" });
        }

        var prefs = await _repository.UpsertPreferences(
            UserId,
            request.ActiveProvider,
            request.ActiveModel,
            request.FallbackProvider,
            request.FallbackModel,
            request.StreamingEnabled);

        return Ok(prefs);
    }
}

public class AddKeyRequest
{
    public string Provider { get; set; } = string.Empty;
    public string RawKey { get; set; } = string.Empty;
    public string ModelPreference { get; set; } = string.Empty;
}

public class VerifyKeyRequest
{
    public string RawKey { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
}
