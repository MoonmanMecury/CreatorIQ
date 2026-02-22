"use client";

import { motion } from "framer-motion";
import { OpportunityResult } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Target02Icon, InformationCircleIcon } from "hugeicons-react";

interface OpportunityScoreCardProps {
    data?: OpportunityResult;
    isLoading: boolean;
}

export function OpportunityScoreCard({ data, isLoading }: OpportunityScoreCardProps) {
    if (isLoading) {
        return (
            <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-8 pt-0">
                    <div className="flex flex-col items-center justify-center py-6">
                        <Skeleton className="mb-2 h-16 w-32" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const getClassificationStyles = (classification: string) => {
        switch (classification) {
            case 'POOR': return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            case 'FAIR': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case 'STRONG': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case 'PRIME ENTRY': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] animate-pulse";
            default: return "";
        }
    };

    const signals = [
        { label: "Underserved Demand", value: data.signals.underservedDemand, color: "bg-blue-500" },
        { label: "Weak Competition", value: data.signals.weakCompetition, color: "bg-emerald-500" },
        { label: "Small Creator Advantage", value: data.signals.smallCreatorAdvantage, color: "bg-indigo-500" },
        { label: "Freshness Gap", value: data.signals.freshnessGap, color: "bg-amber-500" },
    ];

    return (
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Target02Icon size={18} />
                    </div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Opportunity Index</CardTitle>
                </div>
                <Badge variant="outline" className={cn("px-2 py-0.5 font-bold tracking-tight", getClassificationStyles(data.classification))}>
                    {data.classification}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-8 pt-0">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-7xl font-black tracking-tighter text-foreground"
                    >
                        {data.opportunityIndex}
                    </motion.div>
                    <p className="mt-1 text-xs text-muted-foreground">Overall Market Potential</p>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                    {signals.map((signal, idx) => (
                        <motion.div
                            key={signal.label}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 * idx }}
                            className="space-y-2"
                        >
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-muted-foreground">{signal.label}</span>
                                <span className="font-bold text-foreground">{signal.value}%</span>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${signal.value}%` }}
                                    transition={{ duration: 1, delay: 0.2 + (0.1 * idx), ease: "easeOut" }}
                                    className={cn("h-full rounded-full", signal.color)}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
