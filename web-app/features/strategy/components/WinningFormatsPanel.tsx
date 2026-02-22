'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { FormatScore } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ZapIcon } from 'lucide-react';

interface Props {
    formats: FormatScore[];
    isLoading: boolean;
}

function AnimatedBar({ value }: { value: number }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const el = ref.current;
        el.style.width = '0%';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.width = `${value}%`;
            });
        });
    }, [value]);

    const color =
        value >= 75
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
            : value >= 55
                ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                : 'bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/30';

    return (
        <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden w-full">
            <div
                ref={ref}
                className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
                style={{ width: '0%' }}
            />
        </div>
    );
}

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};
const item = {
    hidden: { opacity: 0, x: -12 },
    show: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

function RowSkeleton() {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-border/20 last:border-0">
            <Skeleton className="h-6 w-6 rounded shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
            </div>
        </div>
    );
}

export function WinningFormatsPanel({ formats, isLoading }: Props) {
    if (isLoading) {
        return (
            <Card className="bg-card/50 border-border/50 overflow-hidden">
                <CardHeader>
                    <Skeleton className="h-6 w-44" />
                </CardHeader>
                <CardContent className="divide-y divide-border/20">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <RowSkeleton key={i} />
                    ))}
                </CardContent>
            </Card>
        );
    }

    const topFive = formats.slice(0, 5);

    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-black tracking-tight">
                    🏆 Winning Formats
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                <motion.div variants={container} initial="hidden" animate="show">
                    {topFive.map((fmt, idx) => (
                        <motion.div
                            key={fmt.format}
                            variants={item}
                            className="flex items-start gap-3 px-6 py-4 border-b border-border/20 last:border-0 hover:bg-secondary/20 transition-colors"
                        >
                            {/* Rank */}
                            <span className="text-xs font-black text-muted-foreground/50 mt-0.5 w-4 shrink-0">
                                #{idx + 1}
                            </span>

                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold">{fmt.label}</span>
                                        {fmt.isShortForm && (
                                            <Badge
                                                variant="outline"
                                                className="text-[9px] font-bold px-1.5 py-0 border-pink-500/40 text-pink-400 bg-pink-500/10 flex items-center gap-0.5"
                                            >
                                                <ZapIcon size={8} />
                                                Short-form
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-sm font-black text-primary shrink-0">
                                        {fmt.successLikelihood}
                                    </span>
                                </div>

                                <AnimatedBar value={fmt.successLikelihood} />

                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {fmt.reasoning}
                                </p>

                                <p className="text-xs text-muted-foreground/60 italic leading-relaxed">
                                    e.g. &ldquo;{fmt.exampleTitle}&rdquo;
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </CardContent>
        </Card>
    );
}
