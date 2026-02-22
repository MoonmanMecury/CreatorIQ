'use client';

import { motion } from 'framer-motion';
import type { DifferentiationStrategy } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ClockIcon } from 'lucide-react';

interface Props {
    strategies: DifferentiationStrategy[];
    isLoading: boolean;
}

const EFFORT_STYLES = {
    LOW: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    HIGH: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};
const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function RowSkeleton() {
    return (
        <div className="rounded-xl border border-border/30 bg-secondary/20 p-5 space-y-2">
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-8 rounded-full" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16 rounded-full ml-auto" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
        </div>
    );
}

export function DifferentiationPanel({ strategies, isLoading }: Props) {
    if (isLoading) {
        return (
            <Card className="bg-card/50 border-border/50 overflow-hidden">
                <CardHeader>
                    <Skeleton className="h-6 w-52" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <RowSkeleton key={i} />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-black tracking-tight">
                    🎯 How to Stand Out
                </CardTitle>
            </CardHeader>

            <CardContent>
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                >
                    {strategies.map((strat, idx) => {
                        const isTop = idx === 0;
                        return (
                            <motion.div
                                key={strat.strategy}
                                variants={item}
                                className={`rounded-xl border p-5 space-y-3 transition-shadow hover:shadow-md ${isTop
                                        ? 'border-primary/40 bg-primary/5 shadow-[0_0_16px_rgba(var(--primary)/0.1)]'
                                        : 'border-border/30 bg-secondary/20'
                                    }`}
                            >
                                {/* Header row */}
                                <div className="flex items-start gap-2 flex-wrap">
                                    <Badge
                                        variant="outline"
                                        className={`shrink-0 font-black text-[10px] border ${isTop
                                                ? 'border-primary/40 text-primary bg-primary/10'
                                                : 'border-border/40 text-muted-foreground'
                                            }`}
                                    >
                                        #{strat.priority}
                                    </Badge>
                                    <h3
                                        className={`font-black text-sm leading-snug flex-1 ${isTop ? 'text-primary' : ''
                                            }`}
                                    >
                                        {strat.strategy}
                                    </h3>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] font-bold border ${EFFORT_STYLES[strat.effortLevel]
                                                }`}
                                        >
                                            {strat.effortLevel} effort
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] border-border/40 text-muted-foreground flex items-center gap-0.5"
                                        >
                                            <ClockIcon size={9} />~{strat.timeToImpactWeeks}w
                                        </Badge>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {strat.description}
                                </p>

                                {/* Why it works */}
                                <p className="text-xs text-muted-foreground/60 italic leading-relaxed border-t border-border/20 pt-2">
                                    {strat.whyItWorks}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </CardContent>
        </Card>
    );
}
