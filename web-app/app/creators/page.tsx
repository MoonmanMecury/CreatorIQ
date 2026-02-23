"use client";

import { useState } from "react";
import Link from "next/link";
import { useCreator } from "@/features/creators/use-creator";
import { CreatorHeader } from "@/features/creators/components/creator-header";
import { EngagementBreakdown } from "@/features/creators/components/engagement-breakdown";
import { AudienceOverview } from "@/features/creators/components/audience-overview";
import { CompetitionDensityIndicator } from "@/features/creators/components/competition-density";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, ZapIcon } from "lucide-react";
import { ChannelSearchBar } from "@/features/creators/components/ChannelSearchBar";
import { AttackEngineDashboard } from "@/features/creators/opportunity/components/AttackEngineDashboard";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card"; // Added Card import

export default function CreatorsPage() {
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const { data: creatorData, isLoading: isCreatorLoading, error: creatorError } = useCreator(selectedChannelId);

    // Map live data to component formats
    const mappedProfile = creatorData?.channel ? {
        name: creatorData.channel.channelName,
        followers: ((creatorData.channel.subscriberCount || 0) / 1000000).toFixed(1) + 'M',
        engagement_rate: ((creatorData.channel.averageEngagementRate || 0) * 100).toFixed(1) + '%',
        growth_rate: creatorData.growthTrajectory === 'ACCELERATING' ? '+12.4%' : (creatorData.growthTrajectory === 'GROWING' ? '+4.2%' : '+0.8%'),
    } : null;

    const mappedPosts = creatorData?.recentVideos ? creatorData.recentVideos.slice(0, 8).map(v => ({
        id: v.title.substring(0, 10) + '...',
        type: 'Video',
        engagement: Math.round((v.engagementRate || 0) * 1000) / 10
    })) : [];

    const mappedTrend = creatorData?.recentVideos ? [...creatorData.recentVideos].reverse().map(v => ({
        date: v.publishDate ? new Date(v.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
        rate: (v.engagementRate || 0) * 100
    })) : [];

    const mappedDensity = creatorData ? {
        saturation_score: creatorData.nichePosition === 'DOMINANT' ? 88 : (creatorData.nichePosition === 'ESTABLISHED' ? 65 : 34),
        status: creatorData.nichePosition || 'NEWCOMER',
        color: creatorData.nichePosition === 'DOMINANT' ? 'text-rose-500' : 'text-emerald-500'
    } : null;

    return (
        <div className="container mx-auto p-6 space-y-12 animate-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight">Channel Intelligence</h1>
                    <p className="text-muted-foreground text-lg">Deep dive into creator performance and exploitable market gaps.</p>
                </div>

                <div className="w-full md:w-[400px]">
                    <ChannelSearchBar onSelect={(id) => setSelectedChannelId(id)} />
                </div>
            </header>

            {!selectedChannelId ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-[3.5rem] border-2 border-dashed border-border/40 bg-muted/5 text-center gap-6 group hover:border-primary/20 transition-all">
                    <div className="w-24 h-24 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform">
                        🔎
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black tracking-tight">Select a Creator to Begin</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto text-lg">
                            Use the search bar above to fetch real-time performance benchmarks and strategic attack opportunities.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Live Analysis Section */}
                    <div className="space-y-8 animate-in fade-in zoom-in duration-1000">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Channel Performance</h3>
                        </div>

                        {isCreatorLoading ? (
                            <div className="space-y-8">
                                <Skeleton className="h-40 w-full rounded-3xl" />
                                <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
                                    <Skeleton className="lg:col-span-4 h-[400px] rounded-3xl" />
                                    <Skeleton className="lg:col-span-2 h-[400px] rounded-3xl" />
                                </div>
                            </div>
                        ) : creatorError || !creatorData || !mappedProfile ? (
                            <div className="py-20 text-center border-2 border-dashed border-destructive/20 rounded-[3rem] bg-destructive/5">
                                <p className="text-destructive font-bold text-xl">Analysis system offline</p>
                                <p className="text-muted-foreground mt-2">We couldn't reach the YouTube data engine for this channel.</p>
                            </div>
                        ) : (
                            <>
                                <CreatorHeader profile={mappedProfile as any} />
                                <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
                                    <EngagementBreakdown
                                        posts={mappedPosts}
                                        trend={mappedTrend}
                                    />
                                    {creatorData.audience_overview ? (
                                        <AudienceOverview
                                            regions={creatorData.audience_overview.regions}
                                            ageSegments={creatorData.audience_overview.age_segments}
                                        />
                                    ) : (
                                        <div className="lg:col-span-2 p-8 border border-dashed rounded-3xl flex items-center justify-center text-muted-foreground italic text-sm">
                                            Demographic data unavailable
                                        </div>
                                    )}
                                </div>
                                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    <CompetitionDensityIndicator density={mappedDensity as any} />

                                    {/* Strategy Insights Summary */}
                                    <Card className="p-6 border-primary/10 bg-primary/5 flex flex-col justify-center gap-4">
                                        <div className="flex items-center gap-2 text-primary">
                                            <ZapIcon size={18} className="fill-current" />
                                            <span className="text-xs font-black uppercase tracking-widest">Health Verdict</span>
                                        </div>
                                        <div className="text-3xl font-black tracking-tighter">
                                            {creatorData.channelHealthScore}/100
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-snug">
                                            {creatorData.strategyInsights[0]?.insight || 'Channel performance is being computed from live signals.'}
                                        </p>
                                    </Card>

                                    <Card className="p-6 border-border/40 bg-card/30 flex flex-col justify-center gap-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <ArrowRight size={18} />
                                            <span className="text-xs font-black uppercase tracking-widest">Growth Pace</span>
                                        </div>
                                        <div className="text-3xl font-black tracking-tighter uppercase">
                                            {creatorData.growthTrajectory}
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-snug">
                                            View velocity across the last 20 videos indicates a {creatorData.growthTrajectory.toLowerCase()} trend.
                                        </p>
                                    </Card>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-8">
                        <Separator className="mb-16 opacity-20" />

                        <div className="space-y-4 mb-12">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Live Intelligence
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                                    <ZapIcon className="text-primary fill-current" size={24} />
                                    Opportunity Attack Engine
                                </h2>
                            </div>
                            <p className="text-muted-foreground max-w-2xl">
                                Our real-time engine analyzes the gap between this creator&rsquo;s content focus and global search/news demand to identify your unfair advantages.
                            </p>
                        </div>

                        <AttackEngineDashboard channelId={selectedChannelId} />
                    </div>
                </>
            )}

            {/* Cross-feature CTA */}
            <div className="flex justify-center pt-12 border-t border-border/30">
                <Link href="/strategy">
                    <Button
                        size="lg"
                        className="px-10 py-7 rounded-2xl text-lg font-black gap-3 shadow-[0_20px_40px_rgba(var(--primary)/0.3)] hover:shadow-[0_25px_50px_rgba(var(--primary)/0.4)] transition-all"
                    >
                        Generate Content Strategy
                        <ArrowRight size={20} />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
