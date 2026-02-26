'use client'

import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Newspaper, Youtube, Lightbulb, Zap, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ClusterSummary, TrendMomentum } from '../types'
import { LLMEnhancedBadge } from '@/components/conductor/LLMEnhancedBadge'
import { LLMProvider } from '@/features/conductor/types'

// ─── Momentum Badge ────────────────────────────────────────────────────────────

function MomentumBadge({ momentum }: { momentum: TrendMomentum }) {
    const config = {
        EMERGING: {
            label: 'Emerging',
            className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse',
        },
        RISING: {
            label: 'Rising',
            className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        },
        PEAK: {
            label: 'Peak',
            className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        DECLINING: {
            label: 'Declining',
            className: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        },
    }

    const { label, className } = config[momentum]
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${className}`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {label}
        </span>
    )
}

// ─── Trend Score Ring ─────────────────────────────────────────────────────────

function TrendScoreRing({ score }: { score: number }) {
    const radius = 22
    const circumference = 2 * Math.PI * radius
    const filled = (score / 100) * circumference
    const scoreColor = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#64748b'

    return (
        <div className="relative flex-shrink-0 w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                <circle
                    cx="28" cy="28" r={radius}
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="3"
                    strokeDasharray={`${filled} ${circumference - filled}`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: scoreColor }}>{score}</span>
            </div>
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function TrendClusterCardSkeleton() {
    return (
        <Card className="bg-card/50 border-border/50 h-full">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                    <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <div className="flex gap-2 mt-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-16 w-full rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>
            </CardContent>
        </Card>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface TrendClusterCardProps {
    cluster: ClusterSummary
    isLoading?: boolean
    isEnhanced?: boolean
    llmProvider?: string
    llmModel?: string
}

export function TrendClusterCard({ cluster, isLoading, isEnhanced, llmProvider, llmModel }: TrendClusterCardProps) {
    if (isLoading) return <TrendClusterCardSkeleton />

    const categoryColors: Record<string, string> = {
        TECHNOLOGY: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
        BUSINESS: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        POLITICS: 'bg-red-500/15 text-red-400 border-red-500/30',
        HEALTH: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
        SCIENCE: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        ENTERTAINMENT: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        SPORTS: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
        GENERAL: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    }

    return (
        <Card className="bg-card/60 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 flex flex-col h-full group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${categoryColors[cluster.category] ?? categoryColors.GENERAL}`}>
                                {cluster.category}
                            </span>
                            <MomentumBadge momentum={cluster.momentum} />
                            {cluster.trendingIn24h && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-orange-500/15 text-orange-400 border-orange-500/30">
                                    🔥 Likely trending in 24h
                                </span>
                            )}
                        </div>

                        {/* Topic */}
                        <h3 className="font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors truncate flex items-center gap-2">
                            {cluster.topic}
                            <LLMEnhancedBadge
                                isEnhanced={!!isEnhanced}
                                provider={llmProvider as LLMProvider}
                                modelName={llmModel}
                            />
                        </h3>
                    </div>

                    {/* Score ring */}
                    <TrendScoreRing score={cluster.trendScore} />
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 flex-1">
                {/* Summary */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {cluster.summary}
                </p>

                {/* Why it matters */}
                <p className="text-xs text-muted-foreground/70 italic leading-relaxed">
                    {cluster.whyItMatters}
                </p>

                {/* Growth signals */}
                {cluster.growthSignals.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {cluster.growthSignals.map((signal, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-primary/8 text-primary/80 border border-primary/15"
                            >
                                <Zap className="w-2.5 h-2.5" />
                                {signal}
                            </span>
                        ))}
                    </div>
                )}

                {/* Content opportunity */}
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/8 p-3 flex gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300/90 leading-relaxed font-medium">
                        {cluster.contentOpportunity}
                    </p>
                </div>

                {/* Top items */}
                {cluster.topItems.length > 0 && (
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Top Sources</p>
                        <div className="space-y-1">
                            {cluster.topItems.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/40 transition-colors group/item"
                                >
                                    {item.source === 'NEWS' ? (
                                        <Newspaper className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    ) : (
                                        <Youtube className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium line-clamp-1 group-hover/item:text-primary transition-colors">
                                            {item.title}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/60">
                                            {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mt-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50 mt-auto pt-1 border-t border-border/30">
                    <Clock className="w-3 h-3" />
                    First detected {cluster.firstSeenHoursAgo.toFixed(0)} hrs ago
                </div>
            </CardContent>
        </Card>
    )
}
