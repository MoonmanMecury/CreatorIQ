"use client"

import * as React from "react"
import { useSavedOverview, useUnsaveNiche, useReanalyzeNiche } from "@/features/saved/hooks/useSavedNiches"
import { useOpportunityFeed } from "@/features/saved/hooks/useOpportunityFeed"
import { TopOpportunitiesPanel } from "@/features/saved/components/TopOpportunitiesPanel"
import { SavedNichesGrid } from "@/features/saved/components/SavedNichesGrid"
import { OpportunityFeed } from "@/features/saved/components/OpportunityFeed"
import { NicheDetailDrawer } from "@/features/saved/components/NicheDetailDrawer"
import { Button } from "@/components/ui/button"
import { RocketIcon, ChartBarLineIcon, Search01Icon } from "hugeicons-react"
import Link from "next/link"

export function DashboardClient() {
    const { data: overview, isLoading: isOverviewLoading } = useSavedOverview()
    const { data: feed, isLoading: isFeedLoading } = useOpportunityFeed(50)

    const { mutate: removeNiche } = useUnsaveNiche()
    const { mutate: reanalyze, isPending: isReanalyzing } = useReanalyzeNiche()

    const [selectedNicheId, setSelectedNicheId] = React.useState<string | null>(null)

    const handleReanalyze = (id: string) => {
        const niche = overview?.savedNiches.find(n => n.id === id);
        if (!niche) return;
        reanalyze({ id, newScores: { keyword: niche.keyword } });
    }

    if (overview && overview.totalSaved === 0 && !isOverviewLoading) {
        return <EmptyDashboardState />;
    }

    return (
        <div className="container mx-auto px-6 py-12 space-y-12 max-w-7xl">
            {/* Header */}
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <RocketIcon className="h-6 w-6 text-primary" />
                    <h1 className="text-4xl font-black tracking-tighter">My Dashboard</h1>
                </div>
                <p className="text-muted-foreground font-medium flex items-center gap-4">
                    Tracked Niches: <span className="text-primary font-bold">{overview?.totalSaved || 0}</span>
                    <span className="w-1 h-1 bg-border rounded-full" />
                    Avg. Opportunity: <span className="text-emerald-500 font-bold">{overview?.averageOpportunityScore || 0}%</span>
                </p>
            </header>

            {/* Top Highlights */}
            <TopOpportunitiesPanel niches={overview?.topOpportunities || []} isLoading={isOverviewLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Main Collection */}
                <div className="lg:col-span-8">
                    <SavedNichesGrid
                        niches={overview?.savedNiches || []}
                        isLoading={isOverviewLoading}
                        onReanalyze={handleReanalyze}
                        onRemove={(id) => removeNiche(id)}
                        onViewDetails={(id) => setSelectedNicheId(id)}
                    />
                </div>

                {/* Right Sidebar Feed */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            Activity Feed
                        </h2>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase tracking-widest px-2">Mark All Read</Button>
                    </div>
                    <OpportunityFeed items={feed || []} isLoading={isFeedLoading} />
                </div>
            </div>

            {/* Detail Modal/Drawer */}
            <NicheDetailDrawer
                nicheId={selectedNicheId}
                onClose={() => setSelectedNicheId(null)}
            />
        </div>
    )
}

function EmptyDashboardState() {
    return (
        <div className="container mx-auto px-6 py-24 max-w-4xl">
            <div className="text-center space-y-8 p-12 rounded-[2rem] border-2 border-dashed border-muted-foreground/20 bg-muted/5">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                    <Search01Icon className="h-10 w-10 text-primary" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tight">Your Portfolio is Empty</h2>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Start your journey by analyzing emerging keywords. When you find a goldmine, save it to track its evolution here.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-2xl mx-auto">
                    <Link href="/trends">
                        <Button variant="outline" className="w-full h-24 flex flex-col gap-2 rounded-2xl group hover:border-primary">
                            <ChartBarLineIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">Find Trends</span>
                        </Button>
                    </Link>
                    <Link href="/strategy">
                        <Button variant="outline" className="w-full h-24 flex flex-col gap-2 rounded-2xl group hover:border-primary">
                            <RocketIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">Plan Content</span>
                        </Button>
                    </Link>
                    <Link href="/growth">
                        <Button variant="outline" className="w-full h-24 flex flex-col gap-2 rounded-2xl group hover:border-primary">
                            <Search01Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">Growth Blueprint</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
