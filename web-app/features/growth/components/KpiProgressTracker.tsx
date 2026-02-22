/**
 * @file KpiProgressTracker.tsx
 * Lists stage-specific KPI targets with status badges and improvement tips.
 */

import { KpiTarget, GrowthStage } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
    DashboardSquare01Icon,
    ArrowDown01Icon,
    Target02Icon,
    InformationCircleIcon,
    Idea01Icon
} from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Props {
    kpis: KpiTarget[];
    isLoading: boolean;
}

export function KpiProgressTracker({ kpis, isLoading }: Props) {
    const [openStages, setOpenStages] = useState<string[]>(['LAUNCH']);

    const toggleStage = (stage: string) => {
        setOpenStages(prev =>
            prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
        );
    }

    const stages: GrowthStage[] = ['LAUNCH', 'TRACTION', 'MOMENTUM', 'AUTHORITY'];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ON_TRACK': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'AT_RISK': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'BEHIND': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'AHEAD': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-muted/50 text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Target02Icon className="text-primary" size={20} />
                <h3 className="text-xl font-black tracking-tight">Performance Benchmarks</h3>
            </div>

            {stages.map((stage) => {
                const stageKpis = kpis.filter(k => k.stage === stage);
                if (stageKpis.length === 0) return null;

                return (
                    <Collapsible
                        key={stage}
                        open={openStages.includes(stage)}
                        onOpenChange={() => toggleStage(stage)}
                        className="border border-border/40 rounded-2xl overflow-hidden bg-card/20 backdrop-blur-sm"
                    >
                        <CollapsibleTrigger>
                            <div className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors select-none">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className={cn(
                                        "font-black text-[10px]",
                                        stage === 'LAUNCH' ? "border-blue-500/50 text-blue-400" :
                                            stage === 'TRACTION' ? "border-amber-500/50 text-amber-400" :
                                                stage === 'MOMENTUM' ? "border-emerald-500/50 text-emerald-400" :
                                                    "border-purple-500/50 text-purple-400"
                                    )}>
                                        {stage}
                                    </Badge>
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                        Benchmarks ({stageKpis.length})
                                    </span>
                                </div>
                                <ArrowDown01Icon
                                    className={cn(
                                        "transition-transform duration-300",
                                        openStages.includes(stage) ? "rotate-180" : ""
                                    )}
                                    size={20}
                                />
                            </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <div className="px-6 pb-4 space-y-3">
                                {stageKpis.map((kpi, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-xl border border-border/20 bg-background/30 group hover:border-border/60 transition-all"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <h5 className="text-sm font-bold flex items-center gap-2">
                                                    {kpi.metric}
                                                    <InformationCircleIcon size={14} className="text-muted-foreground/40" />
                                                </h5>
                                                <p className="text-xs text-muted-foreground">{kpi.description}</p>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Target</p>
                                                    <p className="text-lg font-black tabular-nums">{kpi.targetValue}{kpi.unit}</p>
                                                    <p className="text-[9px] text-muted-foreground">By week {kpi.timeframeWeeks}</p>
                                                </div>
                                                <div className="w-px h-8 bg-border/40" />
                                                <Badge className={cn("font-bold text-[10px]", getStatusColor(kpi.status))}>
                                                    {kpi.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Improvement Tip */}
                                        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 flex gap-3 items-start">
                                            <Idea01Icon size={16} className="text-primary mt-0.5 shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-wider leading-none">Pro Tip for Success</p>
                                                <p className="text-xs text-muted-foreground leading-snug">{kpi.improvementTip}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}
