"use client"

import * as React from "react"
import { TimelineEntry } from "../services/getTimeline"
import { format } from "date-fns"
import { cn } from "@/lib/utils"


interface ActivityTimelineProps {
    entries: TimelineEntry[]
    isLoading: boolean
}

export function ActivityTimeline({ entries, isLoading }: ActivityTimelineProps) {
    if (isLoading) {
        return (
            <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-1 bg-muted shrink-0 rounded-full" />
                        <div className="space-y-2 flex-1 pt-2">
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                            <div className="h-10 w-full bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (entries.length === 0) {
        return (
            <div className="text-center py-8 text-sm text-muted-foreground italic">
                No activity history found for this niche.
            </div>
        )
    }

    return (
        <div className="relative space-y-0.5">
            {/* Thread line */}
            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-border z-0" />

            {entries.map((entry, i) => (
                <div key={i} className="relative pl-6 pb-6 group z-10">
                    {/* Node */}
                    <div className={cn(
                        "absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-background ring-4 ring-background transition-transform duration-300 group-hover:scale-125",
                        entry.type === 'EVENT' ? getSeverityColor(entry.eventData?.severity) : "bg-muted-foreground/30"
                    )} />

                    <div className="space-y-1">
                        <div className="flex justify-between items-baseline gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {format(new Date(entry.date), "MMM d, yyyy · h:mm a")}
                            </span>
                            <Badge type={entry.type} />
                        </div>
                        <h5 className="text-sm font-bold tracking-tight leading-none">{entry.label}</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed italic pr-4">
                            {entry.description}
                        </p>

                        {entry.type === 'SCORE_SNAPSHOT' && entry.scoreData && (
                            <div className="flex gap-2 pt-1">
                                <ScoreMiniPill label="Opp" value={entry.scoreData.opportunityScore} />
                                <ScoreMiniPill label="Mon" value={entry.scoreData.monetizationScore} />
                                <ScoreMiniPill label="Grw" value={entry.scoreData.growthScore} />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

function getSeverityColor(severity: string | undefined): string {
    switch (severity) {
        case 'CRITICAL': return "bg-red-500"
        case 'WARNING': return "bg-amber-500"
        default: return "bg-primary"
    }
}

function Badge({ type }: { type: string }) {
    return (
        <span className={cn(
            "text-[9px] px-1.5 py-0.5 rounded-sm font-bold border",
            type === 'EVENT' ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
        )}>
            {type === 'EVENT' ? 'EVENT' : 'SNAPSHOT'}
        </span>
    )
}

function ScoreMiniPill({ label, value }: { label: string, value: number | null }) {
    return (
        <span className="flex items-center gap-1 text-[9px] bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
            <span className="opacity-50 font-bold">{label}</span>
            <span className="font-mono">{value}</span>
        </span>
    )
}
