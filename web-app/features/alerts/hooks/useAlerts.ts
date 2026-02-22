import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertsState, UserAlertPreferences, AlertStatus } from "../types";

const ALERTS_POLL_INTERVAL_MS = 60000;

/**
 * Hook to manage notification state and live polling of unread alerts.
 */
export function useAlerts() {
    const queryClient = useQueryClient();

    const { data, isLoading, isError, refetch } = useQuery<AlertsState>({
        queryKey: ['alerts'],
        queryFn: async () => {
            const response = await axios.get('/api/alerts');
            return response.data;
        },
        staleTime: 60000,
        refetchInterval: ALERTS_POLL_INTERVAL_MS
    });

    return {
        alerts: data?.alerts || [],
        unreadCount: data?.unreadCount || 0,
        lastCheckedAt: data?.lastCheckedAt || null,
        isLoading,
        isError,
        refetch
    };
}

/**
 * Hook to fetch all alerts with filtering and pagination.
 */
export function useAlertHistory(options?: { status?: AlertStatus, limit?: number }) {
    return useQuery({
        queryKey: ['alerts', 'history', options],
        queryFn: async () => {
            const response = await axios.get('/api/alerts', {
                params: { mode: 'all', ...options }
            });
            return response.data.alerts;
        },
        staleTime: 30000
    });
}

/**
 * Mutation to mark specific alerts as read.
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (alertIds: string[]) => {
            await axios.post('/api/alerts/read', { alertIds });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
    });
}

/**
 * Mutation to mark ALL alerts as read.
 */
export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await axios.post('/api/alerts/read', { all: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
    });
}

/**
 * Hook to manage user alert preferences.
 */
export function useAlertPreferences() {
    const queryClient = useQueryClient();

    const { data: preferences, isLoading } = useQuery<UserAlertPreferences>({
        queryKey: ['alertPreferences'],
        queryFn: async () => {
            const response = await axios.get('/api/alerts/preferences');
            return response.data;
        },
        staleTime: 600000 // 10 minutes
    });

    const updatePreferences = useMutation({
        mutationFn: async (updates: Partial<UserAlertPreferences>) => {
            const response = await axios.put('/api/alerts/preferences', updates);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alertPreferences'] });
        }
    });

    return {
        preferences,
        isLoading,
        updatePreferences: updatePreferences.mutate
    };
}
