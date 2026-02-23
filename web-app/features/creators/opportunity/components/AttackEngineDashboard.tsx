import { useAttackEngine } from '../hooks/useAttackEngine';
import { StrategicSummaryPanel } from './StrategicSummaryPanel';
import { MomentumSnapshot } from './MomentumSnapshot';
import { AttackOpportunitiesCard } from './AttackOpportunitiesCard';
import { CreatorCoverageMap } from './CreatorCoverageMap';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon, AlertTriangleIcon, ActivityIcon } from 'lucide-react';

interface AttackEngineDashboardProps {
    channelId: string | null;
}

export function AttackEngineDashboard({ channelId }: AttackEngineDashboardProps) {
    const { data, isLoading, isError, error, refetch, isFetching } = useAttackEngine(channelId);

    if (!channelId) {
        return (
            <div className="flex flex-col items-center justify-center py-24 rounded-[3rem] border-2 border-dashed border-border/40 bg-muted/5 text-center transition-all">
                <div className="p-6 rounded-full bg-primary/5 text-primary/40 mb-6">
                    <ActivityIcon size={48} />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-foreground/70">Awaiting Search Input</h3>
                <p className="text-muted-foreground mt-2 max-w-sm text-lg">
                    Enter or select a YouTube channel above to initialize the Opportunity Attack Engine.
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 rounded-[3rem] border-2 border-dashed border-destructive/20 bg-destructive/5 text-center">
                <AlertTriangleIcon size={48} className="text-destructive mb-4" />
                <h3 className="text-xl font-bold text-destructive">Attack Engine Failure</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                    {error.message || 'An error occurred while running the intelligence pipeline.'}
                </p>
                <Button variant="outline" className="mt-6 font-bold" onClick={() => refetch()}>
                    Retry Pipeline Analysis
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-16 animate-in fade-in duration-1000">
            {/* Header Area */}
            <div className="space-y-6">
                <StrategicSummaryPanel
                    summary={data?.strategicSummary}
                    topOpportunity={data?.topUrgentOpportunity}
                    totalHotIgnored={data?.totalHotIgnoredTopics}
                    isLoading={isLoading}
                />
            </div>

            {/* Performance Snapshot */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                    <span className="text-blue-400">◆</span>
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Momentum & Performance</h3>
                </div>
                <MomentumSnapshot momentum={data?.momentumData} isLoading={isLoading} />
            </section>

            {/* Main Attack Cards */}
            <AttackOpportunitiesCard
                opportunities={data?.attackOpportunities || []}
                isLoading={isLoading}
            />

            {/* Market Context Map */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                    <span className="text-amber-400">◆</span>
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Creator Coverage vs Market Opportunity</h3>
                </div>
                <CreatorCoverageMap overlapResults={data?.overlapResults || []} isLoading={isLoading} />
            </section>

            {/* Footer / Data Freshness */}
            <div className="flex justify-between items-center px-2 py-8 border-t border-border/30">
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Analyzed At: {data?.analyzedAt ? new Date(data.analyzedAt).toLocaleTimeString() : 'N/A'}</span>
                    <span className="opacity-30">|</span>
                    <span>Data Freshness: {data?.dataFreshness.youtubeDataAge}m (YT) / {data?.dataFreshness.pytrendsDataAge}m (Trends)</span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isFetching || isLoading}
                    className="text-[10px] font-black uppercase tracking-widest gap-2 bg-muted/20 hover:bg-muted/40"
                    onClick={() => refetch()}
                >
                    <RefreshCwIcon size={12} className={isFetching ? 'animate-spin' : ''} />
                    Refresh Intelligence
                </Button>
            </div>
        </div>
    );
}
