import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as client from '../apiKeyClient'
import { LLMProvider, AddKeyRequest, UpdatePreferencesRequest } from '../types'
import { toast } from 'sonner'

export function useProviders() {
    const { data, isLoading } = useQuery({
        queryKey: ['llmProviders'],
        queryFn: client.getProviders
    })
    return { providers: data || [], isLoading }
}

export function useApiKeys() {
    const { data, isLoading } = useQuery({
        queryKey: ['userApiKeys'],
        queryFn: client.getUserApiKeys
    })

    return {
        keys: data || [],
        isLoading,
        hasAnyKey: (data || []).length > 0,
        hasKey: (provider: LLMProvider) => (data || []).some(k => k.provider === provider),
        getKey: (provider: LLMProvider) => (data || []).find(k => k.provider === provider)
    }
}

export function useAddKey() {
    const queryClient = useQueryClient()
    const { mutateAsync, isPending } = useMutation({
        mutationFn: client.addApiKey,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userApiKeys'] })
            toast.success('API key added successfully')
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to add API key')
        }
    })
    return { addKey: mutateAsync, isAdding: isPending }
}

export function useRemoveKey() {
    const queryClient = useQueryClient()
    const { mutateAsync, isPending } = useMutation({
        mutationFn: client.removeApiKey,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userApiKeys'] })
            toast.success('API key removed')
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to remove API key')
        }
    })
    return { removeKey: mutateAsync, isRemoving: isPending }
}

export function useVerifyKey() {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (args: { provider: LLMProvider, raw_key: string, model: string }) =>
            client.verifyApiKey(args.provider, args.raw_key, args.model),
        onSuccess: (res) => {
            if (res.is_valid) {
                toast.success(`Key verified successfully (${res.latency_ms}ms)`)
            } else {
                toast.error(res.error_message || 'Verification failed')
            }
        }
    })
    return {
        verify: (provider: LLMProvider, raw_key: string, model: string) => mutateAsync({ provider, raw_key, model }),
        isVerifying: isPending
    }
}

export function useConductorPreferences() {
    const queryClient = useQueryClient()
    const { data, isLoading } = useQuery({
        queryKey: ['conductorPreferences'],
        queryFn: client.getConductorPreferences,
        retry: false
    })

    const { mutateAsync, isPending } = useMutation({
        mutationFn: client.updateConductorPreferences,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conductorPreferences'] })
            toast.success('AI preferences updated')
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to update preferences')
        }
    })

    return {
        preferences: data,
        isLoading,
        updatePreferences: (req: UpdatePreferencesRequest) => mutateAsync(req),
        isUpdating: isPending
    }
}
