import { ConductorFeature, LLMEnhancedFields } from "./types"

/**
 * Strips markdown code fences and parses JSON strictly.
 * Returns empty object on failure rather than throwing.
 */
export function parseAndValidateLLMResponse(rawText: string, feature: ConductorFeature): LLMEnhancedFields {
    try {
        let cleanText = rawText.trim()

        // Strip markdown code fences if present (e.g. ```json ... ```)
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '')
        }

        const parsed = JSON.parse(cleanText) as LLMEnhancedFields

        // Simple validation of top-level keys based on feature
        // This ensures we're not merging junk if the LLM hallucinated the schema
        const validators: Record<ConductorFeature, string[]> = {
            attackEngine: ['strategicSummary', 'opportunities'],
            strategy: ['strategySummaryNarrative', 'videoIdeaTitles'],
            monetization: ['verdictDescription', 'topOpportunitiesBullets'],
            synthesizer: ['clusterSummaries'],
            growth: ['executiveSummary', 'phaseDescriptions']
        }

        const requiredKeys = validators[feature]
        const hasRequired = requiredKeys.every(key => key in parsed)

        if (!hasRequired) {
            console.warn(`[Conductor] Response for ${feature} missing required keys.`, parsed)
            return {}
        }

        return parsed
    } catch (err) {
        console.error(`[Conductor] Failed to parse LLM response for ${feature}`, err)
        return {}
    }
}

/**
 * Merges LLM output into rule-based results.
 * Only overwrites fields if they are present and non-empty in llmFields.
 */
export function mergeLLMWithRulesBased<T>(
    rulesResult: T,
    llmFields: LLMEnhancedFields,
    fieldMap: Partial<Record<keyof LLMEnhancedFields, keyof T>>
): T {
    if (!llmFields || Object.keys(llmFields).length === 0) return rulesResult

    const result = { ...rulesResult }

    for (const [llmKey, targetKey] of Object.entries(fieldMap)) {
        const val = (llmFields as any)[llmKey]
        if (val !== undefined && val !== null && (Array.isArray(val) ? val.length > 0 : val !== '')) {
            (result as any)[targetKey] = val
        }
    }

    // Handle special cases like clusterSummaries which might need nested merging
    if (llmFields.clusterSummaries && (result as any).topClusters) {
        (result as any).topClusters = (result as any).topClusters.map((c: any) => {
            const enhanced = llmFields.clusterSummaries?.find(s => s.clusterId === c.clusterId)
            if (enhanced) {
                return { ...c, ...enhanced }
            }
            return c
        })
    }

    return result
}
