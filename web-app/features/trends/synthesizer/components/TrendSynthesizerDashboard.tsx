'use client'

import { useState } from 'react'
import { RefreshCw, Newspaper, Youtube, Layers, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { TrendClusterCard, TrendClusterCardSkeleton } from './TrendClusterCard'
import { BreakingNowBanner } from './BreakingNowBanner'
import { EmergingOpportunitiesPanel } from './EmergingOpportunitiesPanel'
import { CategoryFilterTabs } from './CategoryFilterTabs'
import type { SynthesisResult, TrendCategory } from '../types'
import { LLMEnhancedBadge } from '@/components/conductor/LLMEnhancedBadge'

// ─── Stat Chip ─────────────────────────────────────────────────────────────────

interface StatChipProps {
    icon: React.ReactNode
    label: string
    value: string | number
    valueColor?: string
}

function StatChip({ icon, label, value, valueColor }: StatChipProps) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/30">
            <span className="text-muted-foreground">{icon}</span>
            <div>
                <div className={`text-sm font-bold font-mono ${valueColor ?? 'text-foreground'}`}>{value}</div>
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">{label}</div>
            </div>
        </div>
    )
}

// ─── Processing Time Color ────────────────────────────────────────────────────

function processingTimeColor(ms: number): string {
    if (ms < 3000) return 'text-emerald-400'
    if (ms < 8000) return 'text-amber-400'
    return 'text-red-400'
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface TrendSynthesizerDashboardProps {
    data: SynthesisResult | undefined
    isLoading: boolean
    onRefresh: () => void
}

export function TrendSynthesizerDashboard({ data, isLoading, onRefresh }: TrendSynthesizerDashboardProps) {
    const [activeCategory, setActiveCategory] = useState<TrendCategory | 'ALL'>('ALL')

    // Build cluster counts for category tabs
    const clusterCounts: Record<string, number> = {}
    if (data) {
        for (const [cat, clusters] of Object.entries(data.byCategory)) {
            clusterCounts[cat] = clusters.length
        }
    }

    // Get clusters for "By Category" tab
    const categoryFilteredClusters = data
        ? (activeCategory === 'ALL'
            ? data.topClusters
            : (data.byCategory[activeCategory] ?? []))
        : []

    const llm = (data as any)?._llm

    return (
        <div className="w-full">
            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4 mb-4 px-4 pt-4">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live Trend Intelligence
                        </h1>
                        {data?.generatedAt && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                                Last updated {new Date(data.generatedAt).toLocaleTimeString()}
                            </p>
                        )}
                        {isLoading && <Skeleton className="h-3 w-32 mt-1" />}
                    </div>
                    {llm?.enhanced && (
                        <LLMEnhancedBadge
                            provider={llm.provider}
                            model={llm.model}
                        />
                    )}
                </div>

                <Button
                    onClick={onRefresh}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="gap-2 font-mono text-xs border-border/50 hover:border-primary/40"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* ── Pipeline Stats Bar ── */}
            <div className="flex flex-wrap gap-2 px-4 pb-4">
                {isLoading ? (
                    <>
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-32 rounded-lg" />)}
                    </>
                ) : data ? (
                    <>
                        <StatChip
                            icon={<Newspaper className="w-4 h-4" />}
                            label="News Items"
                            value={data.pipelineStats.newsItemsFetched}
                        />
                        <StatChip
                            icon={<Youtube className="w-4 h-4" />}
                            label="YouTube Items"
                            value={data.pipelineStats.youtubeItemsFetched}
                        />
                        <StatChip
                            icon={<Layers className="w-4 h-4" />}
                            label="Clusters"
                            value={data.pipelineStats.clustersFormed}
                        />
                        <StatChip
                            icon={<Clock className="w-4 h-4" />}
                            label="Process Time"
                            value={`${data.pipelineStats.processingTimeMs}ms`}
                            valueColor={processingTimeColor(data.pipelineStats.processingTimeMs)}
                        />
                    </>
                ) : null}
            </div>

            <Separator className="opacity-30" />

            {/* ── Tabs ── */}
            <Tabs defaultValue="top" className="w-full">
                <div className="px-4 pt-3">
                    <TabsList className="bg-muted/20 border border-border/30 font-mono text-xs h-8">
                        <TabsTrigger value="top" className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                            Top Trends
                        </TabsTrigger>
                        <TabsTrigger value="breaking" className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                            Breaking Now
                            {data && data.breakingNow.length > 0 && (
                                <span className="ml-1.5 text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/30">
                                    {data.breakingNow.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="emerging" className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                            Emerging
                            {data && data.emergingOpportunities.length > 0 && (
                                <span className="ml-1.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                                    {data.emergingOpportunities.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="category" className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                            By Category
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Top Trends */}
                <TabsContent value="top" className="px-4 py-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => <TrendClusterCardSkeleton key={i} />)}
                        </div>
                    ) : (data?.topClusters?.length ?? 0) > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data!.topClusters.map(cluster => (
                                <TrendClusterCard key={cluster.clusterId} cluster={cluster} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            No trend clusters found. Try refreshing.
                        </div>
                    )}
                </TabsContent>

                {/* Breaking Now */}
                <TabsContent value="breaking" className="px-4 py-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 2 }).map((_, i) => <TrendClusterCardSkeleton key={i} />)}
                        </div>
                    ) : (data?.breakingNow?.length ?? 0) > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data!.breakingNow.map(cluster => (
                                <TrendClusterCard key={cluster.clusterId} cluster={cluster} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-16 text-center">
                            <span className="text-3xl mb-3">📡</span>
                            <p className="text-muted-foreground font-medium">No breaking stories in the last 6 hours</p>
                            <p className="text-xs text-muted-foreground/50 mt-1">Stories with score &gt; 70 and age &lt; 6h appear here</p>
                        </div>
                    )}
                </TabsContent>

                {/* Emerging */}
                <TabsContent value="emerging" className="px-4 py-4">
                    <EmergingOpportunitiesPanel
                        clusters={data?.emergingOpportunities ?? []}
                        isLoading={isLoading}
                    />
                </TabsContent>

                {/* By Category */}
                <TabsContent value="category" className="px-4 py-4 space-y-4">
                    <CategoryFilterTabs
                        activeCategory={activeCategory}
                        onChange={setActiveCategory}
                        clusterCounts={clusterCounts}
                    />
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => <TrendClusterCardSkeleton key={i} />)}
                        </div>
                    ) : categoryFilteredClusters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categoryFilteredClusters.map(cluster => (
                                <TrendClusterCard key={cluster.clusterId} cluster={cluster} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            No clusters in {activeCategory === 'ALL' ? 'any category' : activeCategory} yet.
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
