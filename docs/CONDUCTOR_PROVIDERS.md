# Adding New LLM Providers to AI Conductor

To add a new LLM provider (e.g., DeepSeek, Mistral) to the AI Conductor, follow these steps:

## 1. Backend Registration

### Update `ProviderRegistry.cs`
Add the new provider configuration to the `Providers` dictionary in `backend/CreatorIQ.Api/Services/Conductor/ProviderRegistry.cs`:

```csharp
["deepseek"] = new ProviderConfig
{
    ProviderId = "deepseek",
    DisplayName = "DeepSeek",
    KeyPrefix = "sk-",
    BaseUrl = "https://api.deepseek.com/v1",
    ApiStyle = "openai", // Use "openai" if compatible, or add a new style
    Models = new List<ModelConfig>
    {
        new ModelConfig { ModelId = "deepseek-chat", DisplayName = "DeepSeek Chat", Tier = "standard", IsDefault = true }
    }
}
```

### Update `UniversalLLMCaller.cs` (If needed)
If the new provider uses a unique API style (not Anthropic, OpenAI, or Gemini), implement the request/response logic in `UniversalLLMCaller.cs`.

## 2. Frontend Registration

### Update `types.ts`
Add the new provider ID to the `LLMProvider` type union in `web-app/features/conductor/types.ts`:

```typescript
export type LLMProvider = 'anthropic' | 'openai' | 'google' | 'xai' | 'deepseek'
```

### Update `AiStatusBadge.tsx`
Add the color identity and icon for the new provider in `web-app/components/conductor/AiStatusBadge.tsx`:

```typescript
deepseek: { color: 'bg-[#606bc7]', icon: BrainCircuit, label: 'DeepSeek' }
```

## 3. Database
No database changes are required. The system is designed to handle new provider IDs automatically via the `user_api_keys` table.

## 4. Verification
The `KeyVerificationService` will automatically use the `BaseUrl` and `ApiStyle` defined in the registry to validate the new provider's keys.
