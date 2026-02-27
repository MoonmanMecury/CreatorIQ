import { ConductorFeature, ConductorResponse, LLMEnhancedFields } from "./types"
import { parseAndValidateLLMResponse, mergeLLMWithRulesBased } from "./responseParser"

/**
 * Backend API caller for Conductor.
 * Note: Assumes a getToken() function exists globally or in a local lib.
 * For this implementation, we'll assume it's available via a placeholder.
 */
function getToken(): string {
    // In a real app, this would come from a cookie or localStorage
    return typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
}

export async function callConductor(
    feature: ConductorFeature,
    context: Record<string, unknown>,
    stream: boolean = false
): Promise<ConductorResponse> {
    try {
        const response = await fetch('/api/conductor/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ feature, context })
        })

        if (!response.ok) {
            return { hasKey: true, fallbackRequired: true, error: `HTTP ${response.status}` }
        }

        return await response.json()
    } catch (err) {
        console.error('[Conductor] Network error', err)
        return { hasKey: true, fallbackRequired: true, error: 'Network error' }
    }
}

/**
 * Orchestrator for LLM enhancement.
 * Calls the conductor, parses results, and merges them back into the rules-based output.
 */
export async function enhanceWithLLM<T>(
    feature: ConductorFeature,
    rulesResult: T,
    contextBuilder: (r: T) => Record<string, unknown>,
    fieldMap: Partial<Record<keyof LLMEnhancedFields, keyof T>>
): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s hard timeout

    try {
        const context = contextBuilder(rulesResult)

        // We use callConductor with the timeout signal
        // Note: callConductor above doesn't take signal yet, let's fix that pattern
        const response = await fetch('/api/conductor/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ feature, context }),
            signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) return rulesResult

        const data: ConductorResponse = await response.json()

        if (data.fallbackRequired || !data.content) {
            return rulesResult
        }

        const llmFields = parseAndValidateLLMResponse(data.content, feature)

        // Add provider/model metadata for UI badges if desired
        // For now, we just merge the text fields
        const enhanced = mergeLLMWithRulesBased(rulesResult, llmFields, fieldMap)

        // Attach metadata about the enhancement for LLMEnhancedBadge
        return {
            ...enhanced,
            _llm: {
                enhanced: true,
                provider: data.provider,
                model: data.model
            }
        }
    } catch (err) {
        if ((err as Error).name === 'AbortError') {
            console.warn(`[Conductor] Timeout enhancing ${feature}`)
        } else {
            console.error(`[Conductor] Enhancement failed for ${feature}`, err)
        }
        return rulesResult
    } finally {
        clearTimeout(timeoutId)
    }
}
