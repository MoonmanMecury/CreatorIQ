"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CheckCircle2Icon,
    AlertTriangleIcon,
    LightbulbIcon,
    ShieldAlertIcon
} from "lucide-react";

interface Props {
    opportunities: string[];
    risks: string[];
    isLoading: boolean;
}

export function OpportunitiesRisksPanel({ opportunities, risks, isLoading }: Props) {
    if (isLoading) {
        return (
            <Card className="bg-card/50 border-border/50 overflow-hidden">
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-6 w-40 mb-2" />
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
                        </div>
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-6 w-32 mb-2" />
                            {[1, 2].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                    {/* Opportunities Column */}
                    <div className="p-6 space-y-5 bg-emerald-500/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                                <LightbulbIcon size={16} />
                            </div>
                            <h3 className="text-lg font-black tracking-tight">Top Opportunities</h3>
                        </div>

                        <ul className="space-y-4">
                            {opportunities.map((opp, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle2Icon size={16} className="text-emerald-500 mt-1 shrink-0" />
                                    <span className="text-sm leading-relaxed">{opp}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Risks Column */}
                    <div className="p-6 space-y-5 bg-red-500/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-md bg-red-500/10 text-red-500">
                                <ShieldAlertIcon size={16} />
                            </div>
                            <h3 className="text-lg font-black tracking-tight">Risks & Caveats</h3>
                        </div>

                        <ul className="space-y-4">
                            {risks.map((risk, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <AlertTriangleIcon size={16} className="text-red-400 mt-1 shrink-0" />
                                    <span className="text-sm text-muted-foreground leading-relaxed">{risk}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
