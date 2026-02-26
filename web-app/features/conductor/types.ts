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
