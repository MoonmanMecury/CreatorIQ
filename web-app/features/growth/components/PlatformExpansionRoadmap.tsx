/**
 * @file PlatformExpansionRoadmap.tsx
 * Strategic roadmap for content distribution beyond the primary platform.
 */

import { PlatformRecommendation } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
    DashboardSquare01Icon,
    GlobalIcon,
    Share01Icon,
    HourglassIcon,
    ArrowUpRight01Icon,
    VideoReplayIcon
} from 'hugeicons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
    platforms: PlatformRecommendation[];
    isLoading: boolean;
}

export function PlatformExpansionRoadmap({ platforms, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
        );
    }

    // YouTube is always priority 1
    const youtube = platforms.find(p => p.platform === 'YOUTUBE');
    const others = platforms.filter(p => p.platform !== 'YOUTUBE').sort((a, b) => a.priority - b.priority);

    return (
        <Card className="border-border/60 bg-card/30 backdrop-blur-sm h-full">
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                    <Share01Icon className="text-primary" size={20} />
                    <h3 className="text-lg font-black tracking-tight">Platform Roadmap</h3>
                </div>

                <div className="space-y-4">
                    {/* Primary Platform (YouTube) */}
                    {youtube && (
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                                <GlobalIcon size={64} />
                            </div>
                            <div className="relative z-10 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Primary Platform</span>
                                    <Badge className="bg-primary text-primary-foreground font-bold">#1</Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">YT</div>
                                    <div>
                                        <h4 className="font-bold text-lg">YouTube</h4>
                                        <p className="text-xs text-muted-foreground">{youtube.whenToStart}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Expansion Platforms */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expansion Strategy</p>
                        {others.map((p, idx) => (
                            <motion.div
                                key={p.platform}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 rounded-xl border border-border/40 bg-background/30 hover:border-border/80 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold">
                                            {p.label.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <h5 className="text-sm font-bold">{p.label}</h5>
                                                <Badge variant="outline" className="text-[8px] h-3 px-1 py-0 leading-none">PR {p.priority}</Badge>
                                            </div>
                                            <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                                                <HourglassIcon size={10} />
                                                {p.whenToStart}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-muted-foreground">RELEVANCE</p>
                                        <p className="text-sm font-black tabular-nums">{p.relevanceScore}%</p>
                                    </div>
                                </div>

                                <div className="mt-3 space-y-2">
                                    <Progress value={p.relevanceScore} className="h-1 bg-muted" />
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                                        <span className="flex items-center gap-1">
                                            <VideoReplayIcon size={12} />
                                            {p.primaryContentFormat}
                                        </span>
                                        <span className="text-primary font-bold">+{p.weeklyTimeCommitment} hrs/wk</span>
                                    </div>
                                </div>

                                {/* Expandable Benefit */}
                                <div className="mt-3 pt-3 border-t border-border/20 hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-300">
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        <span className="font-bold text-foreground">Benefit:</span> {p.expectedBenefit}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
