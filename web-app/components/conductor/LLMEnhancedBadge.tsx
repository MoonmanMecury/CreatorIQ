'use client'

import { Sparkles } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface LLMEnhancedBadgeProps {
    provider?: string
    model?: string
    className?: string
}

export function LLMEnhancedBadge({ provider, model, className }: LLMEnhancedBadgeProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`inline-flex items-center gap-1 cursor-help group transition-all ${className}`}>
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
                            <Sparkles className="w-3 h-3 text-primary group-hover:text-purple-400 transition-colors" />
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-black/95 border-primary/30 text-xs py-1.5 px-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-primary">LLM Enhanced</span>
                        {provider && (
                            <span className="opacity-70 text-[10px]">
                                Powered by {provider} {model && `(${model})`}
                            </span>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
