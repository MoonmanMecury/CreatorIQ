'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SynthesisResult, TrendCategory } from '../types'

interface UseTrendSynthesizerOptions {
    category?: TrendCategory
    limit?: number
    autoRefresh?: boolean
}

async function fetchSynthesizer(options?: UseTrendSynthesizerOptions): Promise<SynthesisResult> {
    const params = new URLSearchParams()
    if (options?.category) params.set('category', options.category)
    if (options?.limit) params.set('limit', String(options.limit))

    const res = await fetch(`/api/trends/synthesizer?${params.toString()}`)
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `HTTP ${res.status}`)
    }
    return res.json()
}

async function fetchSynthesizerRefresh(options?: UseTrendSynthesizerOptions): Promise<SynthesisResult> {
    const params = new URLSearchParams({ refresh: 'true' })
    if (options?.category) params.set('category', options.category)
    if (options?.limit) params.set('limit', String(options.limit))

    const res = await fetch(`/api/trends/synthesizer?${params.toString()}`)
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `HTTP ${res.status}`)
    }
    return res.json()
}

/**
 * Hook to query the trend synthesizer pipeline.
 */
export function useTrendSynthesizer(options?: UseTrendSynthesizerOptions) {
    const query = useQuery<SynthesisResult, Error>({
        queryKey: ['trendSynthesizer', options?.category, options?.limit],
        queryFn: () => fetchSynthesizer(options),
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchInterval: options?.autoRefresh ? 15 * 60 * 1000 : false,
    })

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        lastUpdated: query.data?.generatedAt ?? null,
    }
}

/**
 * Hook to manually trigger a fresh pipeline run, bypassing cache.
 */
export function useTriggerRefresh(options?: UseTrendSynthesizerOptions) {
    const queryClient = useQueryClient()

    const mutation = useMutation<SynthesisResult, Error>({
        mutationFn: () => fetchSynthesizerRefresh(options),
        onSuccess: (data) => {
            queryClient.setQueryData(['trendSynthesizer', options?.category, options?.limit], data)
            queryClient.invalidateQueries({ queryKey: ['trendSynthesizer'] })
        },
    })

    return {
        refreshNow: () => mutation.mutate(),
        isRefreshing: mutation.isPending,
        error: mutation.error,
    }
}
