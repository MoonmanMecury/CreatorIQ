import {
    LLMProvider,
    ProviderInfo,
    UserApiKeyInfo,
    AddKeyRequest,
    VerifyKeyResult,
    UserConductorPreferences,
    UpdatePreferencesRequest
} from "./types"

function getToken(): string {
    return typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
            ...options.headers,
        },
    })

    if (!response.ok) {
        if (response.status === 204) return {} as T
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
}

export async function getProviders(): Promise<ProviderInfo[]> {
    return apiFetch('/api/user/ai-keys/providers')
}

export async function getUserApiKeys(): Promise<UserApiKeyInfo[]> {
    return apiFetch('/api/user/ai-keys')
}

export async function addApiKey(request: AddKeyRequest): Promise<UserApiKeyInfo> {
    return apiFetch('/api/user/ai-keys', {
        method: 'POST',
        body: JSON.stringify(request)
    })
}

export async function removeApiKey(provider: LLMProvider): Promise<void> {
    return apiFetch(`/api/user/ai-keys/${provider}`, {
        method: 'DELETE'
    })
}

export async function verifyApiKey(provider: LLMProvider, rawKey: string, model: string): Promise<VerifyKeyResult> {
    return apiFetch(`/api/user/ai-keys/${provider}/verify`, {
        method: 'POST',
        body: JSON.stringify({ raw_key: rawKey, model })
    })
}

export async function getConductorPreferences(): Promise<UserConductorPreferences> {
    return apiFetch('/api/user/ai-keys/preferences')
}

export async function updateConductorPreferences(request: UpdatePreferencesRequest): Promise<UserConductorPreferences> {
    return apiFetch('/api/user/ai-keys/preferences', {
        method: 'PUT',
        body: JSON.stringify(request)
    })
}
