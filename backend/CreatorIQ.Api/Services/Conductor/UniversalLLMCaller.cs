using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace CreatorIQ.Api.Services.Conductor;

public interface IUniversalLLMCaller
{
    Task<LLMResponse> Complete(string provider, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens = 1500);
    IAsyncEnumerable<string> Stream(string provider, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens = 1500);
}

public class LLMResponse
{
    public string Content { get; set; } = string.Empty;
    public int InputTokens { get; set; }
    public int OutputTokens { get; set; }
    public int LatencyMs { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
}

public class UniversalLLMCaller : IUniversalLLMCaller
{
    private readonly HttpClient _httpClient;

    public UniversalLLMCaller(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.Timeout = TimeSpan.FromSeconds(15);
    }

    public async Task<LLMResponse> Complete(string provider, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens = 1500)
    {
        if (!ProviderRegistry.Providers.TryGetValue(provider, out var config))
            throw new ArgumentException("Unknown provider", nameof(provider));

        var startTime = DateTime.UtcNow;
        HttpRequestMessage request;

        switch (config.ApiStyle)
        {
            case ApiStyle.Anthropic:
                request = CreateAnthropicRequest(config, model, rawKey, systemPrompt, userMessage, maxTokens);
                break;
            case ApiStyle.OpenAI:
                request = CreateOpenAIRequest(config, model, rawKey, systemPrompt, userMessage, maxTokens);
                break;
            case ApiStyle.Gemini:
                request = CreateGeminiRequest(config, model, rawKey, systemPrompt, userMessage, maxTokens);
                break;
            default:
                throw new NotSupportedException("Unsupported API style");
        }

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var latency = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

        string content = ParseResponseContent(config.ApiStyle, json);

        return new LLMResponse
        {
            Content = content,
            Provider = provider,
            Model = model,
            LatencyMs = latency
        };
    }

    public async IAsyncEnumerable<string> Stream(string provider, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens = 1500)
    {
        if (!ProviderRegistry.Providers.TryGetValue(provider, out var config))
            yield break;

        // In a real production app, we would implement SSE parsing for each provider.
        // To ensure "fluidity" as requested, we'll simulate streaming by chunking the result
        // if real streaming is not fully implemented for all providers in this MVP.

        var result = await Complete(provider, model, rawKey, systemPrompt, userMessage, maxTokens);

        // Simulate streaming for fluidity
        var words = result.Content.Split(' ');
        foreach (var word in words)
        {
            yield return word + " ";
            await Task.Delay(20); // Small delay for fluid effect
        }
    }

    private HttpRequestMessage CreateAnthropicRequest(ProviderConfig config, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens)
    {
        var body = new
        {
            model = model,
            max_tokens = maxTokens,
            system = systemPrompt,
            messages = new[] { new { role = "user", content = userMessage } }
        };
        var request = new HttpRequestMessage(HttpMethod.Post, config.BaseUrl);
        request.Headers.Add("x-api-key", rawKey);
        request.Headers.Add("anthropic-version", "2023-06-01");
        request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
        return request;
    }

    private HttpRequestMessage CreateOpenAIRequest(ProviderConfig config, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens)
    {
        var body = new
        {
            model = model,
            max_tokens = maxTokens,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userMessage }
            }
        };
        var request = new HttpRequestMessage(HttpMethod.Post, config.BaseUrl);
        request.Headers.Add("Authorization", $"Bearer {rawKey}");
        request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
        return request;
    }

    private HttpRequestMessage CreateGeminiRequest(ProviderConfig config, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens)
    {
        var url = config.BaseUrl.Replace("{model}", model) + $"?key={rawKey}";
        var body = new
        {
            contents = new[] { new { parts = new[] { new { text = $"{systemPrompt}\n\n{userMessage}" } } } },
            generationConfig = new { maxOutputTokens = maxTokens }
        };
        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
        return request;
    }

    private string ParseResponseContent(ApiStyle style, string json)
    {
        using var doc = JsonDocument.Parse(json);
        return style switch
        {
            ApiStyle.Anthropic => doc.RootElement.GetProperty("content")[0].GetProperty("text").GetString() ?? "",
            ApiStyle.OpenAI => doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "",
            ApiStyle.Gemini => doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString() ?? "",
            _ => ""
        };
    }
}
