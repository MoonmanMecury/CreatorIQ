'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PostingPlan, PostingCadence, GrowthPhase } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { VideoIcon, ZapIcon, ClockIcon, ChevronRightIcon } from 'lucide-react';

interface Props {
    plan: PostingPlan | undefined;
    isLoading: boolean;
}

const CADENCE_STYLES: Record<PostingCadence, { color: string; glow: string; label: string }> = {
    LIGHT: {
        color: 'text-emerald-400',
        glow: 'text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]',
        label: '🌱 Light',
    },
    MODERATE: {
        color: 'text-blue-400',
        glow: 'text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.3)]',
        label: '📈 Moderate',
    },
    AGGRESSIVE: {
        color: 'text-orange-400',
        glow: 'text-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.3)]',
        label: '🚀 Aggressive',
    },
};

function PhaseNode({
    phase,
    isActive,
    onClick,
}: {
    phase: GrowthPhase;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1.5 group transition-all ${isActive ? 'scale-105' : 'hover:scale-105'
                }`}
        >
            <div
                className={`h-10 w-10 rounded-full border-2 flex items-center justify-center text-sm font-black transition-all ${isActive
                        ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_16px_rgba(var(--primary)/0.5)]'
                        : 'border-border/50 bg-secondary/40 text-muted-foreground group-hover:border-primary/50'
                    }`}
            >
                {phase.phase}
            </div>
            <span
                className={`text-[10px] font-bold text-center max-w-[70px] leading-tight ${isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
            >
                {phase.label.split(' ')[0]}
            </span>
        </button>
    );
}

export function PostingPlanCard({ plan, isLoading }: Props) {
    const [activePhase, setActivePhase] = useState<number>(0);

    if (isLoading) {
        return (
            <Card className="bg-card/50 border-border/50 overflow-hidden">
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-5">
                    <Skeleton className="h-12 w-32" />
                    <div className="flex gap-6">
                        <Skeleton className="h-16 w-24" />
                        <Skeleton className="h-16 w-24" />
                        <Skeleton className="h-16 w-24" />
                    </div>
                    <Skeleton className="h-px w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="flex items-center justify-between pt-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-10 w-20 rounded-xl" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!plan) return null;

    const cadenceStyle = CADENCE_STYLES[plan.cadence];
    const selectedPhase = plan.growthPhases[activePhase];

    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-black tracking-tight">
                    📅 Publishing Plan
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Cadence label */}
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        Cadence
                    </p>
                    <p className={`text-2xl font-black tracking-tight ${cadenceStyle.color}`}>
                        {cadenceStyle.label}
                    </p>
                </div>

                {/* Big numbers */}
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-center">
                        <p className="text-3xl font-black">{plan.longFormPerWeek}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5">
                            <VideoIcon size={10} /> Long-form/wk
                        </p>
                    </div>
                    <ChevronRightIcon size={16} className="text-muted-foreground/40 hidden sm:block" />
                    <div className="text-center">
                        <p className="text-3xl font-black">{plan.shortFormPerWeek}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5">
                            <ZapIcon size={10} /> Shorts/wk
                        </p>
                    </div>
                    <ChevronRightIcon size={16} className="text-muted-foreground/40 hidden sm:block" />
                    <div className="text-center">
                        <p className="text-3xl font-black">{plan.weeklyCommitmentHours}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5">
                            <ClockIcon size={10} /> hrs/wk
                        </p>
                    </div>
                </div>

                <Separator className="opacity-30" />

                {/* First month focus */}
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        Month 1 Focus
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {plan.firstMonthFocus}
                    </p>
                </div>

                <Separator className="opacity-30" />

                {/* Growth phase timeline */}
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                        Growth Roadmap
                    </p>

                    {/* Timeline nodes */}
                    <div className="flex items-center justify-between relative mb-5">
                        {/* Connecting line */}
                        <div className="absolute left-5 right-5 top-5 h-px bg-border/40" />

                        {plan.growthPhases.map((phase, idx) => (
                            <PhaseNode
                                key={phase.phase}
                                phase={phase}
                                isActive={activePhase === idx}
                                onClick={() => setActivePhase(idx)}
                            />
                        ))}
                    </div>

                    {/* Phase detail */}
                    <AnimatePresence mode="wait">
                        {selectedPhase && (
                            <motion.div
                                key={activePhase}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-xl border border-border/30 bg-secondary/20 p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h4 className="font-black text-sm text-primary">
                                        {selectedPhase.label}
                                    </h4>
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] border-border/40 text-muted-foreground"
                                    >
                                        {selectedPhase.durationWeeks} weeks
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground italic">
                                    Goal: {selectedPhase.goal}
                                </p>
                                <ul className="space-y-1.5">
                                    {selectedPhase.keyActions.map((action, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <span className="text-primary mt-0.5 shrink-0">›</span>
                                            {action}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}
