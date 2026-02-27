using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace CreatorIQ.Api.Services.Conductor
{
    public interface IUniversalLLMCaller
    {
        Task<LLMResponse> Complete(string provider, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens = 1500);
        IAsyncEnumerable<string> Stream(string provider, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens = 1500);
    }

    public class LLMResponse
    {
        public string Content { get; set; }
        public int InputTokens { get; set; }
        public int OutputTokens { get; set; }
        public int LatencyMs { get; set; }
        public string Provider { get; set; }
        public string Model { get; set; }
    }

    public class UniversalLLMCaller : IUniversalLLMCaller
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public UniversalLLMCaller(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<LLMResponse> Complete(string provider, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens = 1500)
        {
            if (!ProviderRegistry.Providers.TryGetValue(provider, out var config))
                throw new ArgumentException($"Unknown provider: {provider}");

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(25); // Conductor has 15s timeout on frontend, but backend can be slightly more lenient

            var sw = System.Diagnostics.Stopwatch.StartNew();
            HttpRequestMessage request = CreateRequest(config, model, rawKey, systemPrompt, userMessage, maxTokens, stream: false);
            
            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();
            
            var responseBody = await response.Content.ReadAsStringAsync();
            sw.Stop();

            string content = ParseResponse(config, responseBody);

            return new LLMResponse
            {
                Content = content,
                Provider = provider,
                Model = model,
                LatencyMs = (int)sw.ElapsedMilliseconds
            };
        }

        public async IAsyncEnumerable<string> Stream(string provider, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens = 1500)
        {
            if (!ProviderRegistry.Providers.TryGetValue(provider, out var config))
                throw new ArgumentException($"Unknown provider: {provider}");

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromMinutes(2); // Streaming can take longer

            HttpRequestMessage request = CreateRequest(config, model, rawKey, systemPrompt, userMessage, maxTokens, stream: true);
            
            var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            response.EnsureSuccessStatusCode();

            using var stream = await response.Content.ReadAsStreamAsync();
            using var reader = new StreamReader(stream);

            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                if (string.IsNullOrWhiteSpace(line)) continue;

                var token = ParseStreamLine(config, line);
                if (token != null)
                {
                    if (token == "[DONE]") yield break;
                    yield return token;
                }
            }
        }

        private HttpRequestMessage CreateRequest(ProviderConfig config, string model, string rawKey, string systemPrompt, string userMessage, int maxTokens, bool stream)
        {
            HttpRequestMessage request;
            object body;

            if (config.ApiStyle == ApiStyle.Anthropic)
            {
                request = new HttpRequestMessage(HttpMethod.Post, config.BaseUrl);
                request.Headers.Add("x-api-key", rawKey);
                request.Headers.Add("anthropic-version", "2023-06-01");
                body = new
                {
                    model = model,
                    max_tokens = maxTokens,
                    system = systemPrompt,
                    messages = new[] { new { role = "user", content = userMessage } },
                    stream = stream
                };
            }
            else if (config.ApiStyle == ApiStyle.OpenAI)
            {
                request = new HttpRequestMessage(HttpMethod.Post, config.BaseUrl);
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", rawKey);
                body = new
                {
                    model = model,
                    max_tokens = maxTokens,
                    messages = new[] 
                    { 
                        new { role = "system", content = systemPrompt },
                        new { role = "user", content = userMessage }
                    },
                    stream = stream
                };
            }
            else if (config.ApiStyle == ApiStyle.Gemini)
            {
                var url = config.BaseUrl.Replace("{model}", model) + "?key=" + rawKey;
                if (stream) url = url.Replace("generateContent", "streamGenerateContent");
                
                request = new HttpRequestMessage(HttpMethod.Post, url);
                body = new
                {
                    contents = new[] { new { parts = new[] { new { text = $"{systemPrompt}\n\n{userMessage}" } } } },
                    generationConfig = new { maxOutputTokens = maxTokens }
                };
            }
            else
            {
                throw new NotSupportedException("Unsupported API style");
            }

            request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            return request;
        }

        private string ParseResponse(ProviderConfig config, string responseBody)
        {
            using var doc = JsonDocument.Parse(responseBody);
            if (config.ApiStyle == ApiStyle.Anthropic)
            {
                return doc.RootElement.GetProperty("content")[0].GetProperty("text").GetString() ?? "";
            }
            else if (config.ApiStyle == ApiStyle.OpenAI)
            {
                return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "";
            }
            else if (config.ApiStyle == ApiStyle.Gemini)
            {
                // Gemini response can vary slightly, usually candidates[0].content.parts[0].text
                return doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString() ?? "";
            }
            return "";
        }

        private string? ParseStreamLine(ProviderConfig config, string line)
        {
            if (config.ApiStyle == ApiStyle.Anthropic)
            {
                if (!line.StartsWith("data: ")) return null;
                var data = line.Substring(6);
                using var doc = JsonDocument.Parse(data);
                var type = doc.RootElement.GetProperty("type").GetString();
                if (type == "content_block_delta")
                {
                    return doc.RootElement.GetProperty("delta").GetProperty("text").GetString();
                }
                if (type == "message_stop") return "[DONE]";
            }
            else if (config.ApiStyle == ApiStyle.OpenAI)
            {
                if (!line.StartsWith("data: ")) return null;
                var data = line.Substring(6);
                if (data == "[DONE]") return "[DONE]";
                using var doc = JsonDocument.Parse(data);
                var choices = doc.RootElement.GetProperty("choices");
                if (choices.GetArrayLength() > 0)
                {
                    var delta = choices[0].GetProperty("delta");
                    if (delta.TryGetProperty("content", out var content))
                    {
                        return content.GetString();
                    }
                }
            }
            else if (config.ApiStyle == ApiStyle.Gemini)
            {
                // Gemini SSE is wrapped in brackets for some reason in some clients, but standard SSE is "data: ..."
                // Gemini stream format is actually a bit different sometimes, often just returns full JSON chunks
                if (line.StartsWith("data: ")) line = line.Substring(6);
                try {
                    using var doc = JsonDocument.Parse(line);
                    return doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
                } catch { return null; }
            }
            return null;
        }
    }
}
