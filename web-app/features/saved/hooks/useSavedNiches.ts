import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { SavedNichesOverview, SaveNichePayload, SavedNiche } from '../types';

/**
 * Hook to fetch the full saved overview.
 */
export function useSavedOverview() {
    return useQuery<SavedNichesOverview>({
        queryKey: ['saved', 'overview'],
        queryFn: async () => {
            const { data } = await axios.get('/api/saved');
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to check if a niche is saved.
 */
export function useIsNicheSaved(keyword: string | null) {
    const { data: overview, isLoading } = useSavedOverview();

    if (!keyword || !overview) return { isSaved: false, savedNicheId: null, isLoading };

    const matching = overview.savedNiches.find(n => n.keyword.toLowerCase() === keyword.toLowerCase());

    return {
        isSaved: !!matching,
        savedNicheId: matching?.id || null,
        isLoading
    };
}

/**
 * Hook to save a niche.
 */
export function useSaveNiche() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SaveNichePayload) => {
            const { data } = await axios.post('/api/saved', payload);
            return data;
        },
        onSuccess: (data: SavedNiche) => {
            queryClient.invalidateQueries({ queryKey: ['saved', 'overview'] });
            queryClient.invalidateQueries({ queryKey: ['saved', 'isSaved', data.keyword] });
            queryClient.invalidateQueries({ queryKey: ['saved', 'feed'] });
        }
    });
}

/**
 * Hook to unsave a niche.
 */
export function useUnsaveNiche() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (nicheId: string) => {
            await axios.delete(`/api/saved/${nicheId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved', 'overview'] });
            queryClient.invalidateQueries({ queryKey: ['saved', 'isSaved'] });
            queryClient.invalidateQueries({ queryKey: ['saved', 'feed'] });
        }
    });
}

/**
 * Hook to re-analyze a niche.
 */
export function useReanalyzeNiche() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, newScores }: { id: string, newScores: SaveNichePayload }) => {
            const { data } = await axios.patch(`/api/saved/${id}`, {
                reanalyze: true,
                newScores
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved', 'overview'] });
            queryClient.invalidateQueries({ queryKey: ['saved', 'timeline'] });
            queryClient.invalidateQueries({ queryKey: ['saved', 'feed'] });
        }
    });
}

/**
 * Hook to update niche notes or tags.
 */
export function useUpdateNiche() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, notes, tags }: { id: string, notes?: string, tags?: string[] }) => {
            const { data } = await axios.patch(`/api/saved/${id}`, { notes, tags });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved', 'overview'] });
            queryClient.invalidateQueries({ queryKey: ['saved', 'timeline'] });
        }
    });
}
