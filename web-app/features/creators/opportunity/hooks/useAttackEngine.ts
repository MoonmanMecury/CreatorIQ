import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AttackEngineResult } from '../types';

/**
 * Hook to query the Creator Opportunity Attack Engine.
 * 
 * @param channelId - The YouTube Channel ID to analyze.
 */
export function useAttackEngine(channelId: string | null) {
    return useQuery<AttackEngineResult, Error>({
        queryKey: ['attackEngine', channelId],
        queryFn: async () => {
            if (!channelId) throw new Error('Channel ID is required');
            const { data } = await axios.get<AttackEngineResult>(`/api/creators/attack`, {
                params: { channelId }
            });
            return data;
        },
        enabled: !!channelId && channelId.trim().length > 0,
        staleTime: 15 * 60 * 1000, // 15 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });
}
