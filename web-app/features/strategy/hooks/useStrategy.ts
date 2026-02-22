/**
 * @file useStrategy.ts
 * React Query hook for fetching ContentStrategy data.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { ContentStrategy } from '../types';

async function fetchStrategy(keyword: string): Promise<ContentStrategy> {
    const res = await fetch(
        `/api/strategy?keyword=${encodeURIComponent(keyword)}`
    );
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Strategy API error: ${res.status}`);
    }
    return res.json();
}

/**
 * Fetches and caches a ContentStrategy for the given keyword.
 *
 * @param keyword - The niche keyword to generate a strategy for. Pass null to disable.
 */
export function useStrategy(keyword: string | null) {
    return useQuery<ContentStrategy, Error>({
        queryKey: ['strategy', keyword],
        queryFn: () => fetchStrategy(keyword!),
        enabled: !!keyword && keyword.trim().length > 0,
        staleTime: 15 * 60 * 1000, // 15 minutes — strategy doesn't change often
        retry: 2,
    });
}
