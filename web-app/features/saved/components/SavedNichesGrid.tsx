"use client"

import * as React from "react"
import { SavedNiche } from "../types"
import { SavedNicheCard } from "./SavedNicheCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SavedNichesGridProps {
    niches: SavedNiche[]
    isLoading: boolean
    onReanalyze: (id: string) => void
    onRemove: (id: string) => void
    onViewDetails: (id: string) => void
}

export function SavedNichesGrid({ niches, isLoading, onReanalyze, onRemove, onViewDetails }: SavedNichesGridProps) {
    const [sortBy, setSortBy] = React.useState('opportunity')
    const [filterBy, setFilterBy] = React.useState('all')

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 rounded-xl bg-card border border-border animate-pulse" />
                ))}
            </div>
        )
    }

    if (niches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed rounded-3xl border-muted-foreground/10 bg-muted/5">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">🏜️</span>
                </div>
                <h3 className="text-xl font-bold mb-2">No saved niches yet</h3>
                <p className="text-muted-foreground max-w-sm">
                    Enter a keyword on the Trends or Strategy pages and click "Save Opportunity" to start tracking your discoveries.
                </p>
            </div>
        )
    }

    const filteredAndSorted = [...niches]
        .filter(n => filterBy === 'all' || n.verdict === filterBy)
        .sort((a, b) => {
            if (sortBy === 'opportunity') return (b.opportunityScore || 0) - (a.opportunityScore || 0);
            if (sortBy === 'monetization') return (b.monetizationScore || 0) - (a.monetizationScore || 0);
            if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'refreshed') return new Date(b.lastAnalyzedAt).getTime() - new Date(a.lastAnalyzedAt).getTime();
            return 0;
        });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">My Collection</h2>
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">
                        {niches.length}
                    </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px] h-9 text-xs">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="opportunity">Best Opportunity</SelectItem>
                            <SelectItem value="monetization">Top Revenue</SelectItem>
                            <SelectItem value="recent">Recently Added</SelectItem>
                            <SelectItem value="refreshed">Recently Refreshed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterBy} onValueChange={setFilterBy}>
                        <SelectTrigger className="w-[120px] h-9 text-xs">
                            <SelectValue placeholder="Filter By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Niches</SelectItem>
                            <SelectItem value="GOLDMINE">Goldmines</SelectItem>
                            <SelectItem value="HIGH">High Pot.</SelectItem>
                            <SelectItem value="MEDIUM">Medium Pot.</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {filteredAndSorted.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground italic">
                    No niches match the selected filters.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAndSorted.map((niche) => (
                        <SavedNicheCard
                            key={niche.id}
                            niche={niche}
                            onReanalyze={onReanalyze}
                            onRemove={onRemove}
                            onViewDetails={onViewDetails}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
