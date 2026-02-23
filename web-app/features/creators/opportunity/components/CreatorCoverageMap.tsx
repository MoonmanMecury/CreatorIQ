import { TopicOverlapResult } from '../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreatorCoverageMapProps {
    overlapResults: TopicOverlapResult[];
    isLoading: boolean;
}

export function CreatorCoverageMap({ overlapResults, isLoading }: CreatorCoverageMapProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
        );
    }

    const categories = {
        COVERED_HOT: overlapResults.filter(r => r.classification === 'COVERED_HOT'),
        COVERED_COOLING: overlapResults.filter(r => r.classification === 'COVERED_COOLING'),
        HOT_IGNORED: overlapResults.filter(r => r.classification === 'HOT_IGNORED'),
        IRRELEVANT: overlapResults.filter(r => r.classification === 'IRRELEVANT')
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Hot Ignored - The Attack Zone */}
            <Card className="p-4 border-rose-500/20 bg-rose-500/5 flex flex-col h-64">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black uppercase tracking-tighter text-rose-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Hot but Ignored
                    </h4>
                    <Badge variant="outline" className="text-[10px] border-rose-500/30 text-rose-500">
                        {categories.HOT_IGNORED.length}
                    </Badge>
                </div>
                <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-4">
                        {categories.HOT_IGNORED.map(item => (
                            <div
                                key={item.topic}
                                className="flex justify-between items-center p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 cursor-pointer hover:bg-rose-500/20 transition-all font-bold text-xs text-rose-100"
                                onClick={() => document.getElementById(`opp_${item.topic.toLowerCase().replace(/\s+/g, '_')}`)?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <span>{item.topic}</span>
                                <span className="text-[10px] opacity-70">{Math.round(item.demandStrength)}</span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Covered Cooling */}
            <Card className="p-4 border-amber-500/20 bg-amber-500/5 flex flex-col h-64">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black uppercase tracking-tighter text-amber-500">Covered but Cooling</h4>
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">
                        {categories.COVERED_COOLING.length}
                    </Badge>
                </div>
                <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-4">
                        {categories.COVERED_COOLING.map(item => (
                            <div key={item.topic} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-100/70">
                                <div>{item.topic}</div>
                                {item.creatorCoverage && (
                                    <div className="text-[9px] mt-1 opacity-50">Last: {new Date(item.creatorCoverage.lastCoveredAt).toLocaleDateString()}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Covered Hot */}
            <Card className="p-4 border-emerald-500/20 bg-emerald-500/5 flex flex-col h-64">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black uppercase tracking-tighter text-emerald-500">Covered & Hot</h4>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500">
                        {categories.COVERED_HOT.length}
                    </Badge>
                </div>
                <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-4">
                        {categories.COVERED_HOT.map(item => (
                            <div key={item.topic} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-100/70">
                                {item.topic}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Irrelevant */}
            <Card className="p-4 border-border/20 bg-muted/5 flex flex-col h-64 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black uppercase tracking-tighter text-muted-foreground">Irrelevant</h4>
                    <Badge variant="outline" className="text-[10px] border-border/30 text-muted-foreground">
                        {categories.IRRELEVANT.length}
                    </Badge>
                </div>
                <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-4">
                        {categories.IRRELEVANT.map(item => (
                            <div key={item.topic} className="p-1 rounded bg-muted/20 text-[10px] text-muted-foreground">
                                {item.topic}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>
        </div>
    );
}
