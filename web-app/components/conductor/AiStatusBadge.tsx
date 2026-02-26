"use client"

import Link from 'next/link'
import { BrainIcon, SparklesIcon } from 'hugeicons-react'
import { useApiKeys, useConductorPreferences } from '@/features/conductor/hooks/useApiKeys'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function AiStatusBadge() {
  const { hasAnyKey, keys } = useApiKeys()
  const { preferences } = useConductorPreferences()

  if (!hasAnyKey) {
    return (
      <Link href="/settings/ai">
        <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-muted text-muted-foreground">
          <BrainIcon className="h-3.5 w-3.5" />
          AI Off
        </Badge>
      </Link>
    )
  }

  if (!preferences?.activeProvider) {
    return (
      <Link href="/settings/ai">
        <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-muted text-amber-500 border-amber-500/50">
          <BrainIcon className="h-3.5 w-3.5" />
          AI Setup
        </Badge>
      </Link>
    )
  }

  const provider = preferences.activeProvider
  const keyInfo = keys.find(k => k.provider === provider)

  const providerStyles: Record<string, string> = {
    anthropic: "text-purple-500 border-purple-500/50 bg-purple-500/10",
    openai: "text-emerald-500 border-emerald-500/50 bg-emerald-500/10",
    google: "text-blue-500 border-blue-500/50 bg-blue-500/10",
    xai: "text-slate-200 border-slate-200/50 bg-slate-200/10",
  }

  const providerNames: Record<string, string> = {
    anthropic: "Claude",
    openai: "GPT",
    google: "Gemini",
    xai: "Grok",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/settings/ai">
            <Badge className={cn("gap-1.5 cursor-pointer hover:opacity-80 transition-opacity", providerStyles[provider])}>
              <SparklesIcon className="h-3.5 w-3.5 fill-current" />
              {providerNames[provider] || provider}
            </Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Active: {keyInfo?.modelDisplayName || preferences.activeModel} — Change in Settings</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
