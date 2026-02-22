'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import type { ClusterSummary } from '../types'

interface EmergingOpportunitiesPanelProps {
    clusters: ClusterSummary[]
    isLoading: boolean
}

function EmergingItemSkeleton() {
    return (
        <Card className="bg-card/40 border-border/50">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
                <Skeleton className="h-9 w-full rounded-lg" />
            </CardContent>
        </Card>
    )
}

export function EmergingOpportunitiesPanel({ clusters, isLoading }: EmergingOpportunitiesPanelProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-48" />
                </div>
                {[1, 2, 3].map(i => <EmergingItemSkeleton key={i} />)}
            </div>
        )
    }

    if (clusters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <TrendingUp className="w-10 h-10 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No emerging opportunities detected yet</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Check back soon — trends are monitored in real time</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-foreground">
                    {clusters.length} Emerging Opportunit{clusters.length !== 1 ? 'ies' : 'y'} Detected
                </h2>
                <span className="text-[10px] text-muted-foreground/50 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400/70 px-2 py-0.5 rounded-full">
                    Likely trending in 24h
                </span>
            </div>

            <div className="space-y-3">
                {clusters.map(cluster => {
                    const probability = Math.round(cluster.velocityScore * 100)
                    return (
                        <Card
                            key={cluster.clusterId}
                            className="bg-card/60 border-border/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-200 group"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors mb-1 truncate">
                                            {cluster.topic}
                                        </h3>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-muted/50 text-muted-foreground border border-border/50">
                                            {cluster.category}
                                        </span>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-xs font-bold text-emerald-400">{probability}%</div>
                                        <div className="text-[9px] text-muted-foreground/50">trending prob.</div>
                                    </div>
                                </div>

                                {/* Trending probability bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] text-muted-foreground/60">Trending Probability</span>
                                        <span className="text-[10px] font-bold text-emerald-400">{probability}%</span>
                                    </div>
                                    <Progress
                                        value={probability}
                                        className="h-1.5 bg-muted/40 [&>div]:bg-gradient-to-r [&>div]:from-emerald-600 [&>div]:to-emerald-400"
                                    />
                                </div>

                                {/* Content opportunity */}
                                <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3 line-clamp-2">
                                    {cluster.contentOpportunity}
                                </p>

                                {/* CTA */}
                                <Link
                                    href={`/trends?keyword=${encodeURIComponent(cluster.topic)}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors group/link"
                                >
                                    Analyze This Niche
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
                                </Link>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
