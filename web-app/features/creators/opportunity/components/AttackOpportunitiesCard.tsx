import { AttackOpportunity, UrgencyLevel } from '../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ZapIcon, ChevronDownIcon, CopyIcon, ExternalLinkIcon, FlameIcon, TimerIcon, InfoIcon, ShieldAlertIcon } from 'lucide-react';
import { useState } from 'react';

interface AttackOpportunitiesCardProps {
    opportunities: AttackOpportunity[];
    isLoading: boolean;
}

export function AttackOpportunitiesCard({ opportunities, isLoading }: AttackOpportunitiesCardProps) {
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-96 rounded-[2rem]" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
            </div>
        );
    }

    if (opportunities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-[2rem] bg-muted/5 text-center">
                <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
                    <ShieldAlertIcon size={40} />
                </div>
                <h3 className="text-xl font-bold">No Critical Gaps Detected</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    This channel currently has strong topic coverage across high-demand areas.
                </p>
            </div>
        );
    }

    const topOpp = opportunities[0];
    const restOpps = opportunities.slice(1);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-[pulse_1.5s_infinite]" />
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <ZapIcon size={20} className="text-primary fill-current" />
                    Attack Opportunities
                </h2>
            </div>

            {/* Hero Opportunity */}
            <OpportunityItem opportunity={topOpp} isHero={true} />

            {/* Other Opportunities */}
            <div className="space-y-4">
                {restOpps.map(opp => (
                    <OpportunityItem key={opp.id} opportunity={opp} />
                ))}
            </div>
        </div>
    );
}

function OpportunityItem({ opportunity, isHero = false }: { opportunity: AttackOpportunity, isHero?: boolean }) {
    const [isOpen, setIsOpen] = useState(isHero);

    const urgencyColors: Record<UrgencyLevel, string> = {
        IMMEDIATE: 'bg-rose-500 text-white border-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
        HIGH: 'bg-amber-500 text-black border-amber-600',
        MEDIUM: 'bg-blue-500 text-white border-blue-600',
        LOW: 'bg-slate-500 text-white border-slate-600'
    };

    const isImmediate = opportunity.urgency === 'IMMEDIATE';

    return (
        <Collapsible
            id={opportunity.id}
            open={isOpen}
            onOpenChange={setIsOpen}
            className={`
                group rounded-[2rem] border transition-all duration-500 overflow-hidden
                ${isHero ? 'bg-card shadow-2xl scale-[1.01]' : 'bg-card/40 hover:bg-card/60'}
                ${isImmediate ? 'border-rose-500/50 animate-[pulse_3s_infinite_ease-in-out]' : 'border-border/50'}
            `}
        >
            <CollapsibleTrigger asChild>
                <div className={`p-6 cursor-pointer flex items-center justify-between gap-6 ${isHero ? 'pb-2' : ''}`}>
                    <div className="flex items-center gap-6 flex-1">
                        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border bg-background/50 backdrop-blur-md shadow-inner`}>
                            <span className="text-[10px] uppercase font-black tracking-tighter text-muted-foreground">Score</span>
                            <span className={`text-2xl font-black ${opportunity.opportunityScore > 80 ? 'text-emerald-500' : 'text-primary'}`}>{opportunity.opportunityScore}</span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-xl font-black tracking-tight">{opportunity.topic}</h3>
                                <Badge className={`rounded-md font-black text-[10px] ${urgencyColors[opportunity.urgency]}`}>
                                    {opportunity.urgency}
                                </Badge>
                                <Badge variant="outline" className="rounded-md font-bold text-[10px] bg-background/50">
                                    {opportunity.difficulty} DIFFICULTY
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                <span className="flex items-center gap-1"><FlameIcon size={12} className="text-rose-400" /> {Math.round(opportunity.demandStrength)} Demand</span>
                                <span className="flex items-center gap-1"><TimerIcon size={12} className="text-amber-400" /> {opportunity.creatorAbsenceDays === 999 ? 'NEVER' : `${opportunity.creatorAbsenceDays}d`} Absence</span>
                            </div>
                        </div>
                    </div>

                    {!isHero && (
                        <div className="flex items-center gap-4">
                            <ChevronDownIcon size={20} className={`text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                    )}
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <div className="p-8 pt-4 space-y-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Why it's hot */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-widest">
                                <InfoIcon size={14} /> Market Signal
                            </div>
                            <p className="text-lg font-bold text-foreground/90 leading-snug">
                                {opportunity.whyItsHot}
                            </p>
                        </div>

                        {/* Why vulnerable */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest">
                                <ShieldAlertIcon size={14} /> Creator Gap
                            </div>
                            <p className="text-lg font-bold text-amber-100/80 leading-snug">
                                {opportunity.whyCreatorIsVulnerable}
                            </p>
                        </div>
                    </div>

                    {/* Tactical Angle */}
                    <Card className="p-6 bg-primary/5 border-primary/20 rounded-2xl">
                        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                            <div className="space-y-4 flex-1">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black uppercase text-primary tracking-widest">Recommended Angle</h4>
                                    <p className="text-xl font-black text-primary leading-tight">{opportunity.suggestedAngle}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest">Urgency Detail</h4>
                                    <p className="text-sm text-muted-foreground italic font-medium">{opportunity.urgencyReason}</p>
                                </div>
                            </div>

                            <div className="w-full md:w-80 space-y-3">
                                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest">Target Video Title</h4>
                                <div className="group/code relative p-4 rounded-xl bg-background border border-border/60 font-mono text-sm leading-relaxed text-foreground/90 hover:border-primary/50 transition-all">
                                    {opportunity.sampleVideoTitle}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity h-8 w-8"
                                        onClick={() => navigator.clipboard.writeText(opportunity.sampleVideoTitle)}
                                    >
                                        <CopyIcon size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Source Evidence */}
                    <div className="flex items-center justify-between border-t border-border/50 pt-6">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            Evidence Source: <span className="text-primary">{opportunity.topNewsHeadline}</span>
                        </div>
                        <Button variant="link" className="text-xs font-bold gap-2 text-primary p-0 h-auto" asChild>
                            <a href={opportunity.topNewsUrl} target="_blank" rel="noopener noreferrer">
                                Review Source <ExternalLinkIcon size={12} />
                            </a>
                        </Button>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
