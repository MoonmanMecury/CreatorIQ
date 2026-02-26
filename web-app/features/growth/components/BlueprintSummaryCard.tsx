/**
 * @file BlueprintSummaryCard.tsx
 * Executive summary and high-level stats for the growth roadmap.
 */

import { GrowthBlueprint } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { QuotesIcon, ZapIcon, Clock01Icon, Calendar01Icon } from 'hugeicons-react';
import { motion } from 'framer-motion';
import { LLMEnhancedBadge } from '@/components/conductor/LLMEnhancedBadge';
import { LLMProvider } from '@/features/conductor/types';

interface Props {
    data: GrowthBlueprint | undefined;
    isLoading: boolean;
}

export function BlueprintSummaryCard({ data, isLoading }: Props) {
    if (isLoading) {
        return (
            <Card className="border-border/60 bg-card/30 backdrop-blur-sm">
                <CardContent className="p-8 space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-3 gap-6">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    return (
        <Card className="border-border/60 bg-card/30 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <ZapIcon size={120} />
            </div>

            <CardContent className="p-8 space-y-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold">
                                Project Roadmap
                            </Badge>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">
                                {data.currentStage} STAGE
                            </Badge>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mt-2 flex items-center gap-3">
                            Growth Blueprint: {data.keyword}
                            <LLMEnhancedBadge
                                isEnhanced={!!data.isEnhanced}
                                provider={data.llmProvider as LLMProvider}
                                modelName={data.llmModel}
                            />
                        </h2>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-muted/20 p-6 rounded-2xl border border-border/40 italic text-lg leading-relaxed text-muted-foreground"
                >
                    <QuotesIcon className="absolute -top-3 -left-2 text-primary/40 rotate-180" size={24} />
                    {data.executiveSummary}
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl border border-border/40 bg-background/50 flex flex-col items-center text-center space-y-2 group hover:border-primary/30 transition-colors">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <Calendar01Icon size={24} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Authority Milestone</p>
                            <p className="text-3xl font-black">{data.projectedAuthorityWeeks} Weeks</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-border/40 bg-background/50 flex flex-col items-center text-center space-y-2 group hover:border-orange-500/30 transition-colors">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                            <Clock01Icon size={24} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Weekly Commitment (Start)</p>
                            <p className="text-3xl font-black">{data.totalWeeklyHoursAtLaunch}h / week</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-border/40 bg-background/50 flex flex-col items-center text-center space-y-2 group hover:border-emerald-500/30 transition-colors">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                            <ZapIcon size={24} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Weekly Commitment (Scale)</p>
                            <p className="text-3xl font-black">{data.totalWeeklyHoursAtScale}h / week</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
