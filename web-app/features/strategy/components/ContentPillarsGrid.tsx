'use client';

import { motion } from 'framer-motion';
import type { ContentPillar, ContentFormat } from '../types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSignIcon } from 'lucide-react';

interface Props {
    pillars: ContentPillar[];
    isLoading: boolean;
}

const FORMAT_COLORS: Record<ContentFormat, string> = {
    TUTORIAL: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    REVIEW: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    LIST: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    CASE_STUDY: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    COMMENTARY: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    SHORT_FORM: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
    DOCUMENTARY: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    COMPARISON: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
    INTERVIEW: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    CHALLENGE: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

const FORMAT_LABELS: Record<ContentFormat, string> = {
    TUTORIAL: 'Tutorial',
    REVIEW: 'Review',
    LIST: 'List',
    CASE_STUDY: 'Case Study',
    COMMENTARY: 'Commentary',
    SHORT_FORM: 'Short-Form',
    DOCUMENTARY: 'Documentary',
    COMPARISON: 'Comparison',
    INTERVIEW: 'Interview',
    CHALLENGE: 'Challenge',
};

const PILLAR_COLORS = [
    'border-primary/40 bg-primary/5',
    'border-blue-500/30 bg-blue-500/5',
    'border-purple-500/30 bg-purple-500/5',
    'border-amber-500/30 bg-amber-500/5',
    'border-emerald-500/30 bg-emerald-500/5',
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};
const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function PillarSkeleton() {
    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-40" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-3 w-full" />
                ))}
                <Skeleton className="h-4 w-48 mt-2" />
                <div className="flex gap-2 mt-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </CardContent>
        </Card>
    );
}

export function ContentPillarsGrid({ pillars, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PillarSkeleton />
                <PillarSkeleton />
                <PillarSkeleton />
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
            {pillars.map((pillar, idx) => (
                <motion.div key={pillar.name} variants={item}>
                    <Card
                        className={`bg-card/50 border overflow-hidden h-full transition-shadow hover:shadow-lg ${PILLAR_COLORS[idx % PILLAR_COLORS.length]
                            }`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start gap-2 flex-wrap">
                                <Badge
                                    variant="outline"
                                    className="shrink-0 text-[10px] font-black uppercase tracking-widest border-current opacity-70"
                                >
                                    Pillar {pillar.priority}
                                </Badge>
                                <h3 className="font-black text-sm leading-tight">{pillar.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {pillar.description}
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Sample topics */}
                            <ul className="space-y-1.5">
                                {pillar.sampleTopics.slice(0, 4).map((topic, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <span className="text-primary mt-0.5 shrink-0">›</span>
                                        <span className="text-muted-foreground">{topic}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Monetization fit */}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border/30 pt-3">
                                <DollarSignIcon size={12} className="text-emerald-500 shrink-0" />
                                <span>{pillar.monetizationFit}</span>
                            </div>

                            {/* Format badges */}
                            <div className="flex flex-wrap gap-1.5">
                                {pillar.contentFormats.map((fmt) => (
                                    <Badge
                                        key={fmt}
                                        variant="outline"
                                        className={`text-[10px] font-bold uppercase tracking-wide border ${FORMAT_COLORS[fmt]
                                            }`}
                                    >
                                        {FORMAT_LABELS[fmt]}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );
}
