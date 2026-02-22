'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { InsightsResponse } from '../types';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Verdict badge with tier-specific color and GOLDMINE shimmer. */
function VerdictBadge({ verdict }: { verdict: InsightsResponse['verdict'] }) {
    const styles: Record<InsightsResponse['verdict'], string> = {
        LOW: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        HIGH: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        GOLDMINE:
            'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-emerald-500/25 shadow-md animate-pulse',
    };
    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border tracking-widest uppercase ${styles[verdict]}`}
        >
            {verdict === 'GOLDMINE' && <span className="mr-1.5">✦</span>}
            {verdict}
        </span>
    );
}

/** Animated count-up hook — counts from 0 to target over ~900ms. */
function useCountUp(target: number, enabled: boolean): number {
    const [value, setValue] = useState(0);
    const raf = useRef<number | null>(null);
    const start = useRef<number | null>(null);
    const duration = 900;

    useEffect(() => {
        if (!enabled) return;
        setValue(0);
        start.current = null;

        const step = (timestamp: number) => {
            if (start.current === null) start.current = timestamp;
            const elapsed = timestamp - start.current;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) {
                raf.current = requestAnimationFrame(step);
            }
        };

        raf.current = requestAnimationFrame(step);
        return () => {
            if (raf.current !== null) cancelAnimationFrame(raf.current);
        };
    }, [target, enabled]);

    return value;
}

/** Animated progress bar that fills in over 700ms after mount. */
function AnimatedProgress({ value, label, color }: { value: number; label: string; color: string }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setCurrent(value), 100);
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">{label}</span>
                <span className="font-semibold tabular-nums">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
                    style={{ width: `${current}%` }}
                />
            </div>
        </div>
    );
}

/** Skeleton layout that exactly matches the loaded state. */
function OpportunityPanelSkeleton() {
    return (
        <Card className="bg-card/60 backdrop-blur border border-border/60 w-full">
            <CardHeader className="pb-4">
                <Skeleton className="h-5 w-44" />
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Score + verdict */}
                <div className="flex flex-col items-center gap-3 py-4">
                    <Skeleton className="h-20 w-28 rounded-xl" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                {/* Progress bars */}
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-8" />
                            </div>
                            <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                    ))}
                </div>
                {/* Insights */}
                <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-2">
                            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface OpportunityPanelProps {
    data: InsightsResponse | undefined;
    isLoading: boolean;
}

export function OpportunityPanel({ data, isLoading }: OpportunityPanelProps) {
    // Always call hook before any conditional returns (Rules of Hooks)
    const displayScore = useCountUp(data?.opportunityScore ?? 0, !isLoading && Boolean(data));

    if (isLoading || !data) return <OpportunityPanelSkeleton />;

    const scoreColor =
        data.verdict === 'GOLDMINE'
            ? 'text-emerald-400'
            : data.verdict === 'HIGH'
                ? 'text-blue-400'
                : data.verdict === 'MEDIUM'
                    ? 'text-amber-400'
                    : 'text-rose-400';

    return (
        <Card className="bg-card/60 backdrop-blur border border-border/60 w-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-muted-foreground tracking-wide uppercase">
                    Opportunity Score
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Score + Verdict */}
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className={`text-7xl font-extrabold tabular-nums tracking-tight ${scoreColor}`}>
                        {displayScore}
                    </div>
                    <VerdictBadge verdict={data.verdict} />
                </div>

                {/* Dimension bars */}
                <div className="space-y-4">
                    <AnimatedProgress value={data.demandScore} label="Demand" color="bg-violet-500" />
                    <AnimatedProgress value={data.competitionScore} label="Competition" color="bg-rose-500" />
                    <AnimatedProgress value={data.saturationScore} label="Saturation" color="bg-amber-500" />
                </div>

                {/* Insights */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Key Signals
                    </h4>
                    <ul className="space-y-2">
                        {data.insights.map((insight, i) => (
                            <li key={i} className="flex gap-2.5 items-start text-sm text-foreground/80">
                                <span className="mt-0.5 shrink-0 text-violet-400">◆</span>
                                <span>{insight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
