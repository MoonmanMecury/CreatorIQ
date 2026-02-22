"use client"

import * as React from "react"
import { OpportunityFeedItem } from "../types"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
    StarIcon,
    RocketIcon,
    Alert01Icon,
    MagicWand01Icon,
    File01Icon,
    ArrowUpRight01Icon,
    ArrowDownLeft01Icon,
    FireIcon
} from "hugeicons-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OpportunityFeedProps {
    items: OpportunityFeedItem[]
    isLoading: boolean
}

export function OpportunityFeed({ items, isLoading }: OpportunityFeedProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 rounded-lg bg-card border border-border animate-pulse" />
                ))}
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg border-muted-foreground/20">
                <MagicWand01Icon className="h-8 w-8 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground">No recent activity detected. Save some niches and we'll track changes here.</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[calc(100vh-200px)] lg:h-[calc(100vh-250px)]">
            <div className="space-y-3 pr-4">
                {items.map((item) => (
                    <FeedItem key={item.id} item={item} />
                ))}
            </div>
        </ScrollArea>
    )
}

function FeedItem({ item }: { item: OpportunityFeedItem }) {
    const isBreakout = item.eventType === 'BREAKOUT'
    const isMajorChange = Math.abs(item.scoreDelta || 0) > 10

    return (
        <div className={cn(
            "group relative p-4 rounded-xl border transition-all duration-300 hover:border-primary/30 bg-card",
            item.severity === 'CRITICAL' && "border-l-4 border-l-red-500",
            item.severity === 'WARNING' && "border-l-4 border-l-amber-500",
            isBreakout && "bg-amber-500/5 border-amber-500/20 shadow-[inset_0_0_20px_-10px_rgba(245,158,11,0.2)]"
        )}>
            <div className="flex gap-4">
                <div className={cn(
                    "mt-1 p-2 rounded-lg shrink-0",
                    isBreakout ? "bg-amber-500/20 text-amber-500" : "bg-primary/5 text-primary"
                )}>
                    <EventTypeIcon type={item.eventType} delta={item.scoreDelta} />
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-2">
                        <Link
                            href={`/trends?keyword=${encodeURIComponent(item.keyword)}`}
                            className="text-xs font-mono font-bold text-primary hover:underline truncate"
                        >
                            {item.keyword}
                        </Link>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(item.createdAt))} ago
                        </span>
                    </div>

                    <h4 className="text-sm font-bold leading-none tracking-tight">
                        {item.title}
                        {isBreakout && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-widest animate-pulse">
                                <span className="h-1 w-1 bg-amber-500 rounded-full" /> Breakout
                            </span>
                        )}
                    </h4>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                        {item.description}
                    </p>

                    {item.scoreDelta !== null && (
                        <div className={cn(
                            "inline-flex items-center gap-1 text-xs font-bold pt-1",
                            item.scoreDelta > 0 ? "text-emerald-500" : "text-red-500"
                        )}>
                            {item.scoreDelta > 0 ? <ArrowUpRight01Icon size={14} /> : <ArrowDownLeft01Icon size={14} />}
                            {item.scoreDelta > 0 ? "+" : ""}{item.scoreDelta.toFixed(1)} points
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function EventTypeIcon({ type, delta }: { type: string, delta: number | null }) {
    switch (type) {
        case 'SAVED': return <StarIcon size={16} />
        case 'BREAKOUT': return <FireIcon size={16} />
        case 'COMPETITION_ALERT': return <Alert01Icon size={16} />
        case 'REANALYZED': return <MagicWand01Icon size={16} />
        case 'NOTE_ADDED': return <File01Icon size={16} />
        case 'SCORE_CHANGE':
            return delta && delta > 0 ? <RocketIcon size={16} /> : <MagicWand01Icon size={16} />
        default: return <MagicWand01Icon size={16} />
    }
}
