'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import type { ClusterSummary } from '../types'

// ─── Breaking Badge CSS ────────────────────────────────────────────────────────
// Pulse animation for the "BREAKING" label is implemented via Tailwind animate-pulse
// combined with a red ring, matching the Bloomberg terminal aesthetic.

interface BreakingNowBannerProps {
    clusters: ClusterSummary[]
    isLoading: boolean
}

function BreakingCardSkeleton() {
    return (
        <div className="flex-shrink-0 w-56 rounded-xl border border-border/50 bg-card/40 p-3 space-y-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
        </div>
    )
}

export function BreakingNowBanner({ clusters, isLoading }: BreakingNowBannerProps) {
    if (isLoading) {
        return (
            <div className="w-full border-b border-red-500/20 bg-red-500/5 py-3 px-4">
                <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex gap-3">
                    {[1, 2, 3].map(i => <BreakingCardSkeleton key={i} />)}
                </div>
            </div>
        )
    }

    if (clusters.length === 0) {
        return (
            <div className="w-full border-b border-border/30 bg-muted/10 py-3 px-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    No breaking stories in the last 6 hours
                </div>
            </div>
        )
    }

    return (
        <div className="w-full border-b border-red-500/20 bg-gradient-to-r from-red-950/30 via-red-950/10 to-transparent py-3 px-4">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-2.5">
                {/* Pulsing BREAKING label */}
                <div className="relative flex items-center gap-1.5">
                    <span className="absolute -left-0.5 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-60" />
                    <span className="relative w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 animate-pulse">
                        Breaking Now
                    </span>
                </div>
                <span className="text-[10px] text-muted-foreground/50">
                    {clusters.length} stor{clusters.length !== 1 ? 'ies' : 'y'} · last 6 hours
                </span>
            </div>

            {/* Horizontal scroll row */}
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-3 pb-2">
                    {clusters.map(cluster => (
                        <Link
                            key={cluster.clusterId}
                            href={`/trends?keyword=${encodeURIComponent(cluster.topic)}`}
                            className="flex-shrink-0 w-56 rounded-xl border border-red-500/20 bg-card/60 backdrop-blur-sm p-3 hover:border-red-400/40 hover:bg-red-500/5 transition-all duration-200 group"
                        >
                            {/* BREAKING badge */}
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                                    ■ Breaking
                                </span>
                                <span className="text-[9px] text-muted-foreground/50 flex-shrink-0">
                                    {cluster.firstSeenHoursAgo.toFixed(1)}h ago
                                </span>
                            </div>

                            {/* Topic */}
                            <p className="text-xs font-bold text-foreground/90 leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                                {cluster.topic}
                            </p>

                            {/* Category badge */}
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-border/30">
                                {cluster.category}
                            </span>
                        </Link>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}
