import { AttackOpportunity } from '../types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BrainIcon, ArrowRightIcon } from 'lucide-react';

interface StrategicSummaryPanelProps {
    summary: string | undefined;
    topOpportunity: AttackOpportunity | null | undefined;
    totalHotIgnored: number | undefined;
    isLoading: boolean;
}

export function StrategicSummaryPanel({ summary, topOpportunity, totalHotIgnored, isLoading }: StrategicSummaryPanelProps) {
    if (isLoading) {
        return (
            <Card className="p-6 border-primary/20 bg-primary/5">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-20 w-full" />
                    <div className="flex gap-4">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>
            </Card>
        );
    }

    if (!summary) return null;

    return (
        <Card className="p-6 border-primary/20 bg-primary/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <BrainIcon size={120} />
            </div>

            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2 text-primary">
                    <BrainIcon size={20} className="fill-current" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Strategic Analysis</h3>
                </div>

                <blockquote className="text-xl font-medium tracking-tight border-l-4 border-primary/30 pl-6 py-2 leading-relaxed max-w-4xl italic text-foreground/90">
                    &ldquo;{summary}&rdquo;
                </blockquote>

                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full px-4 py-1.5 font-bold bg-rose-500/10 text-rose-500 border-rose-500/20">
                            {totalHotIgnored} Attack Targets
                        </Badge>
                        <Badge variant="secondary" className="rounded-full px-4 py-1.5 font-bold bg-primary/10 text-primary border-primary/20">
                            {topOpportunity?.opportunityScore}% Top Score
                        </Badge>
                        <Badge variant="secondary" className="rounded-full px-4 py-1.5 font-bold bg-amber-500/10 text-amber-500 border-amber-500/20">
                            {topOpportunity?.urgency} Urgency
                        </Badge>
                    </div>

                    {topOpportunity && (
                        <Button
                            variant="ghost"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 font-bold gap-2 shadow-lg shadow-primary/20"
                            onClick={() => document.getElementById(`opp_${topOpportunity.topic.toLowerCase().replace(/\s+/g, '_')}`)?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Start With: {topOpportunity.topic}
                            <ArrowRightIcon size={16} />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
