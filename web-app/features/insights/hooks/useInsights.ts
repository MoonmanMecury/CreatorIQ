import { useQuery } from '@tanstack/react-query';
import type { InsightsResponse } from '../types';

/**
 * Fetch insights for the given keyword from the internal Next.js API route.
 */
async function fetchInsights(keyword: string): Promise<InsightsResponse> {
    const res = await fetch(`/api/insights?keyword=${encodeURIComponent(keyword)}`);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed with status ${res.status}`);
    }
    return res.json() as Promise<InsightsResponse>;
}

/**
 * React Query hook for fetching opportunity insights for a keyword.
 *
 * @param keyword - The niche keyword to analyse. Pass null or empty string to disable fetching.
 *
 * @example
 * const { data, isLoading, isError } = useInsights('home workout');
 */
export function useInsights(keyword: string | null) {
    return useQuery<InsightsResponse, Error>({
        queryKey: ['insights', keyword],
        queryFn: () => fetchInsights(keyword!),
        enabled: Boolean(keyword && keyword.trim().length > 0),
        staleTime: 1000 * 60 * 5, // 5 minutes — data is stable, no need to re-fetch often
        retry: 1,
    });
}
