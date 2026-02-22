/**
 * @file useGrowthBlueprint.ts
 * React Query hook for fetching the Creator Growth Blueprint.
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { GrowthBlueprint } from '../types';

/**
 * Fetches the growth blueprint for a given keyword.
 * 
 * @param keyword - The niche keyword to analyze.
 * @returns Query result with GrowthBlueprint data.
 */
export function useGrowthBlueprint(keyword: string | null) {
    return useQuery<GrowthBlueprint>({
        queryKey: ['growth', keyword],
        queryFn: async () => {
            if (!keyword) throw new Error('Keyword is required');
            const { data } = await axios.get<GrowthBlueprint>(`/api/growth`, {
                params: { keyword }
            });
            return data;
        },
        enabled: !!keyword && keyword.trim().length > 0,
        staleTime: 1000 * 60 * 20, // 20 minutes
        retry: 2,
        refetchInterval: false,
    });
}
