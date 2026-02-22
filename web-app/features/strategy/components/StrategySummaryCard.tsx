'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { ContentStrategy } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { BookOpenIcon, VideoIcon, CalendarIcon } from 'lucide-react';
import { SaveButton } from '@/features/saved/components/SaveButton';

interface Props {
    data: ContentStrategy | undefined;
    isLoading: boolean;
}

const cadenceColor = {
    LIGHT: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    MODERATE: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    AGGRESSIVE: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

export function StrategySummaryCard({ data, isLoading }: Props) {
    const [displayed, setDisplayed] = useState('');

    // Typewriter effect for the summary
    useEffect(() => {
        if (!data?.strategySummary) return;
        setDisplayed('');
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayed(data.strategySummary.slice(0, i));
            if (i >= data.strategySummary.length) clearInterval(interval);
        }, 10);
        return () => clearInterval(interval);
    }, [data?.strategySummary]);

    if (isLoading) {
        return (
            <Card className="bg-card/50 border-border/50 overflow-hidden">
                <CardHeader>
                    <Skeleton className="h-7 w-56" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <div className="flex gap-3">
                        <Skeleton className="h-8 w-32 rounded-full" />
                        <Skeleton className="h-8 w-28 rounded-full" />
                        <Skeleton className="h-8 w-36 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const cadence = data.postingPlan.cadence;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="bg-card/50 border-border/50 overflow-hidden relative">
                {/* Ambient glow */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <span className="text-primary">✦</span>
                            Your Content Strategy
                        </CardTitle>
                        <SaveButton
                            keyword={data.keyword || ''}
                            variant="compact"
                            currentScores={{
                                tags: data.pillars.map(p => p.name),
                                topRevenuePaths: data.topFormats.map(f => f.label)
                            }}
                        />
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Summary blockquote */}
                    <div className="relative border-l-4 border-primary/60 pl-5 py-3 bg-primary/5 rounded-r-xl">
                        <p className="text-base leading-relaxed text-foreground/90 font-medium">
                            {displayed}
                            <span className="inline-block w-0.5 h-4 bg-primary/70 ml-0.5 animate-pulse align-middle" />
                        </p>
                    </div>

                    <Separator className="opacity-30" />

                    {/* Stat pills */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border-border/50 bg-secondary/40"
                        >
                            <BookOpenIcon size={13} className="text-primary" />
                            <span className="font-bold">{data.pillars.length}</span>
                            <span className="text-muted-foreground">Content Pillars</span>
                        </Badge>

                        <Badge
                            variant="outline"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border-border/50 bg-secondary/40"
                        >
                            <VideoIcon size={13} className="text-primary" />
                            <span className="font-bold">{data.videoIdeas.length}</span>
                            <span className="text-muted-foreground">Video Ideas</span>
                        </Badge>

                        <Badge
                            variant="outline"
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border ${cadenceColor[cadence]}`}
                        >
                            <CalendarIcon size={13} />
                            <span className="font-bold">{cadence}</span>
                            <span className="opacity-70">Publishing Cadence</span>
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
