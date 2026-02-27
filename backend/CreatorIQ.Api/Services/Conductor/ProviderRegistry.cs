using System.Collections.Generic;
using System.Linq;

namespace CreatorIQ.Api.Services.Conductor
{
    public static class ProviderRegistry
    {
        public static readonly Dictionary<string, ProviderConfig> Providers = new()
        {
            ["anthropic"] = new ProviderConfig
            {
                ProviderId = "anthropic",
                DisplayName = "Anthropic",
                KeyPrefix = "sk-ant-",
                BaseUrl = "https://api.anthropic.com/v1/messages",
                ApiStyle = ApiStyle.Anthropic,
                Models = new List<ModelConfig>
                {
                    new("claude-opus-4-6", "Claude Opus 4.6", tier: "premium"),
                    new("claude-sonnet-4-6", "Claude Sonnet 4.6", tier: "standard", isDefault: true),
                    new("claude-haiku-4-5-20251001", "Claude Haiku 4.5", tier: "fast"),
                }
            },
            ["openai"] = new ProviderConfig
            {
                ProviderId = "openai",
                DisplayName = "OpenAI",
                KeyPrefix = "sk-",
                BaseUrl = "https://api.openai.com/v1/chat/completions",
                ApiStyle = ApiStyle.OpenAI,
                Models = new List<ModelConfig>
                {
                    new("gpt-4o", "GPT-4o", tier: "premium"),
                    new("gpt-4o-mini", "GPT-4o Mini", tier: "fast", isDefault: true),
                    new("gpt-4-turbo", "GPT-4 Turbo", tier: "standard"),
                }
            },
            ["google"] = new ProviderConfig
            {
                ProviderId = "google",
                DisplayName = "Google",
                KeyPrefix = "AIza",
                BaseUrl = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                ApiStyle = ApiStyle.Gemini,
                Models = new List<ModelConfig>
                {
                    new("gemini-2.0-flash", "Gemini 2.0 Flash", tier: "fast", isDefault: true),
                    new("gemini-1.5-pro", "Gemini 1.5 Pro", tier: "premium"),
                    new("gemini-1.5-flash", "Gemini 1.5 Flash", tier: "standard"),
                }
            },
            ["xai"] = new ProviderConfig
            {
                ProviderId = "xai",
                DisplayName = "xAI",
                KeyPrefix = "xai-",
                BaseUrl = "https://api.x.ai/v1/chat/completions",
                ApiStyle = ApiStyle.OpenAI,  // Grok uses OpenAI-compatible API
                Models = new List<ModelConfig>
                {
                    new("grok-3", "Grok 3", tier: "premium"),
                    new("grok-3-mini", "Grok 3 Mini", tier: "fast", isDefault: true),
                    new("grok-2-1212", "Grok 2", tier: "standard"),
                }
            }
        };
    }

    public enum ApiStyle { Anthropic, OpenAI, Gemini }

    public class ProviderConfig
    {
        public string ProviderId { get; set; }
        public string DisplayName { get; set; }
        public string KeyPrefix { get; set; }
        public string BaseUrl { get; set; }
        public ApiStyle ApiStyle { get; set; }
        public List<ModelConfig> Models { get; set; }
        public ModelConfig DefaultModel => Models.First(m => m.IsDefault);
    }

    public class ModelConfig
    {
        public string ModelId { get; set; }
        public string DisplayName { get; set; }
        public string Tier { get; set; }        // "premium" | "standard" | "fast"
        public bool IsDefault { get; set; }

        public ModelConfig(string modelId, string displayName, string tier, bool isDefault = false)
        {
            ModelId = modelId; DisplayName = displayName;
            Tier = tier; IsDefault = isDefault;
        }
    }
}
