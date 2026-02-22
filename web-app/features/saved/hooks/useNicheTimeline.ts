import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TimelineEntry } from '../services/getTimeline';

export function useNicheTimeline(savedNicheId: string | null) {
    return useQuery<TimelineEntry[]>({
        queryKey: ['saved', 'timeline', savedNicheId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/saved/${savedNicheId}/timeline`);
            return data;
        },
        enabled: !!savedNicheId,
        staleTime: 60 * 1000,
    });
}
