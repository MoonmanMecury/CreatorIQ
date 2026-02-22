/**
 * @file SubscriberMilestonesTracker.tsx
 * Vertical timeline of subscriber growth milestones with unlocked features.
 */

import { SubscriberMilestone } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
    StarIcon,
    Tick01Icon,
    ArrowDown01Icon,
    PackageIcon,
    DollarCircleIcon
} from 'hugeicons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Props {
    milestones: SubscriberMilestone[];
    isLoading: boolean;
}

export function SubscriberMilestonesTracker({ milestones, isLoading }: Props) {
    const [expandedIndices, setExpandedIndices] = useState<number[]>([0]);

    const toggleExpand = (idx: number) => {
        setExpandedIndices(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'LAUNCH': return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
            case 'TRACTION': return 'text-amber-400 border-amber-400/20 bg-amber-400/10';
            case 'MOMENTUM': return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
            case 'AUTHORITY': return 'text-purple-400 border-purple-400/20 bg-purple-400/10';
            default: return 'text-muted-foreground border-border bg-muted';
        }
    };

    const getDotColor = (stage: string) => {
        switch (stage) {
            case 'LAUNCH': return 'bg-blue-400';
            case 'TRACTION': return 'bg-amber-400';
            case 'MOMENTUM': return 'bg-emerald-400';
            case 'AUTHORITY': return 'bg-purple-400';
            default: return 'bg-muted-foreground';
        }
    };

    return (
        <div className="space-y-10 relative pl-8 md:pl-12">
            {/* Vertical Timeline Line */}
            <div className="absolute left-4 md:left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-400 via-emerald-400 to-purple-400 opacity-20" />

            {milestones.map((m, idx) => (
                <motion.div
                    key={m.target}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                >
                    {/* Milestone Dot */}
                    <div className={cn(
                        "absolute -left-10 md:-left-12 top-2 h-6 w-6 rounded-full border-4 border-background z-10 flex items-center justify-center",
                        idx === 0 ? "scale-125 ring-4 ring-primary/20" : "",
                        getDotColor(m.stage)
                    )}>
                        {idx === 0 && <StarIcon size={12} className="text-white fill-current" />}
                    </div>

                    <Collapsible
                        open={expandedIndices.includes(idx)}
                        onOpenChange={() => toggleExpand(idx)}
                        className="group"
                    >
                        <Card className={cn(
                            "border-border/40 bg-card/40 transition-all duration-300 hover:border-border/80",
                            idx === 0 ? "border-primary/30 bg-primary/5 ring-1 ring-primary/10" : ""
                        )}>
                            <CollapsibleTrigger>
                                <div className="p-6 cursor-pointer select-none">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-2xl font-black tracking-tight">{m.target.toLocaleString()} SUBS</p>
                                                    <Badge variant="outline" className={cn("text-[10px] font-bold px-1.5 py-0 h-5", getStageColor(m.stage))}>
                                                        {m.stage}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground">{m.label} • Est. {m.estimatedWeeksRange}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {m.unlockedFeatures.slice(0, 2).map((f) => (
                                                <Badge key={f} variant="secondary" className="bg-muted/50 text-xs gap-1 py-1">
                                                    <PackageIcon size={12} />
                                                    {f}
                                                </Badge>
                                            ))}
                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-xs gap-1 py-1">
                                                <DollarCircleIcon size={12} />
                                                {m.monetizationUnlocked[0]}
                                            </Badge>
                                            <ArrowDown01Icon
                                                className={cn(
                                                    "ml-2 text-muted-foreground transition-transform duration-300",
                                                    expandedIndices.includes(idx) ? "rotate-180" : ""
                                                )}
                                                size={20}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <div className="px-6 pb-6 pt-2 border-t border-border/20 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                <Tick01Icon size={14} className="text-primary" />
                                                Key Actions to Hit Target
                                            </h4>
                                            <ul className="space-y-2">
                                                {m.keyActions.map((action, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                                                        <span className="text-primary font-bold">{i + 1}.</span>
                                                        {action}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl bg-muted/30 border border-border/20">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Milestone Reward</h4>
                                                <div className="space-y-2">
                                                    {m.unlockedFeatures.map(f => (
                                                        <div key={f} className="flex items-center gap-2 text-sm">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                            <span>{f}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] uppercase font-black text-primary tracking-wider">Required Velocity</p>
                                                    <p className="text-sm font-bold">{m.weeklyViewsNeeded.toLocaleString()} views / week</p>
                                                </div>
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <StarIcon size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                </motion.div>
            ))}
        </div>
    );
}
