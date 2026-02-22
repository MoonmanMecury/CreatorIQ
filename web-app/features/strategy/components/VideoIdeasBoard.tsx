'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VideoIdea, DifficultyLevel, ContentFormat } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClockIcon, ChevronDownIcon, ZapIcon } from 'lucide-react';

interface Props {
    ideas: VideoIdea[];
    isLoading: boolean;
}

type FilterTab = 'ALL' | 'EASY' | 'SHORT_FORM' | 'HIGH_DEMAND';

const DIFFICULTY_STYLES: Record<DifficultyLevel, string> = {
    EASY: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    HARD: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const FORMAT_STYLES: Record<ContentFormat, string> = {
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

const DEMAND_STYLES = {
    HIGH: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    LOW: 'bg-secondary text-muted-foreground border-border/50',
};

const COMP_STYLES = {
    LOW: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    HIGH: 'bg-red-500/15 text-red-400 border-red-500/30',
};

function CardSkeleton() {
    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </CardContent>
        </Card>
    );
}

function IdeaCard({ idea, index }: { idea: VideoIdea; index: number }) {
    const [hookOpen, setHookOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            layout
        >
            <Card className="bg-card/50 border-border/50 overflow-hidden h-full hover:border-primary/30 transition-colors group">
                <CardContent className="p-5 flex flex-col h-full space-y-3">
                    {/* Title row */}
                    <div className="flex items-start gap-2">
                        <p className="font-bold text-sm leading-snug line-clamp-2 flex-1">
                            {idea.title}
                        </p>
                        {idea.isShortFormVariant && (
                            <span aria-label="Short-form variant possible">
                                <ZapIcon
                                    size={14}
                                    className="text-pink-400 shrink-0 mt-0.5"
                                />
                            </span>
                        )}
                    </div>

                    {/* Format + Difficulty badges */}
                    <div className="flex flex-wrap gap-1.5">
                        <Badge
                            variant="outline"
                            className={`text-[10px] font-bold border ${FORMAT_STYLES[idea.format]}`}
                        >
                            {idea.format.replace('_', ' ')}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`text-[10px] font-bold border ${DIFFICULTY_STYLES[idea.difficulty]}`}
                        >
                            {idea.difficulty}
                        </Badge>
                    </div>

                    {/* Target audience */}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground/60">Audience: </span>
                        {idea.targetAudience}
                    </p>

                    {/* Why it will perform */}
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                        {idea.whyItWillPerform}
                    </p>

                    {/* Bottom row signals */}
                    <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-border/20">
                        <Badge
                            variant="outline"
                            className="text-[10px] flex items-center gap-1 border border-border/40 text-muted-foreground"
                        >
                            <ClockIcon size={9} />
                            {idea.estimatedProductionHours}h
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`text-[10px] font-bold border ${DEMAND_STYLES[idea.searchDemandSignal]}`}
                        >
                            {idea.searchDemandSignal} Demand
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`text-[10px] font-bold border ${COMP_STYLES[idea.competitionSignal]}`}
                        >
                            {idea.competitionSignal} Comp.
                        </Badge>
                    </div>

                    {/* Hook suggestion — collapsible */}
                    <div className="border-t border-border/20 pt-2">
                        <button
                            onClick={() => setHookOpen((prev) => !prev)}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors w-full text-left"
                        >
                            <ChevronDownIcon
                                size={12}
                                className={`transition-transform ${hookOpen ? 'rotate-180' : ''}`}
                            />
                            Hook idea
                        </button>

                        <AnimatePresence>
                            {hookOpen && (
                                <motion.p
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-xs text-primary/80 italic mt-2 leading-relaxed overflow-hidden"
                                >
                                    {idea.hookSuggestion}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

const TABS: { id: FilterTab; label: string }[] = [
    { id: 'ALL', label: 'All Ideas' },
    { id: 'EASY', label: '⚡ Easy' },
    { id: 'SHORT_FORM', label: '📱 Short-Form' },
    { id: 'HIGH_DEMAND', label: '🔥 High Demand' },
];

export function VideoIdeasBoard({ ideas, isLoading }: Props) {
    const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex gap-2">
                    {TABS.map((t) => (
                        <Skeleton key={t.id} className="h-9 w-24 rounded-lg" />
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    const filtered = ideas.filter((idea) => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'EASY') return idea.difficulty === 'EASY';
        if (activeTab === 'SHORT_FORM')
            return idea.format === 'SHORT_FORM' || idea.isShortFormVariant;
        if (activeTab === 'HIGH_DEMAND') return idea.searchDemandSignal === 'HIGH';
        return true;
    });

    return (
        <div className="space-y-5">
            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {TABS.map((tab) => (
                    <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-lg text-xs font-bold transition-all ${activeTab === tab.id
                            ? 'shadow-[0_0_12px_rgba(var(--primary)/0.3)]'
                            : 'border-border/50 text-muted-foreground'
                            }`}
                    >
                        {tab.label}
                        {activeTab !== tab.id && (
                            <span className="ml-1.5 text-muted-foreground/50 text-[10px]">
                                {ideas.filter((idea) => {
                                    if (tab.id === 'ALL') return true;
                                    if (tab.id === 'EASY') return idea.difficulty === 'EASY';
                                    if (tab.id === 'SHORT_FORM')
                                        return idea.format === 'SHORT_FORM' || idea.isShortFormVariant;
                                    if (tab.id === 'HIGH_DEMAND')
                                        return idea.searchDemandSignal === 'HIGH';
                                    return true;
                                }).length}
                            </span>
                        )}
                    </Button>
                ))}
            </div>

            {/* Ideas grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                    {filtered.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                            No ideas match this filter.
                        </div>
                    ) : (
                        filtered.map((idea, i) => (
                            <IdeaCard key={idea.title} idea={idea} index={i} />
                        ))
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
