"use client";

<<<<<<< HEAD
import { useState } from "react";
import Link from "next/link";
import { useTrends } from "@/features/trends/use-trends";
import { useOpportunities } from "@/features/opportunities/hooks/useOpportunities";
=======
import { useState, useEffect } from "react";
import { useTrends } from "@/features/trends/use-trends";
import { useInsights } from "@/features/insights/hooks/useInsights";
>>>>>>> a6efc04bd4c419510ba665453a4a7a5a93945dc6
import { OverviewCards } from "@/features/trends/components/overview-cards";
import { TrendVisualization } from "@/features/trends/components/trend-visualization";
import { KeywordClusterPanel } from "@/features/trends/components/keyword-cluster-panel";
import { OpportunityInsightsPanel } from "@/features/trends/components/opportunity-insights-panel";
import { SubtopicPanel } from "@/features/trends/components/subtopic-panel";
import { YouTubeMetricsPanel } from "@/features/trends/components/youtube-metrics-panel";
<<<<<<< HEAD
import { OpportunityScoreCard } from "@/features/opportunities/components/OpportunityScoreCard";
import { CompetitionWeaknessPanel } from "@/features/opportunities/components/CompetitionWeaknessPanel";
import { BreakoutVideosList } from "@/features/opportunities/components/BreakoutVideosList";
import { UnderservedKeywordsList } from "@/features/opportunities/components/UnderservedKeywordsList";
import { useMonetization } from "@/features/monetization/hooks/useMonetization";
import { MonetizationScoreCard } from "@/features/monetization/components/MonetizationScoreCard";
import { MonetizationBreakdownPanel } from "@/features/monetization/components/MonetizationBreakdownPanel";
import { RevenuePathwaysPanel } from "@/features/monetization/components/RevenuePathwaysPanel";
import { OpportunitiesRisksPanel } from "@/features/monetization/components/OpportunitiesRisksPanel";
=======
import { OpportunityPanel } from "@/features/insights/components/OpportunityPanel";
import { MarketSnapshotCards } from "@/features/insights/components/MarketSnapshotCards";
>>>>>>> a6efc04bd4c419510ba665453a4a7a5a93945dc6
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search01Icon, ZapIcon, BankIcon } from "hugeicons-react";
import { ArrowRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Debounce hook — delays triggering insights fetch while user is still typing
// ---------------------------------------------------------------------------
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TrendsPage() {
    // Existing trends search (form submit driven)
    const [searchTopic, setSearchTopic] = useState("Next.js");
    const [inputValue, setInputValue] = useState("Next.js");

<<<<<<< HEAD
    // Core trend data (search demand + basic metrics)
    const { data: trendData, isLoading: isTrendLoading, isPlaceholderData, error: trendError } = useTrends(searchTopic);

    // Detailed gap analysis and creator opportunities
    const { data: opportunityData, isLoading: isOppLoading, refetch: refetchOpp } = useOpportunities(searchTopic);

    // Monetization intelligence
    const { data: monetizationData, isLoading: isMonLoading } = useMonetization(searchTopic);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
=======
    // New insights search (debounced, separate controlled input)
    const [insightKeyword, setInsightKeyword] = useState("");
    const debouncedInsightKeyword = useDebounce(insightKeyword, 500);
    const { data: insightsData, isLoading: insightsLoading, isError: insightsError } =
        useInsights(debouncedInsightKeyword || null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
>>>>>>> a6efc04bd4c419510ba665453a4a7a5a93945dc6
        if (inputValue.trim()) {
            setSearchTopic(inputValue.trim());
        }
    };

<<<<<<< HEAD
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
=======
    // ---- Empty state message for insights section ----
    const showInsightsEmpty = !insightKeyword.trim();
    const showInsightsError = insightsError && !insightsLoading;

    return (
        <div className="container mx-auto p-6 space-y-10 animate-in fade-in duration-700">
            {/* ---------------------------------------------------------------- */}
            {/* Header + existing search                                          */}
            {/* ---------------------------------------------------------------- */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Trend & Niche Discovery</h1>
                    <p className="text-muted-foreground">
                        Identify high-growth market opportunities combining Search Demand + YouTube Supply.
                    </p>
>>>>>>> a6efc04bd4c419510ba665453a4a7a5a93945dc6
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

<<<<<<< HEAD
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
=======
            {/* ---------------------------------------------------------------- */}
            {/* ✦ NEW: Opportunity Scoring Section                               */}
            {/* ---------------------------------------------------------------- */}
            <section className="space-y-6">
                {/* Section header + keyword input */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                            <span className="text-violet-400">◆</span>
                            Opportunity Intelligence
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Enter a keyword to get a data-driven opportunity score and market breakdown.
                        </p>
                    </div>

                    {/* Insights keyword input — debounced, standalone */}
                    <div className="relative w-full sm:w-80">
                        <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="insights-keyword-input"
                            placeholder="e.g. home workout, AI tools…"
                            className="pl-9"
                            value={insightKeyword}
                            onChange={(e) => setInsightKeyword(e.target.value)}
                        />
>>>>>>> a6efc04bd4c419510ba665453a4a7a5a93945dc6
                    </div>
                </div>

                {/* Content area */}
                {showInsightsEmpty ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border/60 bg-muted/10 text-center gap-3">
                        <span className="text-4xl">🔍</span>
                        <h3 className="text-lg font-semibold">Analyse a Niche</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Enter a keyword above to analyse its opportunity score, competition level, and market signals.
                        </p>
                    </div>
                ) : showInsightsError ? (
                    /* Error state */
                    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-destructive/30 bg-destructive/5 text-center gap-3">
                        <span className="text-4xl">⚠️</span>
                        <h3 className="text-lg font-semibold text-destructive">Analysis Failed</h3>
                        <p className="text-sm text-muted-foreground">
                            Could not analyse &ldquo;{debouncedInsightKeyword}&rdquo;. Please try a different keyword.
                        </p>
                    </div>
                ) : (
                    /* Score panel + snapshot cards */
                    <div className="space-y-6">
                        {/* Market Snapshot Cards — full width above panel */}
                        <MarketSnapshotCards
                            data={insightsData}
                            isLoading={insightsLoading}
                        />

                        {/* Opportunity Panel — desktop: side by side with a detail col */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <OpportunityPanel
                                    data={insightsData}
                                    isLoading={insightsLoading}
                                />
                            </div>

                            {/* Signal Detail Card */}
                            {(insightsData || insightsLoading) && (
                                <div className="lg:col-span-2 flex flex-col gap-4">
                                    {insightsLoading ? (
                                        <>
                                            <Skeleton className="h-6 w-40" />
                                            <div className="grid grid-cols-2 gap-4">
                                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                                    <div key={i} className="space-y-1.5 p-4 rounded-xl border border-border/40 bg-card/30">
                                                        <Skeleton className="h-3 w-24" />
                                                        <Skeleton className="h-6 w-16" />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : insightsData ? (
                                        <>
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                Raw Signal Detail
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {[
                                                    { label: "Growth Rate", value: `${insightsData.signals.trend.growthRate}%` },
                                                    { label: "Avg Engagement", value: `${insightsData.signals.creator.avgEngagement}/100` },
                                                    { label: "Top Ch. Subs", value: insightsData.signals.creator.topChannelSubs >= 1_000_000 ? `${(insightsData.signals.creator.topChannelSubs / 1_000_000).toFixed(1)}M` : `${(insightsData.signals.creator.topChannelSubs / 1_000).toFixed(0)}K` },
                                                    { label: "Video Count", value: insightsData.signals.creator.videoCount >= 1_000_000 ? `${(insightsData.signals.creator.videoCount / 1_000_000).toFixed(1)}M` : `${(insightsData.signals.creator.videoCount / 1_000).toFixed(0)}K` },
                                                    { label: "Upload Freq.", value: `${insightsData.signals.creator.uploadFrequency}/wk` },
                                                    { label: "Regional Strength", value: `${insightsData.signals.trend.regionalStrength}/100` },
                                                ].map((item) => (
                                                    <div
                                                        key={item.label}
                                                        className="p-4 rounded-xl border border-border/40 bg-card/30 hover:border-border/70 transition-colors"
                                                    >
                                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                                                            {item.label}
                                                        </p>
                                                        <p className="text-lg font-bold tabular-nums">{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Existing Trends Section                                           */}
            {/* ---------------------------------------------------------------- */}
            <section className="space-y-8">
                <div className="flex items-center gap-2">
                    <span className="text-blue-400">◆</span>
                    <h2 className="text-xl font-semibold tracking-tight">Trend Analytics</h2>
                </div>

                {isLoading ? (
                    <div className="space-y-8">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
                        </div>
                        <Skeleton className="h-[400px] w-full" />
                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                            <Skeleton className="h-[300px] w-full" />
                            <Skeleton className="h-[300px] w-full" />
                        </div>
                    </div>
                ) : error || !data ? (
                    <div className="text-center py-20 border rounded-xl bg-muted/20">
                        <h2 className="text-2xl font-bold text-destructive">Error Loading Data</h2>
                        <p className="text-muted-foreground mt-2">
                            Could not fetch data for &ldquo;{searchTopic}&rdquo;. Please try another keyword.
                        </p>
                        <Button variant="outline" className="mt-6" onClick={() => setSearchTopic("Next.js")}>
                            Reset to Default
                        </Button>
                    </div>
                ) : (
                    <div className={`space-y-8 transition-opacity duration-300 ${isPlaceholderData ? "opacity-50" : "opacity-100"}`}>
                        <OverviewCards
                            score={data.niche_score || data.score}
                            velocity={data.trend_velocity}
                            density={data.competition_density}
                            revenue={data.revenue_potential}
                            topRegions={data.top_regions}
                        />

                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
                            <div className="lg:col-span-4 space-y-6">
                                <TrendVisualization data={data.trend_data} />
                                <SubtopicPanel subtopics={data.subtopics} />
                                <KeywordClusterPanel clusters={data.keyword_clusters} />
                            </div>
                            <div className="lg:col-span-2 space-y-6">
                                <OpportunityInsightsPanel insights={data.opportunity_insights} />
                                <YouTubeMetricsPanel metrics={data.youtube_metrics} />
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

