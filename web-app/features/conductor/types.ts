export type LLMProvider = 'anthropic' | 'openai' | 'google' | 'xai'

export type ConductorFeature =
    | 'attackEngine'
    | 'strategy'
    | 'monetization'
    | 'synthesizer'
    | 'growth'

export interface ProviderInfo {
    provider_id: LLMProvider
    display_name: string
    key_prefix: string
    models: ModelInfo[]
}

export interface ModelInfo {
    model_id: string
    display_name: string
    tier: 'premium' | 'standard' | 'fast'
    is_default: boolean
}

export interface UserApiKeyInfo {
    provider: LLMProvider
    provider_display_name: string
    key_hint: string
    model_preference: string
    model_display_name: string
    verified: boolean
    last_verified_at: string | null
}

export interface UserConductorPreferences {
    active_provider: LLMProvider
    active_model: string
    fallback_provider: LLMProvider | null
    fallback_model: string | null
    streaming_enabled: boolean
}

export interface ConductorResponse {
    has_key: boolean
    fallback_required: boolean
    provider?: LLMProvider
    model?: string
    content?: string
    latency_ms?: number
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
    raw_key: string
    model_preference: string
}

export interface VerifyKeyResult {
    is_valid: boolean
    error_message: string | null
    latency_ms: number
}

export interface UpdatePreferencesRequest {
    active_provider: LLMProvider
    active_model: string
    fallback_provider: LLMProvider | null
    fallback_model: string | null
    streaming_enabled: boolean
}
