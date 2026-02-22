"use client";

import { BreakoutVideo } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { UserGroupIcon, ViewIcon, ArrowUpRight01Icon } from "hugeicons-react";

interface BreakoutVideosListProps {
    videos: BreakoutVideo[];
    isLoading: boolean;
}

export function BreakoutVideosList({ videos, isLoading }: BreakoutVideosListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Breakout Content</h3>
                <Badge variant="secondary" className="text-[10px]">{videos.length} Identified</Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {videos.map((video) => (
                    <Card key={video.videoId} className="group relative overflow-hidden border-border/50 bg-card/50 transition-all hover:bg-card hover:shadow-lg">
                        <CardContent className="p-0">
                            <div className="flex gap-4 p-4">
                                <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[8px] font-bold text-white uppercase">
                                        Viral
                                    </div>
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col justify-between">
                                    <div className="space-y-1">
                                        <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                                            {video.title}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-[10px] font-medium text-muted-foreground">{video.channelName}</p>
                                            <Badge variant="outline" className="h-4 border-emerald-500/30 px-1 text-[8px] text-emerald-500 bg-emerald-500/5">
                                                <UserGroupIcon size={8} className="mr-0.5" />
                                                {Math.floor(video.channelSubscribers / 1000)}K
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <ViewIcon size={12} />
                                                <span className="font-bold text-foreground">{(video.views / 1000).toFixed(0)}K</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-black">
                                                {video.outperformanceRatio}x outperformance
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(video.publishDate))} ago
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <a
                                href={video.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                            >
                                <ArrowUpRight01Icon size={14} className="text-primary" />
                            </a>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
