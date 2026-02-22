"use client";

import { useEffect, useState } from "react";
import { MonetizationScoreBreakdown } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BarChart3Icon } from "lucide-react";

interface Props {
    breakdown: MonetizationScoreBreakdown | undefined;
    isLoading: boolean;
}

const metrics = [
    { key: "adDemand", label: "Ad Demand" },
    { key: "audienceValue", label: "Audience Value" },
    { key: "revenuePathScore", label: "Revenue Path Score" },
    { key: "cpmPotential", label: "CPM Potential" },
    { key: "marketMaturityScore", label: "Market Maturity" },
] as const;

export function MonetizationBreakdownPanel({ breakdown, isLoading }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (isLoading) {
        return (
            <Card className="bg-card/50 border-border/50 h-full">
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-full rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!breakdown) return null;

    return (
        <Card className="bg-card/50 border-border/50 h-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <BarChart3Icon size={16} className="text-primary" />
                    Score Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {metrics.map((metric, idx) => {
                    const value = breakdown[metric.key as keyof MonetizationScoreBreakdown] as number;
                    const barColor = value > 65
                        ? "bg-emerald-500"
                        : value >= 40
                            ? "bg-amber-500"
                            : "bg-red-500";

                    return (
                        <div key={metric.key} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                                <span>{metric.label}</span>
                                <span className="text-foreground">{Math.round(value)}</span>
                            </div>
                            <div className="relative h-2.5 w-full bg-muted rounded-md overflow-hidden">
                                <div
                                    className={cn(
                                        "absolute inset-y-0 left-0 transition-all duration-[1500ms] ease-out",
                                        barColor,
                                        !mounted ? "w-0" : ""
                                    )}
                                    style={{
                                        width: mounted ? `${value}%` : "0%",
                                        transitionDelay: `${idx * 80}ms`
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
