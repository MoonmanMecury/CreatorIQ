"use client";

import { useEffect, useState } from "react";
import { MonetizationInsights, MonetizationVerdict } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cpmTierLabel } from "../cpmEstimate";
import { maturityLabel } from "../maturity";
import { cn } from "@/lib/utils";
import { CoinsIcon } from "lucide-react";

interface Props {
    data: MonetizationInsights | undefined;
    isLoading: boolean;
}

const verdictColors: Record<MonetizationVerdict, string> = {
    POOR: "bg-red-500/10 text-red-500 border-red-500/20",
    WEAK: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    VIABLE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    STRONG: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    ELITE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-shimmer"
};

export function MonetizationScoreCard({ data, isLoading }: Props) {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        if (data?.monetizationScore) {
            let start = 0;
            const end = data.monetizationScore;
            const duration = 1000;
            const stepTime = 10;
            const increment = end / (duration / stepTime);

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setDisplayScore(end);
                    clearInterval(timer);
                } else {
                    setDisplayScore(Math.floor(start));
                }
            }, stepTime);
            return () => clearInterval(timer);
        }
    }, [data?.monetizationScore]);

    if (isLoading) {
        return (
            <Card className="bg-card/50 border-border/50 overflow-hidden">
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10 space-y-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const isElite = data.verdict === 'ELITE';

    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden relative group">
            {isElite && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50" />
            )}

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CoinsIcon size={16} className="text-primary" />
                    Monetization Potential
                </CardTitle>
                <Badge variant="outline" className={cn("font-bold text-xs px-2 py-0.5", verdictColors[data.verdict])}>
                    {data.verdictLabel}
                </Badge>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <div className="relative mb-6">
                    <span className="text-7xl font-black tracking-tighter bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
                        {displayScore}
                    </span>
                    <span className="absolute -top-1 -right-4 text-2xl font-black text-muted-foreground/30">/100</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    <Badge variant="secondary" className="bg-secondary/50 text-[10px] uppercase tracking-wider font-bold">
                        {cpmTierLabel(data.cpmTier)}
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary/50 text-[10px] uppercase tracking-wider font-bold">
                        {maturityLabel(data.marketMaturity)}
                    </Badge>
                </div>

                <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
                    {data.verdictDescription}
                </p>
            </CardContent>

            <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, rgba(16,185,129,0.1) 25%, rgba(16,185,129,0.3) 50%, rgba(16,185,129,0.1) 75%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>
        </Card>
    );
}
