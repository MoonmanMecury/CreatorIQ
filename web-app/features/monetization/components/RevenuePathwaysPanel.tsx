"use client";

import { RevenuePath, RevenuePathType } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    TvIcon,
    LinkIcon,
    HandshakeIcon,
    GraduationCapIcon,
    DownloadIcon,
    CpuIcon,
    UsersIcon,
    PackageIcon,
    TrendingUpIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    paths: RevenuePath[];
    isLoading: boolean;
}

const pathIcons: Record<RevenuePathType, any> = {
    AD_REVENUE: TvIcon,
    AFFILIATE_MARKETING: LinkIcon,
    SPONSORSHIPS: HandshakeIcon,
    COURSES: GraduationCapIcon,
    DIGITAL_PRODUCTS: DownloadIcon,
    SAAS_TOOLS: CpuIcon,
    COACHING: UsersIcon,
    PHYSICAL_PRODUCTS: PackageIcon
};

const timeColors: Record<string, string> = {
    WEEKS: "bg-emerald-500/10 text-emerald-500",
    MONTHS: "bg-blue-500/10 text-blue-500",
    LONG_TERM: "bg-slate-500/10 text-slate-500"
};

export function RevenuePathwaysPanel({ paths, isLoading }: Props) {
    if (isLoading) {
        return (
            <Card className="bg-card/50 border-border/50">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    const sortedPaths = [...paths].sort((a, b) => b.confidenceScore - a.confidenceScore);

    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                    <TrendingUpIcon size={20} className="text-primary" />
                    Revenue Pathways
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {sortedPaths.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground italic text-sm">
                        No highly viable revenue paths detected for this specific keyword.
                    </div>
                ) : (
                    sortedPaths.map((path, idx) => {
                        const Icon = pathIcons[path.type] || TvIcon;
                        const progressColor = path.confidenceScore > 75
                            ? "bg-emerald-500"
                            : path.confidenceScore >= 50
                                ? "bg-blue-500"
                                : "bg-amber-500";

                        return (
                            <div
                                key={path.type}
                                className="group p-4 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/50 transition-all duration-200"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{path.label}</h4>
                                            <Badge variant="secondary" className={cn("mt-1 text-[10px] font-bold py-0 h-4", timeColors[path.estimatedTimeToRevenue])}>
                                                {path.estimatedTimeToRevenue.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-muted-foreground">
                                        {path.confidenceScore}% Viability
                                    </span>
                                </div>

                                <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden mb-2">
                                    <div
                                        className={cn("absolute inset-y-0 left-0 transition-all duration-1000 ease-out", progressColor)}
                                        style={{ width: `${path.confidenceScore}%` }}
                                    />
                                </div>

                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    {path.reasoning}
                                </p>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
