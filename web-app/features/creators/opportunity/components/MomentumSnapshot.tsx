import { MomentumData } from '../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, ZapIcon } from 'lucide-react';

interface MomentumSnapshotProps {
    momentum: MomentumData | undefined;
    isLoading: boolean;
}

export function MomentumSnapshot({ momentum, isLoading }: MomentumSnapshotProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
        );
    }

    if (!momentum) return null;

    const cadenceColor = momentum.uploadCadenceTrend === 'ACCELERATING' ? 'text-emerald-500' : (momentum.uploadCadenceTrend === 'SLOWING' ? 'text-rose-500' : 'text-blue-500');
    const velocityColor = momentum.viewVelocityTrend === 'GROWING' ? 'text-emerald-500' : (momentum.viewVelocityTrend === 'DECLINING' ? 'text-rose-500' : 'text-blue-500');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Upload Cadence */}
            <Card className="p-4 border-border/40 bg-card/30 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Upload Cadence</p>
                    {momentum.uploadCadenceTrend === 'ACCELERATING' && <ArrowUpIcon size={14} className="text-emerald-500" />}
                    {momentum.uploadCadenceTrend === 'SLOWING' && <ArrowDownIcon size={14} className="text-rose-500" />}
                    {momentum.uploadCadenceTrend === 'STABLE' && <MinusIcon size={14} className="text-blue-500" />}
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{momentum.uploadsLast30Days}</span>
                    <span className="text-xs text-muted-foreground">/ last 30d</span>
                </div>
                <Badge variant="outline" className={`mt-2 font-mono text-[10px] ${cadenceColor} border-current/20 bg-current/5`}>
                    {momentum.uploadCadenceTrend}
                </Badge>
            </Card>

            {/* View Velocity */}
            <Card className="p-4 border-border/40 bg-card/30 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">View Velocity</p>
                    <ZapIcon size={14} className={velocityColor} />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{momentum.avgViewsLast30Days.toLocaleString()}</span>
                    <p className="text-[10px] text-muted-foreground">avg views</p>
                </div>
                <Badge variant="outline" className={`mt-2 font-mono text-[10px] ${velocityColor} border-current/20 bg-current/5`}>
                    {momentum.viewVelocityTrend}
                </Badge>
            </Card>

            {/* Engagement */}
            <Card className="p-4 border-border/40 bg-card/30 backdrop-blur-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Engagement</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">Stable</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Relative to competitors</p>
            </Card>

            {/* Top Topic */}
            <Card className="p-4 border-border/40 bg-card/30 backdrop-blur-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Hero Topic</p>
                <div className="truncate text-sm font-bold text-primary">
                    {momentum.topPerformingTopicLast30Days}
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground truncate">
                    Weakest: <span className="text-rose-400 opacity-80">{momentum.slowestTopicLast30Days}</span>
                </div>
            </Card>
        </div>
    );
}
