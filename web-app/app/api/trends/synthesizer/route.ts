import { NextRequest, NextResponse } from 'next/server'
import { runSynthesizerPipeline } from '@/features/trends/synthesizer/pipeline'
import { getCachedResult, setCachedResult } from '@/features/trends/synthesizer/cache'
import type { TrendCategory, SynthesisResult } from '@/features/trends/synthesizer/types'

const VALID_CATEGORIES = new Set<TrendCategory>([
    'TECHNOLOGY', 'BUSINESS', 'POLITICS', 'HEALTH',
    'SCIENCE', 'ENTERTAINMENT', 'SPORTS', 'GENERAL',
])

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const refresh = searchParams.get('refresh') === 'true'
    const categoryParam = searchParams.get('category')?.toUpperCase() as TrendCategory | undefined
    const limitParam = parseInt(searchParams.get('limit') ?? '10', 10)
    const limit = Math.min(Math.max(limitParam, 1), 20)

    const cacheKey = 'synthesizer:all'
    let cacheHit = false
    let result: SynthesisResult | null = null
    let partialResult: SynthesisResult | null = null

    // Check cache (unless refresh requested)
    if (!refresh) {
        const cached = getCachedResult(cacheKey)
        if (cached) {
            result = cached
            cacheHit = true
        }
    }

    // Cache miss — run pipeline
    if (!result) {
        try {
            result = await runSynthesizerPipeline({ maxClustersToReturn: 20 })
            setCachedResult(cacheKey, result)
        } catch (err) {
            console.error('[API] Synthesizer pipeline failed:', err)

            // Return partial result if available
            const errorMessage = err instanceof Error ? err.message : 'Pipeline failed'
            return NextResponse.json(
                { error: errorMessage, partialResult },
                {
                    status: 500,
                    headers: { 'X-Cache': 'MISS' },
                }
            )
        }
    }

    // Apply category filter if provided
    let filteredResult = { ...result }

    if (categoryParam && VALID_CATEGORIES.has(categoryParam)) {
        filteredResult = {
            ...result,
            topClusters: result.topClusters.filter(c => c.category === categoryParam),
            breakingNow: result.breakingNow.filter(c => c.category === categoryParam),
            emergingOpportunities: result.emergingOpportunities.filter(c => c.category === categoryParam),
        }
    }

    // Apply limit
    filteredResult = {
        ...filteredResult,
        topClusters: filteredResult.topClusters.slice(0, limit),
    }

    return NextResponse.json(filteredResult, {
        status: 200,
        headers: {
            'X-Cache': cacheHit ? 'HIT' : 'MISS',
            'Cache-Control': 'no-store',
        },
    })
}
