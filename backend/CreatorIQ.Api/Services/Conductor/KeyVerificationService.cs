using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace CreatorIQ.Api.Services.Conductor;

public interface IKeyVerificationService
{
    Task<VerificationResult> VerifyKey(string provider, string rawKey, string model);
}

public class VerificationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ModelUsed { get; set; }
    public int LatencyMs { get; set; }
}

public class KeyVerificationService : IKeyVerificationService
{
    private readonly HttpClient _httpClient;

    public KeyVerificationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.Timeout = TimeSpan.FromSeconds(8);
    }

    public async Task<VerificationResult> VerifyKey(string provider, string rawKey, string model)
    {
        if (!ProviderRegistry.Providers.TryGetValue(provider, out var config))
        {
            return new VerificationResult { IsValid = false, ErrorMessage = "Unknown provider" };
        }

        var startTime = DateTime.UtcNow;
        try
        {
            HttpResponseMessage response;
            switch (config.ApiStyle)
            {
                case ApiStyle.Anthropic:
                    var anthropicBody = new
                    {
                        model = model,
                        max_tokens = 1,
                        messages = new[] { new { role = "user", content = "Hi" } }
                    };
                    var anthropicRequest = new HttpRequestMessage(HttpMethod.Post, config.BaseUrl);
                    anthropicRequest.Headers.Add("x-api-key", rawKey);
                    anthropicRequest.Headers.Add("anthropic-version", "2023-06-01");
                    anthropicRequest.Content = new StringContent(JsonSerializer.Serialize(anthropicBody), Encoding.UTF8, "application/json");
                    response = await _httpClient.SendAsync(anthropicRequest);
                    break;

                case ApiStyle.OpenAI:
                    var openaiBody = new
                    {
                        model = model,
                        max_tokens = 1,
                        messages = new[] { new { role = "user", content = "Hi" } }
                    };
                    var openaiRequest = new HttpRequestMessage(HttpMethod.Post, config.BaseUrl);
                    openaiRequest.Headers.Add("Authorization", $"Bearer {rawKey}");
                    openaiRequest.Content = new StringContent(JsonSerializer.Serialize(openaiBody), Encoding.UTF8, "application/json");
                    response = await _httpClient.SendAsync(openaiRequest);
                    break;

                case ApiStyle.Gemini:
                    var geminiUrl = config.BaseUrl.Replace("{model}", model) + $"?key={rawKey}";
                    var geminiBody = new
                    {
                        contents = new[] { new { parts = new[] { new { text = "Hi" } } } },
                        generationConfig = new { maxOutputTokens = 1 }
                    };
                    response = await _httpClient.PostAsync(geminiUrl, new StringContent(JsonSerializer.Serialize(geminiBody), Encoding.UTF8, "application/json"));
                    break;

                default:
                    return new VerificationResult { IsValid = false, ErrorMessage = "Unsupported API style" };
            }

            var latency = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

            if (response.IsSuccessStatusCode)
            {
                return new VerificationResult { IsValid = true, LatencyMs = latency, ModelUsed = model };
            }

            var errorContent = await response.Content.ReadAsStringAsync();
            var errorMessage = response.StatusCode switch
            {
                System.Net.HttpStatusCode.Unauthorized => "Invalid API key",
                System.Net.HttpStatusCode.Forbidden => "API key lacks required permissions",
                System.Net.HttpStatusCode.TooManyRequests => "Rate limit hit — key is valid but quota exceeded",
                System.Net.HttpStatusCode.NotFound => "Model not found — try a different model",
                _ => $"Provider error: {response.StatusCode}"
            };

            return new VerificationResult { IsValid = false, ErrorMessage = errorMessage, LatencyMs = latency };
        }
        catch (TaskCanceledException)
        {
            return new VerificationResult { IsValid = false, ErrorMessage = "Verification timed out — provider may be unavailable" };
        }
        catch (Exception ex)
        {
            return new VerificationResult { IsValid = false, ErrorMessage = $"Unexpected error: {ex.Message}" };
        }
    }
}
