"use client";

import { OpportunityResult } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Shield01Icon,
    LeftToRightListNumberIcon,
    ChampionIcon,
    Clock01Icon,
    ViewIcon,
    FavouriteIcon
} from "hugeicons-react";

interface CompetitionWeaknessPanelProps {
    data?: OpportunityResult;
    isLoading: boolean;
}

export function CompetitionWeaknessPanel({ data, isLoading }: CompetitionWeaknessPanelProps) {
    if (isLoading) {
        return (
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <Skeleton className="h-4 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[95%]" />
                    <div className="mt-6 flex gap-2">
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    return (
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Shield01Icon size={18} className="text-primary" />
                <CardTitle className="text-base font-semibold">Competitive Landscape</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <ul className="space-y-3">
                    {data.competitionInsights.map((insight, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                            <div className="mt-0.5 flex-shrink-0 text-primary/60">
                                <LeftToRightListNumberIcon size={14} />
                            </div>
                            <span>{insight}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <ChampionIcon size={14} className="text-blue-500" />
                        <span>Frag. Market</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <FavouriteIcon size={14} className="text-emerald-500" />
                        <span>Engagement Low</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Clock01Icon size={14} className="text-amber-500" />
                        <span>Stale Top Results</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
