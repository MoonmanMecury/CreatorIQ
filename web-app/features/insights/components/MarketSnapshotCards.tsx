'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { InsightsResponse } from '../types';

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
    icon: string;
    label: string;
    value: string;
    subtext?: string;
    accent?: string;
}

function StatCard({ icon, label, value, subtext, accent = 'text-violet-400' }: StatCardProps) {
    return (
        <Card className="bg-card/50 backdrop-blur border border-border/50 hover:border-border transition-colors duration-200">
            <CardContent className="pt-5 pb-4 px-5 space-y-3">
                <div className="flex items-center gap-2.5">
                    <span className={`text-xl leading-none ${accent}`}>{icon}</span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {label}
                    </span>
                </div>
                <div className="space-y-0.5">
                    <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
                    {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format large numbers to compact notation (e.g. 1 200 000 → 1.2M). */
function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function MarketSnapshotSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <Card
                    key={i}
                    className="bg-card/50 backdrop-blur border border-border/50"
                >
                    <CardContent className="pt-5 pb-4 px-5 space-y-3">
                        <div className="flex items-center gap-2.5">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="space-y-1">
                            <Skeleton className="h-7 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface MarketSnapshotCardsProps {
    data: InsightsResponse | undefined;
    isLoading: boolean;
}

export function MarketSnapshotCards({ data, isLoading }: MarketSnapshotCardsProps) {
    if (isLoading || !data) return <MarketSnapshotSkeleton />;

    const { trend, creator } = data.signals;

    const cards: StatCardProps[] = [
        {
            icon: '⚡',
            label: 'Trend Velocity',
            value: `${trend.velocity}`,
            subtext: 'Interest acceleration score',
            accent: 'text-violet-400',
        },
        {
            icon: '▶',
            label: 'Avg Video Views',
            value: formatNumber(creator.avgViews),
            subtext: 'Per top result video',
            accent: 'text-blue-400',
        },
        {
            icon: '👥',
            label: 'Small Creator Share',
            value: `${Math.round(creator.smallCreatorRatio * 100)}%`,
            subtext: 'Channels < 100K subs',
            accent: 'text-emerald-400',
        },
        {
            icon: '🔍',
            label: 'Rising Queries',
            value: `${trend.risingQueriesCount}`,
            subtext: 'Breakout related searches',
            accent: 'text-amber-400',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <StatCard key={card.label} {...card} />
            ))}
        </div>
    );
}
