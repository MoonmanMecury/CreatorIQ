import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ConductorFeature } from '../types'
import { PROMPTS } from '../prompts'

const supabase = createClient()

export function useStreamingConductor() {
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const startStream = async (feature: ConductorFeature, context: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    abortRef.current = new AbortController()
    setStreamedText('')
    setIsStreaming(true)

    try {
      const promptConfig = PROMPTS[feature]
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5087'}/api/conductor/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          feature,
          systemPrompt: promptConfig.system,
          userMessage: promptConfig.userMessage(context)
        }),
        signal: abortRef.current.signal
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        // Parse SSE format: "data: {token}\n\n"
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const token = line.slice(6)
            if (token === '[DONE]') break
            setStreamedText(prev => prev + token)
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Streaming failed:', error)
      }
    } finally {
      setIsStreaming(false)
    }
  }

  const cancelStream = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  return { streamedText, isStreaming, startStream, cancelStream }
}
