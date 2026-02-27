using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace CreatorIQ.Api.Services.Conductor
{
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
        private readonly IHttpClientFactory _httpClientFactory;

        public KeyVerificationService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<VerificationResult> VerifyKey(string provider, string rawKey, string model)
        {
            if (!ProviderRegistry.Providers.TryGetValue(provider, out var config))
            {
                return new VerificationResult { IsValid = false, ErrorMessage = "Unknown provider" };
            }

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(8);

            var sw = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                HttpResponseMessage response;

                if (config.ApiStyle == ApiStyle.Anthropic)
                {
                    var request = new HttpRequestMessage(HttpMethod.Post, config.BaseUrl);
                    request.Headers.Add("x-api-key", rawKey);
                    request.Headers.Add("anthropic-version", "2023-06-01");
                    var body = new
                    {
                        model = model,
                        max_tokens = 1,
                        messages = new[] { new { role = "user", content = "Hi" } }
                    };
                    request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
                    response = await client.SendAsync(request);
                }
                else if (config.ApiStyle == ApiStyle.OpenAI)
                {
                    var request = new HttpRequestMessage(HttpMethod.Post, config.BaseUrl);
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", rawKey);
                    var body = new
                    {
                        model = model,
                        max_tokens = 1,
                        messages = new[] { new { role = "user", content = "Hi" } }
                    };
                    request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
                    response = await client.SendAsync(request);
                }
                else if (config.ApiStyle == ApiStyle.Gemini)
                {
                    var url = config.BaseUrl.Replace("{model}", model) + "?key=" + rawKey;
                    var body = new
                    {
                        contents = new[] { new { parts = new[] { new { text = "Hi" } } } },
                        generationConfig = new { maxOutputTokens = 1 }
                    };
                    response = await client.PostAsync(url, new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json"));
                }
                else
                {
                    return new VerificationResult { IsValid = false, ErrorMessage = "Unsupported API style" };
                }

                sw.Stop();

                if (response.IsSuccessStatusCode)
                {
                    return new VerificationResult { IsValid = true, ModelUsed = model, LatencyMs = (int)sw.ElapsedMilliseconds };
                }

                var errorMsg = response.StatusCode switch
                {
                    HttpStatusCode.Unauthorized => "Invalid API key",
                    HttpStatusCode.Forbidden => "API key lacks required permissions",
                    HttpStatusCode.TooManyRequests => "Rate limit hit — key is valid but quota exceeded",
                    HttpStatusCode.NotFound => "Model not found — try a different model",
                    _ => $"Provider returned error: {response.StatusCode}"
                };

                return new VerificationResult { IsValid = false, ErrorMessage = errorMsg, LatencyMs = (int)sw.ElapsedMilliseconds };
            }
            catch (TaskCanceledException)
            {
                return new VerificationResult { IsValid = false, ErrorMessage = "Verification timed out — provider may be unavailable" };
            }
            catch (Exception ex)
            {
                return new VerificationResult { IsValid = false, ErrorMessage = ex.Message };
            }
        }
    }
}
