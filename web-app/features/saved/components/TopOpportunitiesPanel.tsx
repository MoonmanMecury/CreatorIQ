"use client"

import * as React from "react"
import { SavedNiche } from "../types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight01Icon } from "hugeicons-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TopOpportunitiesPanelProps {
    niches: SavedNiche[]
    isLoading: boolean
}

export function TopOpportunitiesPanel({ niches, isLoading }: TopOpportunitiesPanelProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 rounded-2xl bg-card border border-border animate-pulse" />
                ))}
            </div>
        )
    }

    if (niches.length === 0) {
        return null; // Don't show if no niches
    }

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" /> Top Opportunities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {niches.map((niche, i) => (
                    <TopCard key={niche.id} niche={niche} rank={i + 1} />
                ))}
            </div>
        </div>
    )
}

function TopCard({ niche, rank }: { niche: SavedNiche, rank: number }) {
    const medalColor = rank === 1 ? "text-amber-400" : rank === 2 ? "text-slate-300" : "text-amber-700"

    return (
        <Card className="relative overflow-hidden group hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-card to-background">
            <div className={cn(
                "absolute top-0 right-0 p-6 opacity-5 transition-transform duration-500 group-hover:scale-150 rotate-12",
                medalColor
            )}>
                <span className="text-8xl font-black">#{rank}</span>
            </div>

            <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className={cn("text-lg font-black", medalColor)}>#{rank}</span>
                        <Badge variant="outline" className="bg-primary/5 text-xs px-2 py-0 h-5 border-primary/20">
                            {niche.verdict}
                        </Badge>
                    </div>
                    <h3 className="text-xl font-bold truncate pr-8">{niche.keyword}</h3>
                </div>

                <div className="mt-6 flex items-end justify-between">
                    <div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Opportunity Score</div>
                        <div className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/40">
                            {niche.opportunityScore}
                        </div>
                    </div>

                    <Link
                        href={`/trends?keyword=${encodeURIComponent(niche.keyword)}`}
                        className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                    >
                        <ArrowRight01Icon className="h-5 w-5" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
