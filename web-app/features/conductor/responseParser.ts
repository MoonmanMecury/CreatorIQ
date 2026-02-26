import { ConductorFeature, LLMEnhancedFields } from './types'

export function parseAndValidateLLMResponse(rawText: string, feature: ConductorFeature): LLMEnhancedFields {
  try {
    // Strip markdown code fences if present
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleanJson)

    // Basic validation based on feature
    // In a real app, we'd do more thorough validation
    return parsed as LLMEnhancedFields
  } catch (error) {
    console.warn(`Failed to parse LLM response for ${feature}:`, error)
    return {}
  }
}

export function mergeLLMWithRulesBased<T>(
  rulesResult: T,
  llmFields: LLMEnhancedFields,
  fieldMap: Partial<Record<keyof LLMEnhancedFields, keyof T>>
): T {
  if (!llmFields || Object.keys(llmFields).length === 0) {
    return rulesResult
  }

  const enhanced = { ...rulesResult }

  for (const [llmKey, resultKey] of Object.entries(fieldMap)) {
    const value = llmFields[llmKey as keyof LLMEnhancedFields]
    if (value !== undefined && value !== null && resultKey) {
      // @ts-ignore
      enhanced[resultKey] = value
    }
  }

  // Handle special cases like arrays (clusters)
  if (llmFields.clusterSummaries && (enhanced as any).topClusters) {
    const clusters = (enhanced as any).topClusters as any[]
    llmFields.clusterSummaries.forEach(summary => {
      const idx = clusters.findIndex(c => c.clusterId === summary.clusterId)
      if (idx !== -1) {
        clusters[idx] = { ...clusters[idx], ...summary }
      }
    })
  }

  return enhanced
}
