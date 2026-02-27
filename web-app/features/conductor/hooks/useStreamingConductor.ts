import { useState, useRef } from 'react'
import { ConductorFeature } from '../types'

function getToken(): string {
    return typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
}

export function useStreamingConductor() {
    const [streamedText, setStreamedText] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const abortRef = useRef<AbortController | null>(null)

    const startStream = async (feature: ConductorFeature, context: Record<string, unknown>) => {
        abortRef.current = new AbortController()
        setStreamedText('')
        setIsStreaming(true)

        try {
            const response = await fetch('/api/conductor/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ feature, context }),
                signal: abortRef.current.signal
            })

            if (!response.ok) {
                setIsStreaming(false)
                return
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            while (reader) {
                const { done, value } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value)

                // Parse SSE format: "data: {token}\n\n"
                const tokens = chunk.split('\n')
                    .filter(l => l.startsWith('data: '))
                    .map(l => l.slice(6))

                tokens.forEach(t => {
                    if (t !== '[DONE]' && t !== '') {
                        setStreamedText(prev => prev + t)
                    }
                })
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('[Conductor] Streaming error', err)
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
