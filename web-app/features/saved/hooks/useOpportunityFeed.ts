import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { OpportunityFeedItem } from '../types';

export function useOpportunityFeed(limit: number = 50) {
    return useQuery<OpportunityFeedItem[]>({
        queryKey: ['saved', 'feed', limit],
        queryFn: async () => {
            const { data } = await axios.get(`/api/saved/feed?limit=${limit}`);
            return data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
    });
}
