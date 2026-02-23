All four are completely allowed. Here's the updated complete prompt:

---

# PROMPT: AI Conductor & User API Key System — CreatorIQ (Full Provider Support)

---

## PROJECT CONTEXT

You are adding an **AI Conductor Layer** to CreatorIQ, a completed SaaS platform (Steps 1–9 built plus the News/YouTube Trend Synthesizer and Creator Opportunity Attack Engine). This layer allows users to plug in their own LLM API keys through their settings and choose exactly which provider and model powers their experience. The system uses those keys server-side to replace rule-based text generation with genuine LLM reasoning — while falling back gracefully to the existing rule-based output for users without keys.

**Supported Providers:**
- **Anthropic** (Claude models)
- **OpenAI** (GPT models)
- **Google** (Gemini models)
- **xAI** (Grok models)

**Stack:**
- Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query
- ASP.NET Core REST API backend
- PostgreSQL database
- JWT authentication
- All Steps 1–9 complete plus Trend Synthesizer and Attack Engine

**Core principle:** The app works fully without an API key. Users with keys get LLM-enhanced output. The numeric scores, classifications, and data pipeline never change — only the narrative/insight text fields are upgraded by the LLM.

---

## PART 1 — BACKEND (ASP.NET Core)

---

### 1A. Database Migration

**File:** `/migrations/004_user_api_keys.sql`

```sql
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_hint VARCHAR(10) NOT NULL,
  model_preference VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_verified_at TIMESTAMPTZ NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE TABLE user_conductor_preferences (
  user_id VARCHAR(255) PRIMARY KEY,
  active_provider VARCHAR(50) NOT NULL DEFAULT 'anthropic',
  active_model VARCHAR(100) NOT NULL,
  fallback_provider VARCHAR(50) NULL,
  fallback_model VARCHAR(100) NULL,
  streaming_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON user_api_keys(user_id);
```

---

### 1B. Provider & Model Registry

**File:** `/Services/Conductor/ProviderRegistry.cs`

This is the single source of truth for all supported providers and their models. Everything else references this registry.

```csharp
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
```

---

### 1C. Key Encryption Service

**File:** `/Services/Encryption/ApiKeyEncryptionService.cs`

Use ASP.NET's built-in `IDataProtector` — no external libraries needed.

```csharp
public interface IApiKeyEncryptionService
{
    string Encrypt(string rawKey);
    string Decrypt(string encryptedKey);
    string GetKeyHint(string rawKey);
    bool ValidateKeyFormat(string provider, string rawKey);
}

public class ApiKeyEncryptionService : IApiKeyEncryptionService
{
    private readonly IDataProtector _protector;

    public ApiKeyEncryptionService(IDataProtectionProvider provider)
    {
        _protector = provider.CreateProtector("CreatorIQ.UserApiKeys.v1");
    }

    public string Encrypt(string rawKey) => _protector.Protect(rawKey);
    public string Decrypt(string encryptedKey) => _protector.Unprotect(encryptedKey);
    public string GetKeyHint(string rawKey) =>
        rawKey.Length >= 4 ? rawKey[^4..] : "????";

    public bool ValidateKeyFormat(string provider, string rawKey)
    {
        if (!ProviderRegistry.Providers.TryGetValue(provider, out var config))
            return false;
        return rawKey.StartsWith(config.KeyPrefix, StringComparison.OrdinalIgnoreCase);
    }
}
```

Register in `Program.cs`:
```csharp
builder.Services.AddDataProtection();
builder.Services.AddScoped<IApiKeyEncryptionService, ApiKeyEncryptionService>();
```

---

### 1D. API Key Repository

**File:** `/Repositories/UserApiKeyRepository.cs`

```csharp
public interface IUserApiKeyRepository
{
    Task<UserApiKey?> GetByUserAndProvider(string userId, string provider);
    Task<List<UserApiKey>> GetAllForUser(string userId);
    Task<UserApiKey> Upsert(string userId, string provider, string encryptedKey, string keyHint, string modelPreference);
    Task<bool> Delete(string userId, string provider);
    Task MarkVerified(string userId, string provider);
    Task<UserConductorPreferences?> GetPreferences(string userId);
    Task<UserConductorPreferences> UpsertPreferences(string userId, string activeProvider, string activeModel, string? fallbackProvider, string? fallbackModel, bool streamingEnabled);
}
```

`UserApiKey` model:
```csharp
public class UserApiKey
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public string Provider { get; set; }
    public string EncryptedKey { get; set; }
    public string KeyHint { get; set; }
    public string ModelPreference { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastVerifiedAt { get; set; }
    public bool Verified { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserConductorPreferences
{
    public string UserId { get; set; }
    public string ActiveProvider { get; set; }
    public string ActiveModel { get; set; }
    public string? FallbackProvider { get; set; }
    public string? FallbackModel { get; set; }
    public bool StreamingEnabled { get; set; }
}
```

---

### 1E. Key Verification Service

**File:** `/Services/Conductor/KeyVerificationService.cs`

Makes a minimal test call to each provider to confirm the key works.

```csharp
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
```

Implement per `ApiStyle`:

**ApiStyle.Anthropic:**
POST `https://api.anthropic.com/v1/messages`
Headers: `x-api-key: {rawKey}`, `anthropic-version: 2023-06-01`
Body: `{ "model": "{model}", "max_tokens": 1, "messages": [{"role":"user","content":"Hi"}] }`

**ApiStyle.OpenAI** (used by OpenAI and xAI):
POST `{baseUrl}`
Headers: `Authorization: Bearer {rawKey}`
Body: `{ "model": "{model}", "max_tokens": 1, "messages": [{"role":"user","content":"Hi"}] }`

For xAI use base URL `https://api.x.ai/v1/chat/completions`.

**ApiStyle.Gemini:**
POST `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={rawKey}`
Body: `{ "contents": [{"parts":[{"text":"Hi"}]}], "generationConfig": {"maxOutputTokens": 1} }`

Set 8-second timeout on all verification calls. Handle specific error codes:
- 401 → "Invalid API key"
- 403 → "API key lacks required permissions"
- 429 → "Rate limit hit — key is valid but quota exceeded"
- 404 → "Model not found — try a different model"
- timeout → "Verification timed out — provider may be unavailable"

---

### 1F. Universal LLM Caller

**File:** `/Services/Conductor/UniversalLLMCaller.cs`

Handles calling any provider using the correct API style. This is the only place in the codebase that makes outbound LLM calls.

```csharp
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
```

Implement `Complete()` routing based on the provider's `ApiStyle`:

**Anthropic format:**
```json
{
  "model": "{model}",
  "max_tokens": 1500,
  "system": "{systemPrompt}",
  "messages": [{"role": "user", "content": "{userMessage}"}]
}
```
Response path: `response.content[0].text`

**OpenAI/xAI format:**
```json
{
  "model": "{model}",
  "max_tokens": 1500,
  "messages": [
    {"role": "system", "content": "{systemPrompt}"},
    {"role": "user", "content": "{userMessage}"}
  ]
}
```
Response path: `response.choices[0].message.content`

**Gemini format:**
```json
{
  "contents": [{"parts": [{"text": "{systemPrompt}\n\n{userMessage}"}]}],
  "generationConfig": {"maxOutputTokens": 1500}
}
```
Response path: `response.candidates[0].content.parts[0].text`

For `Stream()`: use `IAsyncEnumerable<string>` yielding tokens as they arrive from server-sent events. Parse the SSE format per provider. Gemini uses a different streaming endpoint — `streamGenerateContent`.

Set 15-second hard timeout on all calls. Never log the raw API key.

---

### 1G. ASP.NET API Endpoints

**File:** `/Controllers/UserApiKeysController.cs`

```
GET    /api/user/ai-keys                      — list all keys (hints only)
POST   /api/user/ai-keys                      — add or update a key
DELETE /api/user/ai-keys/{provider}           — remove a key
POST   /api/user/ai-keys/{provider}/verify    — test a key
GET    /api/user/ai-keys/providers            — list all providers and their models
GET    /api/user/ai-keys/preferences          — get conductor preferences
PUT    /api/user/ai-keys/preferences          — update conductor preferences
```

**GET /api/user/ai-keys**
Returns:
```json
[{
  "provider": "anthropic",
  "providerDisplayName": "Anthropic",
  "keyHint": "a3f9",
  "modelPreference": "claude-sonnet-4-6",
  "modelDisplayName": "Claude Sonnet 4.6",
  "verified": true,
  "lastVerifiedAt": "2025-01-15T10:30:00Z"
}]
```
Never return encrypted or raw keys.

**GET /api/user/ai-keys/providers**
Returns the full provider registry (no keys) — used by the UI to populate dropdowns:
```json
[{
  "providerId": "anthropic",
  "displayName": "Anthropic",
  "keyPrefix": "sk-ant-",
  "models": [
    { "modelId": "claude-sonnet-4-6", "displayName": "Claude Sonnet 4.6", "tier": "standard", "isDefault": true }
  ]
}]
```

**POST /api/user/ai-keys**
Body: `{ "provider": string, "rawKey": string, "modelPreference": string }`
- Validate provider exists in registry
- Validate key format using `ValidateKeyFormat`
- Encrypt and store
- Return key info (no raw key)

**POST /api/user/ai-keys/{provider}/verify**
Body: `{ "rawKey": string, "model": string }`
- Call `IKeyVerificationService.VerifyKey`
- If valid, call `MarkVerified`
- Return `VerificationResult`

**GET /api/user/ai-keys/preferences**
Returns `UserConductorPreferences` for the authenticated user.

**PUT /api/user/ai-keys/preferences**
Body: `{ "activeProvider": string, "activeModel": string, "fallbackProvider"?: string, "fallbackModel"?: string, "streamingEnabled": boolean }`
- Validate that user has a key for `activeProvider`
- Validate `activeModel` exists in provider's model list
- Save and return updated preferences

**File:** `/Controllers/ConductorController.cs`

```
POST /api/conductor/complete
POST /api/conductor/stream
```

**POST /api/conductor/complete**
Body: `{ "feature": string, "context": object }`

1. Extract userId from JWT
2. Load user's conductor preferences
3. Load active provider's key from repository
4. Decrypt key
5. Call `IUniversalLLMCaller.Complete()` with the feature's system prompt and context serialized as the user message
6. Return `{ "content": string, "provider": string, "model": string, "latencyMs": number }`

If no key: return `{ "hasKey": false, "fallbackRequired": true }` with status 200.
If provider call fails: try fallback provider if configured. If fallback also fails, return `{ "hasKey": true, "fallbackRequired": true, "error": string }`.

**POST /api/conductor/stream**
Same as complete but uses `IUniversalLLMCaller.Stream()` and returns `text/event-stream` response. Each SSE event is `data: {token}\n\n`. End with `data: [DONE]\n\n`.

All endpoints require JWT authentication.

---

## PART 2 — CONDUCTOR SERVICE (Next.js)

---

### 2A. Type Definitions

**File:** `/features/conductor/types.ts`

```ts
export type LLMProvider = 'anthropic' | 'openai' | 'google' | 'xai'

export type ConductorFeature =
  | 'attackEngine'
  | 'strategy'
  | 'monetization'
  | 'synthesizer'
  | 'growth'

export interface ProviderInfo {
  providerId: LLMProvider
  displayName: string
  keyPrefix: string
  models: ModelInfo[]
}

export interface ModelInfo {
  modelId: string
  displayName: string
  tier: 'premium' | 'standard' | 'fast'
  isDefault: boolean
}

export interface UserApiKeyInfo {
  provider: LLMProvider
  providerDisplayName: string
  keyHint: string
  modelPreference: string
  modelDisplayName: string
  verified: boolean
  lastVerifiedAt: string | null
}

export interface UserConductorPreferences {
  activeProvider: LLMProvider
  activeModel: string
  fallbackProvider: LLMProvider | null
  fallbackModel: string | null
  streamingEnabled: boolean
}

export interface ConductorResponse {
  hasKey: boolean
  fallbackRequired: boolean
  provider?: LLMProvider
  model?: string
  content?: string
  latencyMs?: number
  error?: string
}

export interface LLMEnhancedFields {
  strategicSummary?: string
  whyItsHot?: string
  whyCreatorIsVulnerable?: string
  suggestedAngle?: string
  sampleVideoTitle?: string
  urgencyReason?: string
  videoIdeaTitles?: string[]
  differentiationDescription?: string
  quickWins?: string[]
  strategySummaryNarrative?: string
  verdictDescription?: string
  topOpportunitiesBullets?: string[]
  riskBullets?: string[]
  executiveSummary?: string
  phaseDescriptions?: string[]
  clusterSummaries?: {
    clusterId: string
    summary: string
    whyItMatters: string
    contentOpportunity: string
  }[]
}

export interface AddKeyRequest {
  provider: LLMProvider
  rawKey: string
  modelPreference: string
}

export interface VerifyKeyResult {
  isValid: boolean
  errorMessage: string | null
  latencyMs: number
}

export interface UpdatePreferencesRequest {
  activeProvider: LLMProvider
  activeModel: string
  fallbackProvider: LLMProvider | null
  fallbackModel: string | null
  streamingEnabled: boolean
}
```

---

### 2B. Context Builders

**File:** `/features/conductor/contextBuilder.ts`

Packages pre-processed data for the LLM. Never sends raw API data — only normalized signals.

```ts
export function buildAttackEngineContext(result: AttackEngineResult): Record<string, unknown> {
  return {
    channelName: result.channelName,
    uploadTrend: result.momentumData.uploadCadenceTrend,
    viewTrend: result.momentumData.viewVelocityTrend,
    topCreatorTopics: result.creatorTopics.slice(0, 5).map(t => ({
      topic: t.topic,
      videoCount: t.videoCount,
      isCooling: t.isCooling,
      daysSinceLastCovered: t.recencyScore
    })),
    topAttackOpportunities: result.attackOpportunities.slice(0, 5).map(o => ({
      topic: o.topic,
      opportunityScore: o.opportunityScore,
      urgency: o.urgency,
      searchGrowthRate: o.searchGrowthRate,
      newsMomentum: o.newsMomentum,
      creatorAbsenceDays: o.creatorAbsenceDays,
      topNewsHeadline: o.topNewsHeadline,
      topRisingQuery: o.topRisingQuery
    })),
    totalHotIgnored: result.totalHotIgnoredTopics
  }
}

export function buildStrategyContext(result: ContentStrategy): Record<string, unknown> {
  return {
    keyword: result.keyword,
    topFormats: result.topFormats.slice(0, 3).map(f => f.label),
    topPillars: result.pillars.slice(0, 3).map(p => p.name),
    topGaps: result.contentGaps.slice(0, 3).map(g => g.topic),
    postingCadence: result.postingPlan.cadence,
    topDifferentiation: result.differentiationStrategies[0]?.strategy,
    videoIdeasCount: result.videoIdeas.length
  }
}

export function buildMonetizationContext(result: MonetizationInsights): Record<string, unknown> {
  return {
    keyword: result.keyword,
    monetizationScore: result.monetizationScore,
    verdict: result.verdict,
    cpmTier: result.cpmTier,
    marketMaturity: result.marketMaturity,
    topRevenuePaths: result.revenuePaths.slice(0, 3).map(p => ({
      type: p.type,
      confidence: p.confidenceScore
    })),
    adDemand: result.breakdown.adDemand,
    audienceValue: result.breakdown.audienceValue
  }
}

export function buildSynthesizerContext(result: SynthesisResult): Record<string, unknown> {
  return {
    topClusters: result.topClusters.slice(0, 5).map(c => ({
      clusterId: c.clusterId,
      topic: c.topic,
      category: c.category,
      trendScore: c.trendScore,
      momentum: c.momentum,
      firstSeenHoursAgo: c.firstSeenHoursAgo,
      velocityScore: c.velocityScore,
      topNewsTitle: c.topItems.find(i => i.source === 'NEWS')?.title
    }))
  }
}

export function buildGrowthContext(result: GrowthBlueprint): Record<string, unknown> {
  return {
    keyword: result.keyword,
    projectedAuthorityWeeks: result.projectedAuthorityWeeks,
    currentStage: result.currentStage,
    topMilestone: result.subscriberMilestones[0],
    phase1Focus: result.cadencePhases[0]?.focus,
    phase2Focus: result.cadencePhases[1]?.focus,
    phase3Focus: result.cadencePhases[2]?.focus,
    topPlatform: result.platformRecommendations[1]?.label,
    topAlert: result.alerts[0]?.title,
    weeklyHoursAtLaunch: result.totalWeeklyHoursAtLaunch
  }
}
```

---

### 2C. System Prompts

**File:** `/features/conductor/prompts/index.ts`

```ts
export const PROMPTS: Record<ConductorFeature, { system: string, userMessage: (context: Record<string, unknown>) => string }> = {

  attackEngine: {
    system: `You are a sharp YouTube growth strategist analyzing a creator's competitive blind spots.
You receive pre-processed channel and trend data. Produce highly specific, actionable intelligence.
Reference the actual data points provided. Be direct and specific.
Always respond with valid JSON only. No preamble, no markdown fences, no explanation outside JSON.
Required output schema:
{
  "strategicSummary": "3-4 sentence analysis referencing specific data points",
  "opportunities": [
    {
      "topic": "exact topic name from input",
      "whyItsHot": "one sentence citing the specific data signal",
      "whyCreatorIsVulnerable": "one sentence citing their specific gap",
      "suggestedAngle": "specific content angle for this channel and topic",
      "sampleVideoTitle": "ready-to-use video title",
      "urgencyReason": "one sentence on why timing matters now"
    }
  ]
}`,
    userMessage: (ctx) => `Analyze this channel's attack opportunities:\n${JSON.stringify(ctx, null, 2)}`
  },

  strategy: {
    system: `You are a professional content strategist creating execution plans for YouTube creators.
You receive niche data including demand signals, competition levels, and content gaps.
Produce specific, non-generic recommendations grounded in the data.
Always respond with valid JSON only. No preamble, no markdown fences.
Required output schema:
{
  "strategySummaryNarrative": "3-4 sentence executive summary grounded in the specific data",
  "videoIdeaTitles": ["10 specific ready-to-use video titles"],
  "differentiationDescription": "2 sentences on how to stand out specific to this niche",
  "quickWins": ["5 specific actions for the first 2 weeks"]
}`,
    userMessage: (ctx) => `Generate content strategy for this niche:\n${JSON.stringify(ctx, null, 2)}`
  },

  monetization: {
    system: `You are a monetization analyst evaluating content niche revenue potential.
You receive scoring data about advertiser demand, audience value, and revenue paths.
Produce a clear, honest assessment a creator can act on.
Always respond with valid JSON only. No preamble, no markdown fences.
Required output schema:
{
  "verdictDescription": "2-3 sentence monetization outlook specific to this niche and score",
  "topOpportunitiesBullets": ["3-5 specific monetization opportunities with reasoning"],
  "riskBullets": ["2-3 specific risks or caveats"]
}`,
    userMessage: (ctx) => `Evaluate monetization potential:\n${JSON.stringify(ctx, null, 2)}`
  },

  synthesizer: {
    system: `You are a trend analyst synthesizing news and YouTube momentum data into creator intelligence.
You receive pre-clustered trending topics with velocity scores.
Produce sharp summaries a content creator can act on immediately.
Always respond with valid JSON only. No preamble, no markdown fences.
Required output schema:
{
  "clusterSummaries": [
    {
      "clusterId": "exact clusterId from input",
      "summary": "2-3 sentence synthesis of what is happening",
      "whyItMatters": "1 sentence on creator relevance",
      "contentOpportunity": "1 specific content angle to pursue now"
    }
  ]
}`,
    userMessage: (ctx) => `Synthesize these trend clusters:\n${JSON.stringify(ctx, null, 2)}`
  },

  growth: {
    system: `You are a YouTube growth coach creating personalized growth roadmaps.
You receive niche opportunity data, competitive landscape signals, and projected milestones.
Produce a motivating but realistic assessment grounded in the numbers provided.
Always respond with valid JSON only. No preamble, no markdown fences.
Required output schema:
{
  "executiveSummary": "3-4 sentence growth overview referencing the specific projections",
  "phaseDescriptions": [
    "Phase 1 specific focus — reference the actual weeks and goals",
    "Phase 2 specific focus — reference the actual targets",
    "Phase 3 specific focus — reference the authority milestone"
  ]
}`,
    userMessage: (ctx) => `Create growth blueprint narrative:\n${JSON.stringify(ctx, null, 2)}`
  }
}
```

---

### 2D. Response Parser

**File:** `/features/conductor/responseParser.ts`

#### `parseAndValidateLLMResponse(rawText: string, feature: ConductorFeature): LLMEnhancedFields`

- Strip markdown code fences if present
- Parse JSON with try/catch — return `{}` on failure, log warning
- Validate expected top-level keys exist for the feature
- Return typed `LLMEnhancedFields`
- Never throw — always return something usable

#### `mergeLLMWithRulesBased<T>(rulesResult: T, llmFields: LLMEnhancedFields, fieldMap: Partial<Record<keyof LLMEnhancedFields, keyof T>>): T`

Merges LLM output into existing result. Only overwrites fields present and non-empty in `llmFields`. Returns original `rulesResult` unchanged if `llmFields` is empty.

---

### 2E. Conductor Service

**File:** `/features/conductor/conductorService.ts`

#### `callConductor(feature: ConductorFeature, context: Record<string, unknown>, stream?: boolean): Promise<ConductorResponse>`

Calls `POST /api/conductor/complete` or `POST /api/conductor/stream` on ASP.NET backend. Includes JWT token in Authorization header.

On `hasKey: false`: returns `{ hasKey: false, fallbackRequired: true }`.
On network error: returns `{ hasKey: true, fallbackRequired: true, error: 'Network error' }`.

#### `enhanceWithLLM<T>(feature: ConductorFeature, rulesResult: T, contextBuilder: (r: T) => Record<string, unknown>, fieldMap: Partial<Record<keyof LLMEnhancedFields, keyof T>>): Promise<T>`

The single function all features call:
1. Build context using `contextBuilder(rulesResult)`
2. Call `callConductor`
3. If `fallbackRequired`, return `rulesResult` unchanged
4. Parse with `parseAndValidateLLMResponse`
5. Merge with `mergeLLMWithRulesBased`
6. Return enhanced result

Hard 15-second timeout — if exceeded, return `rulesResult` silently.

---

### 2F. Streaming Hook

**File:** `/features/conductor/hooks/useStreamingConductor.ts`

```ts
export function useStreamingConductor() {
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const startStream = async (feature: ConductorFeature, context: Record<string, unknown>) => {
    abortRef.current = new AbortController()
    setStreamedText('')
    setIsStreaming(true)

    const response = await fetch('/api/conductor/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ feature, context }),
      signal: abortRef.current.signal
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    while (reader) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      // Parse SSE format: "data: {token}\n\n"
      const tokens = chunk.split('\n').filter(l => l.startsWith('data: ')).map(l => l.slice(6))
      tokens.forEach(t => { if (t !== '[DONE]') setStreamedText(prev => prev + t) })
    }

    setIsStreaming(false)
  }

  const cancelStream = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  return { streamedText, isStreaming, startStream, cancelStream }
}
```

---

### 2G. API Key Client

**File:** `/features/conductor/apiKeyClient.ts`

```ts
export async function getProviders(): Promise<ProviderInfo[]>
export async function getUserApiKeys(): Promise<UserApiKeyInfo[]>
export async function addApiKey(request: AddKeyRequest): Promise<UserApiKeyInfo>
export async function removeApiKey(provider: LLMProvider): Promise<void>
export async function verifyApiKey(provider: LLMProvider, rawKey: string, model: string): Promise<VerifyKeyResult>
export async function getConductorPreferences(): Promise<UserConductorPreferences>
export async function updateConductorPreferences(request: UpdatePreferencesRequest): Promise<UserConductorPreferences>
```

All include JWT token in Authorization header.

---

### 2H. React Query Hooks

**File:** `/features/conductor/hooks/useApiKeys.ts`

```ts
export function useProviders(): { providers: ProviderInfo[], isLoading: boolean }

export function useApiKeys(): {
  keys: UserApiKeyInfo[]
  isLoading: boolean
  hasAnyKey: boolean
  hasKey: (provider: LLMProvider) => boolean
  getKey: (provider: LLMProvider) => UserApiKeyInfo | undefined
}

export function useAddApiKey(): {
  addKey: (req: AddKeyRequest) => Promise<void>
  isAdding: boolean
}

export function useRemoveApiKey(): {
  removeKey: (provider: LLMProvider) => Promise<void>
  isRemoving: boolean
}

export function useVerifyApiKey(): {
  verify: (provider: LLMProvider, rawKey: string, model: string) => Promise<VerifyKeyResult>
  isVerifying: boolean
}

export function useConductorPreferences(): {
  preferences: UserConductorPreferences | undefined
  isLoading: boolean
  updatePreferences: (req: UpdatePreferencesRequest) => Promise<void>
  isUpdating: boolean
}
```

All mutations invalidate `['userApiKeys']` on success and show appropriate toasts.

---

## PART 3 — FEATURE INTEGRATION

Add one call to `enhanceWithLLM` at the end of each service. Signatures and return types do not change.

**`/features/creators/opportunity/services/attackEngine.ts`** — add at end of `runAttackEngine`:
```ts
return enhanceWithLLM('attackEngine', result, buildAttackEngineContext, {
  strategicSummary: 'strategicSummary'
})
```

**`/features/strategy/services/getContentStrategy.ts`** — add at end of `getContentStrategy`:
```ts
return enhanceWithLLM('strategy', result, buildStrategyContext, {
  strategySummaryNarrative: 'strategySummary',
  quickWins: 'quickWins'
})
```

**`/features/monetization/services/getMonetizationInsights.ts`** — add at end:
```ts
return enhanceWithLLM('monetization', result, buildMonetizationContext, {
  verdictDescription: 'verdictDescription',
  topOpportunitiesBullets: 'topOpportunities',
  riskBullets: 'risks'
})
```

**`/features/trends/synthesizer/synthesis.ts`** — add at end:
```ts
return enhanceWithLLM('synthesizer', result, buildSynthesizerContext, {})
```

**`/features/growth/services/getGrowthBlueprint.ts`** — add at end:
```ts
return enhanceWithLLM('growth', result, buildGrowthContext, {
  executiveSummary: 'executiveSummary'
})
```

---

## PART 4 — SETTINGS UI

---

### 4A. AI Settings Page

**File:** `/app/settings/ai/page.tsx`

Full page at `/settings/ai`. Add to navigation under Settings.

**Section 1 — Active AI Configuration**

The primary control at the top of the page. A prominent card with:

- "Your Active AI" heading
- Provider selector: four large radio cards side by side (2×2 on mobile):

```
┌─────────────┐  ┌─────────────┐
│  Anthropic  │  │   OpenAI    │
│  [Claude]   │  │   [GPT]     │
│  ● Active   │  │  ○ Select   │
└─────────────┘  └─────────────┘
┌─────────────┐  ┌─────────────┐
│   Google    │  │     xAI     │
│  [Gemini]   │  │   [Grok]    │
│  ○ Select   │  │  ○ Select   │
└─────────────┘  └─────────────┘
```

Each provider card shows:
- Provider name + logo color (Anthropic: purple, OpenAI: green, Google: blue, xAI: black/dark)
- "No key added" badge if no key stored, "✓ Verified" badge if verified
- Selecting a provider with no key prompts them to add one inline

- Model selector dropdown — appears when a provider is selected, shows that provider's models grouped by tier:
```
Premium:  Claude Opus 4.6
Standard: Claude Sonnet 4.6  ← default
Fast:     Claude Haiku 4.5
```

- Fallback provider section (collapsed by default, expandable):
  "If your primary provider fails, fall back to:" with same provider + model selector

- Streaming toggle with label "Enable streaming responses (text appears as it's written)"

- "Save Preferences" button — calls `updateConductorPreferences`

**Section 2 — API Keys**

One expandable card per provider. Default state: collapsed. Expand to manage.

Each expanded card shows:
- If no key: labeled input field (password type) + model dropdown + "Add & Verify" button
- If key exists:
  - Masked display: `sk-ant-••••••••••{hint}` (format matches provider prefix)
  - Model preference badge
  - Verified status + last verified timestamp
  - "Re-verify" button + "Remove Key" button
- Key format hint below input: "Anthropic keys start with sk-ant-"
- Inline verification — clicking "Add & Verify" runs the test call and shows result inline without page navigation:
  - Loading: spinner with "Testing key..."
  - Success: green checkmark with "✓ Key verified — Claude Sonnet 4.6 responded in 412ms"
  - Failure: red X with the specific error message from the backend

**Section 3 — What This Unlocks**

Feature comparison table:

| Feature | Without Key | With Key |
|---|---|---|
| Attack Engine | Rule-based insights | LLM-powered analysis |
| Content Strategy | Template output | Strategic narrative |
| Monetization | Score verdict | Analyst assessment |
| Trend Synthesizer | Auto summaries | Sharp commentary |
| Growth Blueprint | Formula plan | Personalized roadmap |

**Section 4 — Security & Privacy**

Card with lock icon:
- Keys encrypted with AES-256 before storage
- Raw keys never logged or exposed to the browser
- All LLM calls made server-side only
- Your provider account is billed directly — CreatorIQ adds no markup
- Keys removable at any time

---

### 4B. Global AI Status Badge

**File:** `/components/conductor/AiStatusBadge.tsx`

Small badge in app header next to the notification bell.

States:
- No keys at all: gray "AI Off" — clicking goes to `/settings/ai`
- Keys present, none set as active: amber "AI Setup" — clicking goes to `/settings/ai`
- Active provider set and verified: colored badge matching provider:
  - Anthropic: purple "✨ Claude"
  - OpenAI: green "✨ GPT"
  - Google: blue "✨ Gemini"
  - xAI: white/gray "✨ Grok"
- Tooltip on hover shows: "Active: {modelDisplayName} — Change in Settings"

Uses `useApiKeys()` and `useConductorPreferences()` internally.

---

### 4C. LLM Enhanced Badge

**File:** `/components/conductor/LLMEnhancedBadge.tsx`

Props: `{ isEnhanced: boolean, provider?: LLMProvider, isStreaming?: boolean }`

- Streaming: small pulsing "✨ Writing..." badge
- Enhanced: static "✨ {providerName}" badge — e.g. "✨ Claude", "✨ Gemini"
- Tooltip on hover: "This insight was generated by {modelDisplayName}"
- Not enhanced: nothing rendered

Used next to all narrative fields in `StrategicSummaryPanel`, `AttackOpportunitiesCard`, `MonetizationScoreCard`, and `BlueprintSummaryCard`.

---

## DESIGN REQUIREMENTS

- **Dark-mode-first** — consistent with all previous steps
- Provider selection cards must feel like a premium integrations page
- Each provider has a distinct color identity — use it consistently across badges and cards
- The active provider card has a subtle colored border/glow matching the provider color
- Verified badge is a green checkmark — not just text
- The inline key verification result must animate in smoothly
- Model tier labels (Premium / Standard / Fast) help users make informed choices
- `LLMEnhancedBadge` is subtle — annotates without distracting
- Use **shadcn/ui**: `Card`, `Badge`, `Input`, `Button`, `Select`, `RadioGroup`, `Separator`, `Switch`, `Collapsible`, `Tooltip`
- All layouts fully responsive

---

## CONSTRAINTS

- Raw API keys must never appear in logs, error messages, API responses, or browser network tab
- `enhanceWithLLM` has a hard 15-second timeout — falls back silently on timeout
- All existing services work identically when no key is present — zero overhead
- User must have a stored key for the selected active provider — cannot set preferences to a provider without a key
- Grok (xAI) uses OpenAI-compatible API format — share the same caller implementation
- Do not change any type definitions, scoring functions, or UI components from Steps 1–9
- All TypeScript — no `any`

---

## WHAT NOT TO BUILD

- Do not build usage tracking or token counting
- Do not build shared or team API keys
- Do not build prompt customization by users
- Do not build Groq support (not requested)
- Do not build billing or subscription management

---

## SUCCESS CRITERIA

1. User can add keys for all four providers independently
2. Each key is verified with a real test call showing provider-specific latency
3. User can set any verified provider as active with any of that provider's models
4. Fallback provider activates automatically if primary fails
5. `AiStatusBadge` shows correct provider name and color in the header
6. Attack engine produces noticeably richer output when a key is active
7. `LLMEnhancedBadge` shows the correct provider name next to enhanced fields
8. Switching active provider in preferences immediately affects next feature call
9. Rule-based output is identical for users without any keys
10. Raw key is never visible in browser network tab or server logs

---

## DELIVERY ORDER

1. `/migrations/004_user_api_keys.sql`
2. `/Services/Conductor/ProviderRegistry.cs`
3. `/Services/Encryption/ApiKeyEncryptionService.cs`
4. `/Repositories/UserApiKeyRepository.cs`
5. `/Services/Conductor/KeyVerificationService.cs`
6. `/Services/Conductor/UniversalLLMCaller.cs`
7. `/Controllers/UserApiKeysController.cs`
8. `/Controllers/ConductorController.cs`
9. `/features/conductor/types.ts`
10. `/features/conductor/contextBuilder.ts`
11. `/features/conductor/prompts/index.ts`
12. `/features/conductor/responseParser.ts`
13. `/features/conductor/conductorService.ts`
14. `/features/conductor/hooks/useStreamingConductor.ts`
15. `/features/conductor/apiKeyClient.ts`
16. `/features/conductor/hooks/useApiKeys.ts`
17. Updated `/features/creators/opportunity/services/attackEngine.ts`
18. Updated `/features/strategy/services/getContentStrategy.ts`
19. Updated `/features/monetization/services/getMonetizationInsights.ts`
20. Updated `/features/trends/synthesizer/synthesis.ts`
21. Updated `/features/growth/services/getGrowthBlueprint.ts`
22. `/components/conductor/AiStatusBadge.tsx`
23. `/components/conductor/LLMEnhancedBadge.tsx`
24. `/app/settings/ai/page.tsx`
25. Updated app header (add `AiStatusBadge`)

After all files provide a note on: (1) how to add a fifth provider like Groq or Ollama using the existing `ProviderRegistry` pattern, and (2) how to handle the case where a user's key runs out of credits mid-session gracefully.

---

All four providers supported, the `ProviderRegistry` makes adding more a one-file change, Grok reuses the OpenAI caller since it's API-compatible, and users have full control over which model powers their experience.