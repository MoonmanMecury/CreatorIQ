"use client";

import { UnderservedKeyword } from "../types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    FlashIcon,
    LeftToRightListNumberIcon,
    Search01Icon,
    TextItalicIcon,
    Tag01Icon
} from "hugeicons-react";

interface UnderservedKeywordsListProps {
    keywords: UnderservedKeyword[];
    isLoading: boolean;
    onKeywordClick?: (keyword: string) => void;
}

export function UnderservedKeywordsList({
    keywords,
    isLoading,
    onKeywordClick
}: UnderservedKeywordsListProps) {
    if (isLoading) {
        return (
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <Skeleton className="h-4 w-40" />
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <Tag01Icon size={18} className="text-primary" />
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Market Expansion & Gap Keywords
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {keywords.map((kw, i) => (
                        <button
                            key={`${kw.keyword}-${i}`}
                            onClick={() => onKeywordClick?.(kw.keyword)}
                            className="group flex flex-col items-start gap-2 rounded-xl border border-border/50 bg-background/40 p-3 text-left transition-all hover:border-primary/50 hover:bg-background/80 hover:shadow-md"
                        >
                            <div className="flex w-full items-start justify-between gap-2">
                                <span className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                    {kw.keyword}
                                </span>
                                {kw.isLongTail && (
                                    <TextItalicIcon size={12} className="mt-1 flex-shrink-0 text-muted-foreground" />
                                )}
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "h-4 px-1 text-[8px] font-black uppercase",
                                        kw.searchVolumeTrend === 'RISING'
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                                            : "border-slate-500/30 bg-slate-500/10 text-slate-400"
                                    )}
                                >
                                    {kw.searchVolumeTrend === 'RISING' ? <FlashIcon size={8} className="mr-0.5 fill-current" /> : null}
                                    {kw.searchVolumeTrend}
                                </Badge>

                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "h-4 px-1 text-[8px] font-black uppercase",
                                        kw.competitionLevel === 'LOW' && "border-emerald-500/30 text-emerald-500",
                                        kw.competitionLevel === 'MEDIUM' && "border-amber-500/30 text-amber-500",
                                        kw.competitionLevel === 'HIGH' && "border-rose-500/30 text-rose-500"
                                    )}
                                >
                                    {kw.competitionLevel} COMP
                                </Badge>
                            </div>

                            <div className="mt-1 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
