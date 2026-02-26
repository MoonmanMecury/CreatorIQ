import { createClient } from '@/lib/supabase/client'
import {
  LLMProvider,
  ProviderInfo,
  UserApiKeyInfo,
  AddKeyRequest,
  VerifyKeyResult,
  UserConductorPreferences,
  UpdatePreferencesRequest
} from './types'

const supabase = createClient()
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5087'}/api/user/ai-keys`

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return session ? { 'Authorization': `Bearer ${session.access_token}` } : {}
}

export async function getProviders(): Promise<ProviderInfo[]> {
  const response = await fetch(`${API_BASE}/providers`, {
    headers: await getAuthHeader()
  })
  return response.json()
}

export async function getUserApiKeys(): Promise<UserApiKeyInfo[]> {
  const response = await fetch(API_BASE, {
    headers: await getAuthHeader()
  })
  return response.json()
}

export async function addApiKey(request: AddKeyRequest): Promise<UserApiKeyInfo> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeader())
    },
    body: JSON.stringify(request)
  })
  return response.json()
}

export async function removeApiKey(provider: LLMProvider): Promise<void> {
  await fetch(`${API_BASE}/${provider}`, {
    method: 'DELETE',
    headers: await getAuthHeader()
  })
}

export async function verifyApiKey(provider: LLMProvider, rawKey: string, model: string): Promise<VerifyKeyResult> {
  const response = await fetch(`${API_BASE}/${provider}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeader())
    },
    body: JSON.stringify({ rawKey, model })
  })
  return response.json()
}

export async function getConductorPreferences(): Promise<UserConductorPreferences> {
  const response = await fetch(`${API_BASE}/preferences`, {
    headers: await getAuthHeader()
  })
  return response.json()
}

export async function updateConductorPreferences(request: UpdatePreferencesRequest): Promise<UserConductorPreferences> {
  const response = await fetch(`${API_BASE}/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeader())
    },
    body: JSON.stringify(request)
  })
  return response.json()
}
