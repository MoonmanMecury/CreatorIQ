'use client'

import { useApiKeys } from '../../features/conductor/hooks/useApiKeys'
import { Badge } from '@/components/ui/badge'
import { Bot, Zap, Sparkles, BrainCircuit } from 'lucide-react'
import { motion } from 'framer-motion'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function AiStatusBadge() {
    const { hasAnyKey, keys } = useApiKeys()

    if (!hasAnyKey) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Badge variant="outline" className="opacity-50 grayscale gap-1">
                            <Bot className="w-3 h-3" />
                            AI Off
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add an LLM API key in settings to enable enhanced insights.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    // Use distinct color identities based on the first available provider
    const primaryKey = keys[0]
    const config = {
        anthropic: { color: 'bg-[#da7756]', icon: Sparkles, label: 'Claude' },
        openai: { color: 'bg-[#10a37f]', icon: Zap, label: 'GPT-4' },
        google: { color: 'bg-[#4285f4]', icon: BrainCircuit, label: 'Gemini' },
        xai: { color: 'bg-white text-black', icon: Bot, label: 'Grok' }
    }[primaryKey.provider] || { color: 'bg-primary', icon: Sparkles, label: 'AI Active' }

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center"
        >
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Badge className={`${config.color} hover:${config.color} border-none text-white gap-1.5 px-2.5 py-0.5 shadow-lg shadow-primary/10`}>
                            <config.icon className="w-3 h-3 fill-current" />
                            <span className="font-medium text-[10px] tracking-wide uppercase">{config.label} Active</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Your AI Conductor is leveraging {primaryKey.provider_display_name} ({primaryKey.model_display_name})</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </motion.div>
    )
}
