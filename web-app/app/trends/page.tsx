"use client";

import { useState } from "react";
import Link from "next/link";
import { useTrends } from "@/features/trends/use-trends";
import { useOpportunities } from "@/features/opportunities/hooks/useOpportunities";
import { OverviewCards } from "@/features/trends/components/overview-cards";
import { TrendVisualization } from "@/features/trends/components/trend-visualization";
import { KeywordClusterPanel } from "@/features/trends/components/keyword-cluster-panel";
import { OpportunityInsightsPanel } from "@/features/trends/components/opportunity-insights-panel";
import { SubtopicPanel } from "@/features/trends/components/subtopic-panel";
import { YouTubeMetricsPanel } from "@/features/trends/components/youtube-metrics-panel";
import { OpportunityScoreCard } from "@/features/opportunities/components/OpportunityScoreCard";
import { CompetitionWeaknessPanel } from "@/features/opportunities/components/CompetitionWeaknessPanel";
import { BreakoutVideosList } from "@/features/opportunities/components/BreakoutVideosList";
import { UnderservedKeywordsList } from "@/features/opportunities/components/UnderservedKeywordsList";
import { useMonetization } from "@/features/monetization/hooks/useMonetization";
import { MonetizationScoreCard } from "@/features/monetization/components/MonetizationScoreCard";
import { MonetizationBreakdownPanel } from "@/features/monetization/components/MonetizationBreakdownPanel";
import { RevenuePathwaysPanel } from "@/features/monetization/components/RevenuePathwaysPanel";
import { OpportunitiesRisksPanel } from "@/features/monetization/components/OpportunitiesRisksPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search01Icon, ZapIcon, BankIcon } from "hugeicons-react";
import { ArrowRight } from "lucide-react";

export default function TrendsPage() {
    const [searchTopic, setSearchTopic] = useState("Next.js");
    const [inputValue, setInputValue] = useState("Next.js");

    // Core trend data (search demand + basic metrics)
    const { data: trendData, isLoading: isTrendLoading, isPlaceholderData, error: trendError } = useTrends(searchTopic);

    // Detailed gap analysis and creator opportunities
    const { data: opportunityData, isLoading: isOppLoading, refetch: refetchOpp } = useOpportunities(searchTopic);

    // Monetization intelligence
    const { data: monetizationData, isLoading: isMonLoading } = useMonetization(searchTopic);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputValue.trim()) {
            setSearchTopic(inputValue.trim());
        }
    };

    const handleKeywordClick = (keyword: string) => {
        setInputValue(keyword);
        setSearchTopic(keyword);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isLoading = isTrendLoading; // Main page primary loader

    return (
        <div className="container mx-auto p-6 space-y-12 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        <ZapIcon size={14} className="fill-current" />
                        <span>Intelligence v1.2 Active</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight tracking-tighter sm:text-5xl">Trend & Niche Discovery</h1>
                        <p className="mt-2 text-lg text-muted-foreground">Combining Google Search Demand + YouTube Platform Supply.</p>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex w-full md:w-auto items-center gap-2">
                    <div className="relative w-full md:w-96">
                        <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Enter a keyword (e.g. AI Agents, Sustainable Fashion)"
                            className="h-12 pl-10 text-base"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                    <Button type="submit" size="lg" disabled={isLoading} className="px-8 font-bold">
                        {isLoading ? "Analyzing..." : "Analyze Niche"}
                    </Button>
                </form>
            </header>

            {isLoading ? (
                <div className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                    </div>
                    <Skeleton className="h-[500px] w-full rounded-2xl" />
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        <Skeleton className="h-[350px] w-full rounded-2xl" />
                        <Skeleton className="h-[350px] w-full rounded-2xl" />
                    </div>
                </div>
            ) : trendError || !trendData ? (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl bg-muted/5">
                    <div className="bg-destructive/10 p-4 rounded-full text-destructive mb-6">
                        <Search01Icon size={40} />
                    </div>
                    <h2 className="text-2xl font-black">Analysis Failed</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm text-center">We couldn't retrieve intelligence for "{searchTopic}". The API might be rate-limited or the topic is too obscure.</p>
                    <div className="flex gap-4 mt-8">
                        <Button variant="default" onClick={() => setSearchTopic("Next.js")}>Try Again</Button>
                        <Button variant="outline" onClick={() => setInputValue("")}>New Search</Button>
                    </div>
                </div>
            ) : (
                <div className={`space-y-16 transition-opacity duration-300 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}>

                    {/* SECTION 1: MARKET OVERVIEW (Demand + Core Metrics) */}
                    <div className="space-y-8">
                        <OverviewCards
                            score={trendData.niche_score || trendData.score}
                            velocity={trendData.trend_velocity}
                            density={trendData.competition_density}
                            revenue={trendData.revenue_potential}
                            topRegions={trendData.top_regions}
                        />

                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
                            <div className="lg:col-span-4 space-y-6">
                                <TrendVisualization data={trendData.trend_data} />
                                <SubtopicPanel subtopics={trendData.subtopics} />
                                <KeywordClusterPanel clusters={trendData.keyword_clusters} />
                            </div>
                            <div className="lg:col-span-2 space-y-6">
                                <OpportunityInsightsPanel insights={trendData.opportunity_insights} />
                                <YouTubeMetricsPanel metrics={trendData.youtube_metrics} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: CREATOR OPPORTUNITY FINDER (Gap Analysis) */}
                    <div className="space-y-10 border-t border-border/50 pt-16">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight">Where You Can Win</h2>
                            <p className="text-muted-foreground max-w-2xl">
                                Detailed gap analysis identifying where existing competition is failing and where new creators are breaking through.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <OpportunityScoreCard data={opportunityData} isLoading={isOppLoading} />

                            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                                <CompetitionWeaknessPanel data={opportunityData} isLoading={isOppLoading} />
                                <BreakoutVideosList
                                    videos={opportunityData?.breakoutVideos || []}
                                    isLoading={isOppLoading}
                                />
                            </div>

                            <UnderservedKeywordsList
                                keywords={opportunityData?.underservedKeywords || []}
                                isLoading={isOppLoading}
                                onKeywordClick={handleKeywordClick}
                            />
                        </div>
                    </div>

                    {/* SECTION 3: MONETIZATION INTELLIGENCE */}
                    <div className="space-y-10 border-t border-border/50 pt-16">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-3xl font-black tracking-tight">💰 Monetization Potential</h2>
                            </div>
                            <p className="text-muted-foreground max-w-2xl">
                                Evaluating commercial interest, audience value, and diversified revenue pathways to determine if this niche is a viable business.
                            </p>
                        </div>

                        {!searchTopic ? (
                            <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/5">
                                <p className="text-muted-foreground">Enter a keyword above to evaluate its monetization potential</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="grid gap-6 grid-cols-1 lg:grid-cols-10">
                                    <div className="lg:col-span-4 h-full">
                                        <MonetizationScoreCard data={monetizationData} isLoading={isMonLoading} />
                                    </div>
                                    <div className="lg:col-span-6 h-full">
                                        <MonetizationBreakdownPanel breakdown={monetizationData?.breakdown} isLoading={isMonLoading} />
                                    </div>
                                </div>

                                <RevenuePathwaysPanel paths={monetizationData?.revenuePaths || []} isLoading={isMonLoading} />

                                <OpportunitiesRisksPanel
                                    opportunities={monetizationData?.topOpportunities || []}
                                    risks={monetizationData?.risks || []}
                                    isLoading={isMonLoading}
                                />

                                {/* Generate Content Strategy CTA */}
                                <div className="flex justify-center pt-4">
                                    <Link href={`/strategy?keyword=${encodeURIComponent(searchTopic)}`}>
                                        <Button
                                            size="lg"
                                            className="px-8 font-bold gap-2 shadow-[0_0_20px_rgba(var(--primary)/0.3)] hover:shadow-[0_0_30px_rgba(var(--primary)/0.5)] transition-all"
                                        >
                                            Generate Content Strategy
                                            <ArrowRight size={16} />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

