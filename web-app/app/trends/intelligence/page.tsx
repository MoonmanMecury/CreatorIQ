'use client'

import { Activity } from 'lucide-react'
import { useTrendSynthesizer, useTriggerRefresh } from '@/features/trends/synthesizer/hooks/useTrendSynthesizer'
import { BreakingNowBanner } from '@/features/trends/synthesizer/components/BreakingNowBanner'
import { TrendSynthesizerDashboard } from '@/features/trends/synthesizer/components/TrendSynthesizerDashboard'

export default function TrendIntelligencePage() {
    const { data, isLoading, isError, error } = useTrendSynthesizer({ autoRefresh: true })
    const { refreshNow, isRefreshing } = useTriggerRefresh()

    const isPending = isLoading || isRefreshing

    return (
        <div className="min-h-screen bg-background">
            {/* ── Breaking Now Banner (full width, above everything) ── */}
            <BreakingNowBanner clusters={data?.breakingNow ?? []} isLoading={isPending} />

            {/* ── Main Page Content ── */}
            <div className="container mx-auto max-w-7xl px-4 py-6">

                {/* Page Title */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            Trend Intelligence
                        </h1>
                        <p className="text-sm text-muted-foreground/70">
                            Real-time synthesis of news and YouTube trends for creators
                        </p>
                    </div>
                </div>

                {/* Error state */}
                {isError && !isLoading && (
                    <div className="mb-4 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive/80">
                        <strong>Pipeline error:</strong> {error?.message ?? 'Unknown error'}
                        {' — '}
                        <button
                            onClick={refreshNow}
                            className="underline underline-offset-2 hover:text-destructive transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty / first load state */}
                {isPending && !data && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="relative mb-6">
                            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Activity className="w-8 h-8 text-primary animate-pulse" />
                            </div>
                            <div className="absolute -inset-2 rounded-full border border-primary/10 animate-ping opacity-30" />
                        </div>
                        <p className="text-lg font-bold text-foreground mb-2">Running trend analysis…</p>
                        <p className="text-sm text-muted-foreground/60">
                            Fetching news feeds • Analysing YouTube signals • Building clusters
                        </p>
                    </div>
                )}

                {/* Dashboard */}
                {(data || (isPending && data)) && (
                    <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
                        <TrendSynthesizerDashboard
                            data={data}
                            isLoading={isPending}
                            onRefresh={refreshNow}
                        />
                    </div>
                )}

                {/* Data available even during refresh — show dashboard */}
                {!data && !isPending && !isError && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Activity className="w-10 h-10 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-medium">No data available</p>
                        <button
                            onClick={refreshNow}
                            className="mt-3 text-sm text-primary hover:underline"
                        >
                            Run pipeline now
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
