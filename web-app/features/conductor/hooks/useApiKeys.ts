import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as client from '../apiKeyClient'
import { AddKeyRequest, LLMProvider, UpdatePreferencesRequest } from '../types'

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

  const keys = data || []
  return {
    keys,
    isLoading,
    hasAnyKey: keys.length > 0,
    hasKey: (provider: LLMProvider) => keys.some(k => k.provider === provider),
    getKey: (provider: LLMProvider) => keys.find(k => k.provider === provider)
  }
}

export function useAddApiKey() {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (req: AddKeyRequest) => client.addApiKey(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userApiKeys'] })
    }
  })
  return { addKey: mutateAsync, isAdding: isPending }
}

export function useRemoveApiKey() {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (provider: LLMProvider) => client.removeApiKey(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userApiKeys'] })
    }
  })
  return { removeKey: mutateAsync, isRemoving: isPending }
}

export function useVerifyApiKey() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ provider, rawKey, model }: { provider: LLMProvider, rawKey: string, model: string }) =>
      client.verifyApiKey(provider, rawKey, model)
  })
  return { verify: mutateAsync, isVerifying: isPending }
}

export function useConductorPreferences() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['conductorPreferences'],
    queryFn: client.getConductorPreferences
  })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (req: UpdatePreferencesRequest) => client.updateConductorPreferences(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductorPreferences'] })
    }
  })

  return {
    preferences: data,
    isLoading,
    updatePreferences: mutateAsync,
    isUpdating: isPending
  }
}
