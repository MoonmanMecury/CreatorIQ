/**
 * @file CadenceSchedule.tsx
 * Visualizes the evolution of content volume and a 12-week execution schedule.
 */

import { CadencePhase, WeeklySchedule } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Calendar02Icon,
    VideoReplayIcon,
    ZapIcon,
    ArrowRight01Icon,
    LeftToRightListDashIcon
} from 'hugeicons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
    phases: CadencePhase[];
    weeklySchedule: WeeklySchedule[];
    isLoading: boolean;
}

export function CadenceSchedule({ phases, weeklySchedule, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* 1. Phase Overview Cards */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Evolution of Cadence</h3>
                    <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {phases.map((p, idx) => (
                        <Card key={p.phase} className={cn(
                            "border-border/40 bg-card/40 hover:border-primary/30 transition-all",
                            p.phase === 1 ? "ring-1 ring-primary/20 border-primary/20" : ""
                        )}>
                            <CardContent className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="text-[10px] font-bold">PHASE {p.phase}</Badge>
                                    <p className="text-[10px] font-bold text-muted-foreground">{p.endWeek === -1 ? `Week ${p.startWeek}+` : `Wks ${p.startWeek}–${p.endWeek}`}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm font-bold leading-tight">{p.label.split(': ')[1]}</p>
                                    <div className="flex gap-3 pt-1">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black">{p.longFormPerWeek}</span>
                                            <span className="text-[9px] uppercase text-muted-foreground font-bold">Videos</span>
                                        </div>
                                        <div className="w-px h-8 bg-border/40 my-auto" />
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black">{p.shortFormPerWeek}</span>
                                            <span className="text-[9px] uppercase text-muted-foreground font-bold">Shorts</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                                        <ZapIcon size={12} className="text-orange-400" />
                                        <span>{p.weeklyHoursEstimate}h commitment</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                                        {p.focus}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* 2. 12-Week Grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">First 12 Weeks Execute Plan</h3>
                    <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {weeklySchedule.map((w, idx) => (
                        <motion.div
                            key={w.week}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                                "p-3 rounded-xl border border-border/40 flex flex-col gap-2 relative group transition-all",
                                w.week === 1 ? "bg-primary/5 border-primary/30" : "bg-card/30",
                                w.phase === 2 ? "bg-muted/10 border-emerald-500/10" : ""
                            )}
                        >
                            {w.week === 1 && (
                                <div className="absolute -top-2 -right-1">
                                    <Badge className="bg-primary text-[8px] h-4 leading-none">START HERE</Badge>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-muted-foreground uppercase">Week {w.week}</span>
                                <div className="flex gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                    {Array.from({ length: w.shortFormCount }).map((_, i) => (
                                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-bold truncate leading-none group-hover:text-primary transition-colors">{w.focusTopic}</p>
                                <Badge variant="outline" className="text-[9px] py-0 h-4 border-border/60">{w.primaryFormat}</Badge>
                            </div>

                            <p className="text-[9px] text-muted-foreground truncate italic pt-1 border-t border-border/20">
                                {w.milestone}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
