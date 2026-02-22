/**
 * @file cache.ts
 * In-memory cache for SynthesisResult.
 * 
 * TODO: Replace with Redis (e.g. via `ioredis` or Upstash) in production.
 * Key pattern: `synthesizer:${category ?? 'ALL'}`
 * TTL: 15 minutes — do not allow more frequent full pipeline runs to protect YouTube quota.
 */

import type { SynthesisResult } from './types'

interface CacheEntry {
    result: SynthesisResult
    cachedAt: number  // Date.now()
}

const cache: Map<string, CacheEntry> = new Map()
const CACHE_TTL_MS = 15 * 60 * 1000  // 15 minutes

/**
 * Returns cached result if it exists and is less than 15 minutes old.
 */
export function getCachedResult(key: string): SynthesisResult | null {
    const entry = cache.get(key)
    if (!entry) return null
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
        cache.delete(key)
        return null
    }
    return entry.result
}

/**
 * Stores a SynthesisResult with the current timestamp.
 */
export function setCachedResult(key: string, result: SynthesisResult): void {
    cache.set(key, { result, cachedAt: Date.now() })
}

/**
 * Clears all cached entries.
 */
export function clearCache(): void {
    cache.clear()
}
