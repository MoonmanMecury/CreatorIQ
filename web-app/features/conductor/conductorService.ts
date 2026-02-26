import { createClient } from '@/lib/supabase/client'
import { ConductorFeature, ConductorResponse, LLMEnhancedFields } from './types'
import { PROMPTS } from './prompts'
import { parseAndValidateLLMResponse, mergeLLMWithRulesBased } from './responseParser'

const supabase = createClient()

export async function callConductor(
  feature: ConductorFeature,
  context: Record<string, unknown>,
  stream?: boolean
): Promise<ConductorResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { hasKey: false, fallbackRequired: true }

    const promptConfig = PROMPTS[feature]
    const body = {
      feature,
      systemPrompt: promptConfig.system,
      userMessage: promptConfig.userMessage(context),
      maxTokens: 1500
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5087'}/api/conductor/${stream ? 'stream' : 'complete'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      return { hasKey: true, fallbackRequired: true, error: `HTTP error! status: ${response.status}` }
    }

    if (stream) {
      // Streaming is handled by the hook
      return { hasKey: true, fallbackRequired: false }
    }

    return await response.json()
  } catch (error) {
    console.error('Conductor call failed:', error)
    return { hasKey: true, fallbackRequired: true, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function enhanceWithLLM<T>(
  feature: ConductorFeature,
  rulesResult: T,
  contextBuilder: (r: T) => Record<string, unknown>,
  fieldMap: Partial<Record<keyof LLMEnhancedFields, keyof T>>
): Promise<T> {
  const timeout = new Promise<null>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 15000)
  )

  try {
    const context = contextBuilder(rulesResult)
    const response = await Promise.race([
      callConductor(feature, context),
      timeout
    ]) as ConductorResponse

    if (!response || response.fallbackRequired || !response.content) {
      return rulesResult
    }

    const llmFields = parseAndValidateLLMResponse(response.content, feature)
    const merged = mergeLLMWithRulesBased(rulesResult, llmFields, fieldMap)

    return {
      ...merged,
      isEnhanced: true,
      llmProvider: response.provider,
      llmModel: response.model
    }
  } catch (error) {
    console.warn('LLM Enhancement failed, falling back to rules-based:', error)
    return rulesResult
  }
}
